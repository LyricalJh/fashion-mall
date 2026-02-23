export interface Product {
  id: string
  brand: string
  name: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  badge?: 'HOT' | 'NEW' | 'BEST' | 'SALE'
}

const seeds = [
  'coat1','dress1','jacket1','bag1','shoes1','shirt1','pants1','skirt1',
  'coat2','dress2','jacket2','bag2','shoes2','shirt2','pants2','skirt2',
  'coat3','dress3','jacket3','bag3','shoes3','shirt3','pants3','skirt3',
  'coat4','dress4','jacket4','bag4','shoes4','shirt4','pants4','skirt4',
]

const brands = ['ZARA', 'H&M', 'MANGO', 'COS', 'ARKET', 'MONKI', 'WEEKDAY', 'MASSIMO DUTTI']
const names = [
  'Wool Blend Coat', 'Satin Wrap Dress', 'Denim Jacket', 'Leather Tote',
  'Chunky Sneakers', 'Linen Shirt', 'Wide Leg Trousers', 'Midi Skirt',
  'Cashmere Sweater', 'Pleated Trousers', 'Blazer Jacket', 'Mini Crossbody',
  'Block Heel Mules', 'Oxford Shirt', 'Slim Fit Jeans', 'A-Line Dress',
]
const badges: Array<Product['badge']> = ['HOT', 'NEW', 'BEST', 'SALE', undefined, undefined, undefined]

export const products: Product[] = seeds.map((seed, i) => {
  const price = Math.floor(Math.random() * 150000 + 29000)
  const hasDiscount = i % 3 === 0
  const discountRate = hasDiscount ? [10, 20, 30, 40, 50][i % 5] : undefined
  return {
    id: `p${i + 1}`,
    brand: brands[i % brands.length],
    name: names[i % names.length],
    price: hasDiscount ? Math.floor(price * (1 - (discountRate ?? 0) / 100)) : price,
    originalPrice: hasDiscount ? price : undefined,
    discountRate,
    imageUrl: `https://picsum.photos/seed/${seed}/400/600`,
    badge: badges[i % badges.length],
  }
})
