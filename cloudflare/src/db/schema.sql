-- Users (replaces Firestore users collection)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  role TEXT DEFAULT 'customer' CHECK(role IN ('customer','merchant','admin')),
  onboarding_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Merchants (replaces Firestore merchants collection)
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  store_name TEXT DEFAULT '',
  store_logo TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  owner_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  join_date TEXT DEFAULT (date('now')),
  products_count INTEGER DEFAULT 0,
  total_sales REAL DEFAULT 0,
  rating REAL DEFAULT 0,
  reject_reason TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (id) REFERENCES users(id)
);

-- Products (replaces Firestore products collection)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  price REAL DEFAULT 0,
  original_price REAL DEFAULT 0,
  images TEXT DEFAULT '[]',
  category TEXT DEFAULT '',
  merchant_id TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','active','inactive','rejected')),
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sizes TEXT DEFAULT '[]',
  colors TEXT DEFAULT '[]',
  specs TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- Orders (replaces Firestore orders collection)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  items TEXT DEFAULT '[]',
  total_amount REAL DEFAULT 0,
  shipping_fee REAL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','delivered','completed','cancelled','refunded')),
  shipping_address TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  has_dispute INTEGER DEFAULT 0,
  dispute_reason TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- Contact Messages (replaces Firestore contact_messages collection)
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'unread' CHECK(status IN ('unread','read','replied')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Brand Settings (replaces Firestore settings/brand document)
CREATE TABLE IF NOT EXISTS brand_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_address TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  footer_tagline TEXT DEFAULT '',
  help_content TEXT DEFAULT '[]',
  privacy_content TEXT DEFAULT '[]',
  terms_content TEXT DEFAULT '[]',
  contact_extra_info TEXT DEFAULT '',
  flash_sale TEXT DEFAULT '{"active":false}',
  merchant_signup_enabled INTEGER DEFAULT 1,
  categories TEXT DEFAULT '[]',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
