// Brand config — name comes from env var, everything else from Firestore /api/brand

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || '';

export const BrandConfig = {
  name: BRAND,
  tagline: '',
  description: '',
  contact: {
    email: '',
    phone: '',
    address: '',
  },
  social: {
    facebook: '',
    instagram: '',
    line: '',
  },
  colors: {
    primary: 'indigo-600',
    accent: 'pink-400',
  },
  footer: {
    company: [
      { name: '關於我們', href: '#' },
    ],
    support: [
      { name: '幫助中心', href: '/support/help-center' },
      { name: '聯絡客服', href: '/support/contact' },
    ],
    legal: [
      { name: '隱私權政策', href: '/legal/privacy' },
      { name: '服務條款', href: '/legal/terms' },
    ],
  },
  features: [] as { icon: string; title: string; description: string }[],
  categories: [
    { name: '時尚', icon: 'ShoppingBag', color: 'accent' },
    { name: '電子產品', icon: 'Zap', color: 'accentSecondary' },
    { name: '家居', icon: 'Heart', color: 'accent' },
    { name: '美妝', icon: 'Sparkles', color: 'accentSecondary' },
    { name: '運動', icon: 'Dumbbell', color: 'accent' },
    { name: '食品', icon: 'Apple', color: 'accentSecondary' },
  ],
} as const;