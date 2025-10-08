import { db } from './config';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const PREFERENCES_DOC_ID = 'preferences';
const GOOGLE_CALENDAR_DOC_ID = 'googleCalendar';

export async function getPreferences(therapistId) {
  const ref = doc(db, 'Therapist', therapistId, SETTINGS_COLLECTION, PREFERENCES_DOC_ID);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function updatePreferences(therapistId, updates) {
  const ref = doc(db, 'Therapist', therapistId, SETTINGS_COLLECTION, PREFERENCES_DOC_ID);
  await setDoc(ref, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
}

export async function getGoogleCalendarSettings(therapistId) {
  const ref = doc(db, 'Therapist', therapistId, SETTINGS_COLLECTION, GOOGLE_CALENDAR_DOC_ID);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function updateGoogleCalendarSettings(therapistId, updates) {
  const ref = doc(db, 'Therapist', therapistId, SETTINGS_COLLECTION, GOOGLE_CALENDAR_DOC_ID);
  await setDoc(ref, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
}


