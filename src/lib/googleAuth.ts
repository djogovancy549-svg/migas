import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { safeLocalStorage } from './storage';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Provider with Sheets and Drive Scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = safeLocalStorage.getItem('sipermata_google_access_token');

/**
 * Initialize Auth State listener.
 */
export const initAuthListener = (
  onSuccess: (user: User, token: string | null) => void,
  onFailure: () => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Always pass user details on success even if token is temporarily null
      onSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      safeLocalStorage.removeItem('sipermata_google_access_token');
      onFailure();
    }
  });
};

/**
 * Trigger Sign-In with Google Popup to obtain OAuth Access Token
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Gagal mendapatkan OAuth Access Token Google');
    }

    cachedAccessToken = accessToken;
    safeLocalStorage.setItem('sipermata_google_access_token', accessToken);
    return { user: result.user, accessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out user
 */
export const logoutGoogle = async () => {
  cachedAccessToken = null;
  safeLocalStorage.removeItem('sipermata_google_access_token');
  await signOut(auth);
};

/**
 * Get active access token
 */
export const getCachedAccessToken = () => cachedAccessToken;
