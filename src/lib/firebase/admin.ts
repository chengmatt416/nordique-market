import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth as getAdminAuthSdk } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage as getAdminStorageSdk } from 'firebase-admin/storage';
import { NextResponse } from 'next/server';

let adminApp: App | null = null;

export function isFirebaseConfigured(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
  if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
  return { ok: missing.length === 0, missing };
}

export function firebaseNotConfiguredResponse() {
  const { missing } = isFirebaseConfigured();
  return NextResponse.json(
    {
      error: 'Firebase Admin SDK is not configured',
      detail: 'Missing: ' + missing.join(', '),
      hint: 'Copy .env.example to .env.local and fill in the Firebase Admin credentials from Firebase Console > Project Settings > Service Accounts',
      missing,
    },
    { status: 503 }
  );
}

function initAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  if (!isFirebaseConfigured().ok) {
    const { missing } = isFirebaseConfigured();
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