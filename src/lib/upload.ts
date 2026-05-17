import { getFirebaseStorage, getFirebaseApp } from '@/lib/firebase/config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

export async function uploadFile(file: File, path: string): Promise<string> {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase not configured');

  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytesResumable(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export function getStoragePath(uid: string, type: 'logo' | 'product', fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg';
  return `${type}s/${uid}/${Date.now()}.${ext}`;
}
