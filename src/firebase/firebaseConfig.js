import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCZABVFiNDDXAFm1CjMrYlbTUWjSH2qYaY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cjd-hobby-classes.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cjd-hobby-classes',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cjd-hobby-classes.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '552330744058',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:552330744058:web:94d4a208b2beaac734f943',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7CB2PNTDP7',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analyticsPromise =
  typeof window === 'undefined'
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null);
