// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCFtyVeKPs-8BrfLfX2NzJsHKWirk6WcN8',
  authDomain: 'exam-d8a74.firebaseapp.com',
  projectId: 'exam-d8a74',
  storageBucket: 'exam-d8a74.firebasestorage.app',
  messagingSenderId: '1062125020172',
  appId: '1:1062125020172:web:82c214a148edfef13f7a29',
  measurementId: 'G-YB3GS63QZG',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Set custom parameters for Google Sign-In
googleProvider.setCustomParameters({
  prompt: 'consent',
});

export const GOOGLE_OAUTH_CLIENT_ID =
  '1062125020172-q7ohs5j6jnqqnejv91upv2j3uulv32p9.apps.googleusercontent.com';
