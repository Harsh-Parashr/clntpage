import { db } from './config';
import { collection, addDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';

const BOOKED_SLOTS_COLLECTION = 'bookedSlots';

export async function createBookedSlot(therapistId, data) {
  const col = collection(db, 'Therapist', therapistId, BOOKED_SLOTS_COLLECTION);
  const now = Timestamp.now();
  const payload = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  return await addDoc(col, payload);
}

export async function updateBookedSlot(therapistId, slotId, updates) {
  const ref = doc(db, 'Therapist', therapistId, BOOKED_SLOTS_COLLECTION, slotId);
  await setDoc(ref, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
}

export async function getBookedSlot(therapistId, slotId) {
  const ref = doc(db, 'Therapist', therapistId, BOOKED_SLOTS_COLLECTION, slotId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function listBookedSlots(therapistId) {
  const col = collection(db, 'Therapist', therapistId, BOOKED_SLOTS_COLLECTION);
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


