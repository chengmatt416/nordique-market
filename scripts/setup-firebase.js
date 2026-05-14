import admin from 'firebase-admin';

const firebaseAdminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

if (!admin.apps.length) {
  admin.initializeApp(firebaseAdminConfig);
}

const db = admin.firestore();
const auth = admin.auth();

async function setupFirebase() {
  console.log('🔧 Starting Firebase setup...\n');

  try {
    // Create default admin user
    console.log('📝 Creating admin user...');
    const adminEmail = 'admin@aura-market.com';
    const adminPassword = 'Admin123!';

    try {
      const userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: '系統管理員',
      });
      console.log(`✅ Admin user created: ${userRecord.uid}`);

      await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
      console.log('✅ Admin role assigned');

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: adminEmail,
        name: '系統管理員',
        role: 'admin',
        onboardingCompleted: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ User document created');
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  Admin user already exists');
      } else {
        throw error;
      }
    }

    // Create sample categories
    console.log('\n📂 Creating categories...');
    const categories = [
      { id: 'fashion', name: '時尚', icon: 'ShoppingBag', color: 'accent', subcategories: ['男裝', '女裝', '配件'] },
      { id: 'electronics', name: '電子產品', icon: 'Zap', color: 'accentSecondary', subcategories: ['手機', '電腦', '配件'] },
      { id: 'home', name: '家居', icon: 'Heart', color: 'accent', subcategories: ['家具', '收納', '裝飾'] },
      { id: 'beauty', name: '美妝', icon: 'Sparkles', color: 'accentSecondary', subcategories: ['護膚', '化妝', '香水'] },
      { id: 'sports', name: '運動', icon: 'Dumbbell', color: 'accent', subcategories: ['健身', '戶外', '球類'] },
      { id: 'food', name: '食品', icon: 'Apple', color: 'accentSecondary', subcategories: ['零食', '飲料', '食材'] },
    ];

    for (const category of categories) {
      await db.collection('categories').doc(category.id).set(category);
    }
    console.log(`✅ ${categories.length} categories created`);

    // Create sample merchant
    console.log('\n🏪 Creating sample merchant...');
    try {
      const merchantEmail = 'merchant@aura-market.com';
      const merchantPassword = 'Merchant123!';

      const merchantUser = await auth.createUser({
        email: merchantEmail,
        password: merchantPassword,
        displayName: '北歐家居館',
      });

      await auth.setCustomUserClaims(merchantUser.uid, { role: 'merchant' });

      await db.collection('users').doc(merchantUser.uid).set({
        uid: merchantUser.uid,
        email: merchantEmail,
        name: '北歐家居館',
        role: 'merchant',
        onboardingCompleted: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('merchants').doc(merchantUser.uid).set({
        userId: merchantUser.uid,
        storeName: '北歐家居館',
        storeLogo: null,
        description: '精選北歐設計家居品，為您打造舒適生活',
        status: 'approved',
        totalSales: 0,
        totalOrders: 0,
        rating: 4.8,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        shippingMethods: ['7-11', '全家', '黑貓'],
      });
      console.log(`✅ Sample merchant created: ${merchantEmail}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  Sample merchant already exists');
      } else {
        throw error;
      }
    }

    // Create sample products
    console.log('\n📦 Creating sample products...');
    const products = [
      {
        name: '北歐簡約陶瓷花瓶',
        description: '精選優質陶瓷，簡約北歐風格，為您的空間增添藝術氣息。',
        price: 1299,
        originalPrice: 1999,
        images: ['vase-1'],
        category: 'home',
        subcategory: '裝飾',
        merchantId: 'merchant-1',
        stock: 50,
        sold: 456,
        status: 'active',
        rating: 4.8,
        reviewCount: 236,
      },
      {
        name: '純手工羊毛抱枕',
        description: '100%純羊毛，手工編織，柔軟舒適。',
        price: 899,
        originalPrice: 1499,
        images: ['pillow-2'],
        category: 'home',
        subcategory: '家具',
        merchantId: 'merchant-1',
        stock: 30,
        sold: 234,
        status: 'active',
        rating: 4.9,
        reviewCount: 189,
      },
    ];

    for (const product of products) {
      const productRef = db.collection('products').doc();
      await productRef.set({
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    console.log(`✅ ${products.length} sample products created`);

    console.log('\n✨ Firebase setup completed!');
    console.log('\n📋 Default accounts:');
    console.log('   Admin: admin@aura-market.com / Admin123!');
    console.log('   Merchant: merchant@aura-market.com / Merchant123!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupFirebase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { setupFirebase };