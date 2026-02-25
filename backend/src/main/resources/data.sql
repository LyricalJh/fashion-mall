-- =============================================
-- 카테고리 샘플 데이터 (5개)
-- =============================================
INSERT INTO categories (name, description, display_order, created_at, updated_at)
VALUES
    ('상의', '티셔츠, 니트, 셔츠 등 상의류', 1, NOW(), NOW()),
    ('하의', '바지, 스커트, 반바지 등 하의류', 2, NOW(), NOW()),
    ('아우터', '코트, 재킷, 패딩 등 아우터류', 3, NOW(), NOW()),
    ('신발', '스니커즈, 구두, 샌들 등 신발류', 4, NOW(), NOW()),
    ('액세서리', '가방, 모자, 벨트 등 액세서리류', 5, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 상품 샘플 데이터 (20개, 카테고리별 4개)
-- =============================================

-- 상의 (category_id = 1)
INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '베이직 화이트 티셔츠', '100% 순면 소재의 기본 화이트 티셔츠. 어떤 코디에도 잘 어울립니다.', 19900, 100, id, false, NOW(), NOW()
FROM categories WHERE name = '상의'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '스트라이프 옥스퍼드 셔츠', '클래식한 스트라이프 패턴의 옥스퍼드 셔츠. 비즈니스 캐주얼로 활용 가능합니다.', 45000, 60, id, false, NOW(), NOW()
FROM categories WHERE name = '상의'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '캐시미어 터틀넥 니트', '고급 캐시미어 소재의 터틀넥 니트. 보온성과 세련미를 동시에 갖췄습니다.', 89000, 40, id, false, NOW(), NOW()
FROM categories WHERE name = '상의'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '린넨 라운드 티셔츠', '시원한 린넨 소재의 라운드넥 티셔츠. 여름철 필수 아이템입니다.', 29000, 80, id, false, NOW(), NOW()
FROM categories WHERE name = '상의'
ON CONFLICT DO NOTHING;

-- 하의 (category_id = 2)
INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '슬림 스트레이트 데님', '슬림하면서도 편안한 착용감의 스트레이트 데님 팬츠. 클래식한 인디고 컬러입니다.', 59000, 70, id, false, NOW(), NOW()
FROM categories WHERE name = '하의'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '와이드 트라우저', '여유로운 실루엣의 와이드 핏 트라우저. 편안하면서도 세련된 스타일을 연출합니다.', 55000, 50, id, false, NOW(), NOW()
FROM categories WHERE name = '하의'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '플리츠 미니스커트', '사랑스러운 플리츠 디테일의 미니스커트. 다양한 상의와 매치하기 좋습니다.', 39000, 45, id, false, NOW(), NOW()
FROM categories WHERE name = '하의'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '조거 스웨트 팬츠', '부드러운 스웨트 소재의 조거 팬츠. 운동 및 일상에서 모두 활용 가능합니다.', 35000, 90, id, false, NOW(), NOW()
FROM categories WHERE name = '하의'
ON CONFLICT DO NOTHING;

-- 아우터 (category_id = 3)
INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '울 싱글 코트', '고급 울 소재의 싱글 브레스티드 코트. 가을/겨울 시즌 필수 아이템입니다.', 189000, 30, id, false, NOW(), NOW()
FROM categories WHERE name = '아우터'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '경량 다운 패딩', '가볍고 따뜻한 경량 다운 패딩. 휴대성이 뛰어나 여행 시에도 유용합니다.', 149000, 25, id, false, NOW(), NOW()
FROM categories WHERE name = '아우터'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '오버핏 데님 재킷', '트렌디한 오버핏 실루엣의 데님 재킷. 캐주얼 코디의 포인트 아이템입니다.', 79000, 55, id, false, NOW(), NOW()
FROM categories WHERE name = '아우터'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '가죽 라이더 재킷', '세련된 가죽 소재의 라이더 재킷. 어디서나 시선을 끄는 아이템입니다.', 259000, 20, id, false, NOW(), NOW()
FROM categories WHERE name = '아우터'
ON CONFLICT DO NOTHING;

-- 신발 (category_id = 4)
INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '화이트 캔버스 스니커즈', '깨끗한 화이트 컬러의 캔버스 스니커즈. 어떤 코디에도 잘 어울리는 기본 아이템입니다.', 49000, 75, id, false, NOW(), NOW()
FROM categories WHERE name = '신발'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '첼시 부츠', '클래식한 디자인의 첼시 부츠. 비즈니스 캐주얼부터 스트릿 룩까지 다양하게 활용됩니다.', 119000, 35, id, false, NOW(), NOW()
FROM categories WHERE name = '신발'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '메쉬 러닝화', '가볍고 통기성 좋은 메쉬 소재의 러닝화. 운동 퍼포먼스를 높여줍니다.', 89000, 60, id, false, NOW(), NOW()
FROM categories WHERE name = '신발'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '스트랩 샌들', '심플하면서도 세련된 스트랩 샌들. 여름철 다양한 코디에 활용 가능합니다.', 39000, 65, id, false, NOW(), NOW()
FROM categories WHERE name = '신발'
ON CONFLICT DO NOTHING;

-- 액세서리 (category_id = 5)
INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '레더 토트백', '고급 가죽 소재의 넉넉한 토트백. 일상과 비즈니스 모두에 어울립니다.', 159000, 30, id, false, NOW(), NOW()
FROM categories WHERE name = '액세서리'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '울 버킷햇', '따뜻한 울 소재의 버킷햇. 가을/겨울 코디의 포인트 아이템입니다.', 35000, 50, id, false, NOW(), NOW()
FROM categories WHERE name = '액세서리'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '클래식 레더 벨트', '고급 소가죽 소재의 클래식 벨트. 비즈니스 및 캐주얼 코디에 모두 활용 가능합니다.', 45000, 70, id, false, NOW(), NOW()
FROM categories WHERE name = '액세서리'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at)
SELECT '미니 크로스백', '컴팩트한 사이즈의 크로스백. 필수품만 담아 가볍게 외출할 때 유용합니다.', 79000, 40, id, false, NOW(), NOW()
FROM categories WHERE name = '액세서리'
ON CONFLICT DO NOTHING;

-- =============================================
-- 상품 이미지 샘플 데이터
-- =============================================
INSERT INTO product_images (product_id, url, image_order)
SELECT p.id, 'https://images.shop.com/products/' || p.id || '_1.jpg', 1
FROM products p
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, image_order)
SELECT p.id, 'https://images.shop.com/products/' || p.id || '_2.jpg', 2
FROM products p
ON CONFLICT DO NOTHING;
