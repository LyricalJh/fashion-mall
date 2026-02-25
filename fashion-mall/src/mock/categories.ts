export interface Category {
  id: string
  label: string
  slug: string
}

export const categories: Category[] = [
  { id: 'brand', label: '브랜드', slug: 'brand' },
  { id: 'women', label: '여성', slug: 'women' },
  { id: 'men', label: '남성', slug: 'men' },
  { id: 'accessories', label: '패션잡화', slug: 'accessories' },
  { id: 'beauty', label: '뷰티', slug: 'beauty' },
  { id: 'golf', label: '골프', slug: 'golf' },
  { id: 'living', label: '리빙', slug: 'living' },
  { id: 'kids', label: '키즈', slug: 'kids' },
  { id: 'sports', label: '스포츠', slug: 'sports' },
]
