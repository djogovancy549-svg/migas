import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider with Sheets and Drive Scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initialize Auth State listener.
 */
export const initAuthListener = (
  onSuccess: (user: User, token: string) => void,
  onFailure: () => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (cachedAccessToken) {
        onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged in but token expired or lost in memory
        onFailure();
      }
    } else {
      cachedAccessToken = null;
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
  await signOut(auth);
};

/**
 * Get active access token
 */
export const getCachedAccessToken = () => cachedAccessToken;
