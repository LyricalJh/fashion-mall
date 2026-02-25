export interface HomeSection {
  key: string
  title: string
  productIds: string[]
}

export const sections: HomeSection[] = [
  { key: 'today-best', title: 'Today Best', productIds: ['p1','p2','p3','p4','p5','p6','p7','p8'] },
  { key: 'brand-pick', title: 'Brand Pick', productIds: ['p9','p10','p11','p12','p13','p14','p15','p16'] },
  { key: 'hot-deal', title: 'HOT DEAL', productIds: ['p17','p18','p19','p20','p21','p22','p23','p24'] },
  { key: 'favorite-brand', title: 'Favorite Brand', productIds: ['p25','p26','p27','p28','p29','p30','p31','p32'] },
  { key: 'whats-up', title: "What's up", productIds: ['p1','p5','p9','p13','p17','p21','p25','p29'] },
  { key: 'new-arrival', title: 'New Arrival', productIds: ['p2','p6','p10','p14','p18','p22','p26','p30'] },
  { key: 'this-week', title: 'This Week', productIds: ['p3','p7','p11','p15','p19','p23','p27','p31'] },
]
