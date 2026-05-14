import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth as getAdminAuthSdk } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage as getAdminStorageSdk } from 'firebase-admin/storage';

let adminApp: App | null = null;

function initAdminApp(): App {
  if (adminApp) return adminApp;
  
  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
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