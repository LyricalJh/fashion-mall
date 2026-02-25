export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  badgeText?: string
}

export const banners: Banner[] = [
  {
    id: 'b1',
    title: 'New Season Arrivals',
    subtitle: 'Discover the latest trends this spring',
    imageUrl: 'https://picsum.photos/seed/fashion1/493/651',
    badgeText: 'NEW',
  },
  {
    id: 'b2',
    title: 'Brand Week Sale',
    subtitle: 'Up to 50% off on premium brands',
    imageUrl: 'https://picsum.photos/seed/fashion2/493/651',
    badgeText: 'SALE',
  },
  {
    id: 'b3',
    title: 'Exclusive Collection',
    subtitle: 'Limited edition pieces',
    imageUrl: 'https://picsum.photos/seed/fashion3/493/651',
  },
  {
    id: 'b4',
    title: 'Summer Essentials',
    subtitle: 'Stay cool in style this season',
    imageUrl: 'https://picsum.photos/seed/fashion4/493/651',
    badgeText: 'HOT',
  },
  {
    id: 'b5',
    title: 'Golf & Outdoor',
    subtitle: 'Premium gear for every course',
    imageUrl: 'https://picsum.photos/seed/fashion5/493/651',
  },
  {
    id: 'b6',
    title: 'Luxury Accessories',
    subtitle: 'Complete your look with the finest details',
    imageUrl: 'https://picsum.photos/seed/fashion6/493/651',
    badgeText: 'BEST',
  },
  {
    id: 'b7',
    title: 'Street Style Edit',
    subtitle: 'Bold looks for everyday wear',
    imageUrl: 'https://picsum.photos/seed/fashion7/493/651',
  },
  {
    id: 'b8',
    title: 'Weekend Casuals',
    subtitle: 'Relaxed fits, refined taste',
    imageUrl: 'https://picsum.photos/seed/fashion8/493/651',
    badgeText: 'NEW',
  },
]
