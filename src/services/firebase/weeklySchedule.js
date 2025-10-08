import { db } from './config';
import { collection, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';

const WEEKLY_SCHEDULE_COLLECTION = 'weeklySchedule';

export async function getDaySchedule(therapistId, dayKey) {
  const ref = doc(db, 'Therapist', therapistId, WEEKLY_SCHEDULE_COLLECTION, dayKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setDaySchedule(therapistId, dayKey, data) {
  const ref = doc(db, 'Therapist', therapistId, WEEKLY_SCHEDULE_COLLECTION, dayKey);
  await setDoc(ref, { ...data, updatedAt: Timestamp.now() }, { merge: true });
}

export async function getWeeklySchedule(therapistId) {
  const ref = collection(db, 'Therapist', therapistId, WEEKLY_SCHEDULE_COLLECTION);
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


