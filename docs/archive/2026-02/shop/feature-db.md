##상품 카테고리 테이블
```aiignore
CREATE TABLE categories (
category_id INT PRIMARY KEY AUTO_INCREMENT,
category_name VARCHAR(50) NOT NULL,
parent_id INT,  -- 상위 카테고리 ID (계층 구조)
depth INT DEFAULT 0,  -- 카테고리 깊이
display_order INT DEFAULT 0,  -- 표시 순서
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (parent_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 상품 테이블
```
CREATE TABLE products (
product_id INT PRIMARY KEY AUTO_INCREMENT,
category_id INT NOT NULL,
product_name VARCHAR(200) NOT NULL,
product_code VARCHAR(50) UNIQUE NOT NULL,  -- 상품 코드
price DECIMAL(10, 2) NOT NULL,
stock_quantity INT DEFAULT 0,  -- 재고 수량
description TEXT,
thumbnail_url VARCHAR(255),
status ENUM('active', 'inactive', 'soldout') DEFAULT 'active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (category_id) REFERENCES categories(category_id),
INDEX idx_category (category_id),
INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

예상 결과: 계층적 카테고리 구조를 지원하고, 상품의 상태와 재고를 관리할 수 있는 테이블이 생성됩니다.
```

## 주문 헤더 테이블
```aiignore
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,  -- 주문 번호
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_memo TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user (user_id),
    INDEX idx_status (order_status),
    INDEX idx_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,  -- 주문 시점의 상품명 보존
    price DECIMAL(10, 2) NOT NULL,  -- 주문 시점의 가격 보존
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,  -- 소계 (가격 * 수량)
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

주의사항: 주문 상세에 상품명과 가격을 중복 저장하는 이유는, 주문 이후 상품 정보가 변경되어도 주문 당시의 정보를 보존하기 위함입니다.


```
## 결제 테이블
```aiignore
-- 결제 정보 테이블
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,  -- 주문과 1:1 관계
    payment_method ENUM('card', 'bank', 'kakao', 'naver') NOT NULL,
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP,
    transaction_id VARCHAR(100),  -- 외부 결제 시스템의 거래 ID
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    INDEX idx_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 재고 관리 트랜잭션
```aiignore
-- 주문 생성 및 재고 차감 프로시저
DELIMITER //

CREATE PROCEDURE create_order(
    IN p_user_id INT,
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_address VARCHAR(255),
    IN p_phone VARCHAR(20),
    OUT p_order_id INT
)
BEGIN
    DECLARE v_price DECIMAL(10, 2);
    DECLARE v_stock INT;
    DECLARE v_order_number VARCHAR(50);

    -- 트랜잭션 시작
    START TRANSACTION;

    -- 재고 확인 (행 잠금)
    SELECT price, stock_quantity INTO v_price, v_stock
    FROM products
    WHERE product_id = p_product_id
    FOR UPDATE;

    -- 재고 부족 체크
    IF v_stock < p_quantity THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '재고가 부족합니다';
    END IF;

    -- 주문 번호 생성
    SET v_order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));

    -- 주문 생성
    INSERT INTO orders (user_id, order_number, total_amount, shipping_address, shipping_phone)
    VALUES (p_user_id, v_order_number, v_price * p_quantity, p_address, p_phone);

    SET p_order_id = LAST_INSERT_ID();

    -- 주문 상세 생성
    INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
    SELECT p_order_id, product_id, product_name, price, p_quantity, price * p_quantity
    FROM products
    WHERE product_id = p_product_id;

    -- 재고 차감
    UPDATE products
    SET stock_quantity = stock_quantity - p_quantity
    WHERE product_id = p_product_id;

    COMMIT;
END //

DELIMITER ;

* 주의 반드시 프로시저로 할 필요는 없습니다. 위에는 예시 입니다.
제가 볼 땐 오히려 멀티 스레드로 처리하는게 속도 측명에서 좋습니다
다만 반드시 동시성 문제를 해결해야합니다 예를 들어 2명 동시 주문 재고 1 -> 1명은 재고 부족으로 주문 실패해야합니다
jpa 에 맞게 설계해주세요

예상 결과: 주문 생성과 동시에 재고가 자동으로 차감되며, 재고 부족 시 주문이 거부됩니다.
```

