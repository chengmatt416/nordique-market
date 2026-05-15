import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth as getAdminAuthSdk } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage as getAdminStorageSdk } from 'firebase-admin/storage';

let adminApp: App | null = null;

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

function initAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  if (!isFirebaseConfigured()) {
    const missing: string[] = [];
    if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
    if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.warn(
        '[Firebase Admin] FIREBASE_PRIVATE_KEY is missing. ' +
        'Please set it in your .env.local file. ' +
        'Generate a new private key from Firebase Console > Project Settings > Service Accounts.'
      );
      missing.push('FIREBASE_PRIVATE_KEY');
    }
    throw new Error(
      `Firebase Admin SDK is not configured. Missing environment variables: ${missing.join(', ')}. ` +
      'Please set up Firebase Admin credentials in your .env.local file.'
    );
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  return adminApp;
}

export function getAdminAuth() {
  return getAdminAuthSdk(initAdminApp());
}

export function getAdminDb() {
  return getAdminFirestore(initAdminApp());
}

export function getAdminStorage() {
  return getAdminStorageSdk(initAdminApp());
}

export { initAdminApp as getFirebaseAdminApp, FieldValue };