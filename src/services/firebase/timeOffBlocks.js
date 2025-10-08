import { db } from './config';
import { collection, addDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';

const TIME_OFF_COLLECTION = 'timeOffBlocks';

export async function createTimeOffBlock(therapistId, data) {
  const col = collection(db, 'Therapist', therapistId, TIME_OFF_COLLECTION);
  const now = Timestamp.now();
  const payload = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  return await addDoc(col, payload);
}

export async function updateTimeOffBlock(therapistId, blockId, updates) {
  const ref = doc(db, 'Therapist', therapistId, TIME_OFF_COLLECTION, blockId);
  await setDoc(ref, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
}

export async function getTimeOffBlock(therapistId, blockId) {
  const ref = doc(db, 'Therapist', therapistId, TIME_OFF_COLLECTION, blockId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function listTimeOffBlocks(therapistId) {
  const col = collection(db, 'Therapist', therapistId, TIME_OFF_COLLECTION);
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


