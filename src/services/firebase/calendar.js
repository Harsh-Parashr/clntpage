/**
 * Get the Firestore documentId for a therapist by email
 * @param {string} email - The therapist's email
 * @returns {Promise<string|null>} The documentId or null if not found
 */
export async function getTherapistDocumentIdByEmail(email) {
  if (!email) return null;
  const therapistsRef = collection(db, 'Therapist');
  const q = query(therapistsRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  return null;
}

import { db } from './config';
import { collection, doc, setDoc, getDoc, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const GOOGLE_CALENDAR_DOC_ID = 'googleCalendar';

/**
 * @typedef {Object} GoogleCalendarConfig
 * @property {boolean} isConnected - Whether the calendar is connected
 * @property {string} [calendarId] - The Google Calendar ID
 * @property {string} [accessToken] - OAuth2 access token
 * @property {string} [refreshToken] - OAuth2 refresh token
 * @property {Timestamp} [lastSyncAt] - Last synchronization timestamp
 * @property {number} [syncFrequency] - Sync frequency in minutes
 * @property {string} [conflictResolution] - How to handle booking conflicts
 * @property {Timestamp} updatedAt - Last update timestamp
 */

/**
 * Initialize Google Calendar config for a therapist
 * @param {string} therapistId - The therapist's document ID
 * @returns {Promise<void>}
 */
export async function initializeGoogleCalendarConfig(therapistId) {
  const calendarDocRef = doc(
    db,
    'Therapist',
    therapistId,
    SETTINGS_COLLECTION,
    GOOGLE_CALENDAR_DOC_ID
  );

  const defaultConfig = {
    isConnected: false,
    syncFrequency: 5,
    conflictResolution: 'blockSlots',
    updatedAt: Timestamp.now()
  };

  await setDoc(calendarDocRef, defaultConfig);
}

/**
 * Update Google Calendar configuration for a therapist
 * @param {string} therapistId - The therapist's document ID
 * @param {Partial<GoogleCalendarConfig>} config - The calendar configuration to update
 * @returns {Promise<void>}
 */
export async function updateGoogleCalendarConfig(therapistId, config) {
  const calendarDocRef = doc(
    db,
    'Therapist',
    therapistId,
    SETTINGS_COLLECTION,
    GOOGLE_CALENDAR_DOC_ID
  );

  // Always update the updatedAt timestamp
  const updatedConfig = {
    ...config,
    updatedAt: Timestamp.now()
  };

  await setDoc(calendarDocRef, updatedConfig, { merge: true });
}

/**
 * Get Google Calendar configuration for a therapist
 * @param {string} therapistId - The therapist's document ID
 * @returns {Promise<GoogleCalendarConfig|null>}
 */
export async function getGoogleCalendarConfig(therapistId) {
  const calendarDocRef = doc(
    db,
    'Therapist',
    therapistId,
    SETTINGS_COLLECTION,
    GOOGLE_CALENDAR_DOC_ID
  );

  const docSnap = await getDoc(calendarDocRef);
  return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Connect Google Calendar for a therapist
 * @param {string} therapistId - The therapist's document ID
 * @param {string} calendarId - The Google Calendar ID
 * @param {string} accessToken - OAuth2 access token
 * @param {string} refreshToken - OAuth2 refresh token
 * @returns {Promise<void>}
 */
export async function connectGoogleCalendar(
  therapistId,
  calendarId,
  accessToken,
  refreshToken,
  syncFrequency = 5,
  conflictResolution = 'blockSlots'
) {
  const config = {
    isConnected: true,
    calendarId,
    accessToken,
    refreshToken,
    lastSyncAt: Timestamp.now(),
    syncFrequency,
    conflictResolution,
  };
  await updateGoogleCalendarConfig(therapistId, config);
}

/**
 * Disconnect Google Calendar for a therapist
 * @param {string} therapistId - The therapist's document ID
 * @returns {Promise<void>}
 */
export async function disconnectGoogleCalendar(therapistId) {
  const config = {
    isConnected: false,
    calendarId: null,
    accessToken: null,
    refreshToken: null,
    lastSyncAt: null,
  };

  await updateGoogleCalendarConfig(therapistId, config);
}

/**
 * Add a booked slot document under Therapist/{id}/bookedSlots
 * @param {string} therapistId
 * @param {Object} data
 */
export async function addBookedSlot(therapistId, data) {
  const colRef = collection(db, 'Therapist', therapistId, 'bookedSlots');
  const now = Timestamp.now();
  const payload = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  return await addDoc(colRef, payload);
}