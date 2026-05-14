export type UserRole = 'customer' | 'merchant' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  onboardingCompleted: boolean;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  userId: string;
  addresses: Address[];
  favorites: string[];
  footprints: string[];
  preferences: string[];
}

export interface Merchant {
  userId: string;
  storeName: string;
  storeLogo: string | null;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  totalSales: number;
  totalOrders: number;
  rating: number;
  createdAt: Date;
  bankAccount?: string;
  shippingMethods: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  subcategory: string;
  merchantId: string;
  merchantName?: string;
  stock: number;
  sold: number;
  status: 'pending' | 'active' | 'inactive';
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  stock: number;
  priceModifier: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  merchantId: string;
}

export interface Order {
  id: string;
  customerId: string;
  merchantId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cod';
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  merchantId: string;
  merchantName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  image?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
  variantName?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number;
  usedCount: number;
  applicableProducts: string[];
  applicableCategories: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'promotion' | 'system';
  read: boolean;
  createdAt: Date;
  link?: string;
}