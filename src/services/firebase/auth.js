import { auth } from './config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { db } from './config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function registerTherapist(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user.uid;
  } catch (error) {
    throw error;
  }
}

export async function loginTherapist(email, password) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    // Check if email exists in Therapist collection (case-insensitive)
    const therapistsRef = collection(db, 'Therapist');
    const q = query(therapistsRef, where('email', '==', trimmedEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // Try to find a match by lowercasing and trimming all emails in Therapist collection
      const allDocs = await getDocs(therapistsRef);
      let found = false;
      allDocs.forEach(doc => {
        const docEmail = (doc.data().email || '').trim().toLowerCase();
        if (docEmail === trimmedEmail) found = true;
      });
      if (!found) {
        const error = new Error('Email not found in Therapist collection');
        error.code = 'auth/not-therapist';
        throw error;
      }
    }
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

/**
 * Update the currently signed-in user's displayName and/or photoURL in Firebase Auth.
 * @param {{displayName?: string, photoURL?: string}} updates
 */
export async function updateUserProfile(updates = {}) {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    await firebaseUpdateProfile(auth.currentUser, updates);
    return { success: true };
  } catch (error) {
    throw error;
  }
}