import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyAE1sErIvRVB8U3BrX1XVGc5Rk3bEXmOA8",
  authDomain: "mentcuradev.firebaseapp.com",
  projectId: "mentcuradev",
  storageBucket: "mentcuradev.appspot.com",
  messagingSenderId: "875594328867",
  appId: "1:875594328867:web:8d09ef988485af438eba96",
  measurementId: "G-5CHK32N5P3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);