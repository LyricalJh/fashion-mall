export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  brand: string
  name: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  badge?: 'HOT' | 'NEW' | 'BEST' | 'SALE'
  colors: ProductColor[]
  sizes: string[]
}

const ALL_COLORS: ProductColor[] = [
  { name: '블랙',   hex: '#111111' },
  { name: '화이트', hex: '#F5F5F5' },
  { name: '베이지', hex: '#D4B896' },
  { name: '네이비', hex: '#1B2A4A' },
  { name: '버건디', hex: '#6D1A2A' },
  { name: '카키',   hex: '#5C6B3A' },
  { name: '그레이', hex: '#888888' },
]

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL']

/**
 * 인덱스에 따라 다양한 옵션 패턴을 생성합니다.
 * mod 0 → 컬러 2개, 사이즈 없음 (악세서리류)
 * mod 1 → 컬러 3개, ONE SIZE   (원사이즈류)
 * mod 2 → 컬러 전체, 사이즈 전체 (풀옵션)
 * mod 3 → 컬러 2개, 사이즈 3개 (제한 옵션)
 * mod 4 → 컬러 1개, 사이즈 1개 (자동 선택 → 검증 없이 진행)
 */
function getProductOptions(i: number): { colors: ProductColor[]; sizes: string[] } {
  const mod = i % 5
  if (mod === 0) return { colors: ALL_COLORS.slice(0, 2), sizes: [] }
  if (mod === 1) return { colors: ALL_COLORS.slice(0, 3), sizes: ['ONE SIZE'] }
  if (mod === 2) return { colors: ALL_COLORS, sizes: ALL_SIZES }
  if (mod === 3) return { colors: ALL_COLORS.slice(0, 2), sizes: ALL_SIZES.slice(0, 3) }
  return { colors: [ALL_COLORS[i % ALL_COLORS.length]], sizes: [ALL_SIZES[i % ALL_SIZES.length]] }
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
  const { colors, sizes } = getProductOptions(i)
  return {
    id: `p${i + 1}`,
    brand: brands[i % brands.length],
    name: names[i % names.length],
    price: hasDiscount ? Math.floor(price * (1 - (discountRate ?? 0) / 100)) : price,
    originalPrice: hasDiscount ? price : undefined,
    discountRate,
    imageUrl: `https://picsum.photos/seed/${seed}/400/600`,
    badge: badges[i % badges.length],
    colors,
    sizes,
  }
})
