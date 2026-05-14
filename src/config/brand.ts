export const BrandConfig = {
  name: 'AURA',
  displayName: 'AURA',
  tagline: '探索北歐光環，感受純淨生活之美',
  description: '精選來自北歐的優質商品，為您打造簡約舒適的家居生活體驗',
  logo: '/logo.svg',

  contact: {
    email: 'support@aura-store.com',
    phone: '02-1234-5678',
    address: '台北市松山區民生東路三段128號',
  },

  social: {
    facebook: 'https://facebook.com/aurastore',
    instagram: 'https://instagram.com/aurastore',
    line: '@aura-store',
  },

  colors: {
    primary: '#1A1A2E',
    secondary: '#F7F7F9',
    accent: '#E8B4B8',
    accentSecondary: '#A8D8EA',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#E53935',
  },

  footer: {
    company: [
      { name: '關於我們', href: '/about' },
      { name: '加入我們', href: '/careers' },
      { name: '新聞中心', href: '/news' },
    ],
    support: [
      { name: '幫助中心', href: '/help' },
      { name: '聯絡客服', href: '/contact' },
      { name: '常見問題', href: '/faq' },
    ],
    legal: [
      { name: '隱私權政策', href: '/privacy' },
      { name: '服務條款', href: '/terms' },
      { name: '退換貨政策', href: '/returns' },
    ],
  },

  stats: {
    customers: '50,000+',
    merchants: '200+',
    products: '5,000+',
  },

  features: [
    {
      icon: 'Shield',
      title: '安全支付',
      description: '多重加密保護，讓您安心購物',
    },
    {
      icon: 'Truck',
      title: '快速配送',
      description: '全台灣地區快速到貨服務',
    },
    {
      icon: 'Headphones',
      title: '24/7 客服',
      description: '隨時為您解決問題',
    },
    {
      icon: 'CreditCard',
      title: '便捷付款',
      description: '支援多種支付方式',
    },
  ],

  categories: [
    { name: '時尚', icon: 'ShoppingBag', color: 'accent' },
    { name: '電子產品', icon: 'Zap', color: 'accentSecondary' },
    { name: '家居', icon: 'Heart', color: 'accent' },
    { name: '美妝', icon: 'Sparkles', color: 'accentSecondary' },
    { name: '運動', icon: 'Dumbbell', color: 'accent' },
    { name: '食品', icon: 'Apple', color: 'accentSecondary' },
  ],
} as const;

export type BrandConfigType = typeof BrandConfig;