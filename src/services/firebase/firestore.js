import { db } from './config';
import { doc, collection, addDoc, setDoc, getDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { initializeGoogleCalendarConfig } from './calendar';

// Therapist preferences management
export async function getTherapistPreferences(therapistId) {
  try {
    const preferencesRef = doc(db, 'Therapist', therapistId, 'settings', 'preferences');
    const preferencesDoc = await getDoc(preferencesRef);
    
    if (preferencesDoc.exists()) {
      return preferencesDoc.data();
    }
    
    // Return default preferences if none exist
    return {
      sessionDefaults: {
        duration: 60,
        bufferBefore: 10,
        bufferAfter: 10,
        cancellationWindow: 24,
        autoAccept: true
      },
      bookingWindow: {
        advanceDays: 60,
        minimumNoticeHours: 24,
        maximumBookingsPerDay: 8
      },
      notifications: {
        email: {
          bookingConfirmation: true,
          cancellationAlert: true,
          reminderNotifications: false
        },
        sms: {
          bookingConfirmation: false,
          cancellationAlert: true
        }
      },
      timezone: 'Asia/Kolkata',
      updatedAt: Timestamp.now()
    };
  } catch (error) {
    console.error('Error getting therapist preferences:', error);
    throw error;
  }
}

export async function updateTherapistPreferences(therapistId, preferences) {
  try {
    const preferencesRef = doc(db, 'Therapist', therapistId, 'settings', 'preferences');
    const updatedPreferences = {
      ...preferences,
      updatedAt: Timestamp.now()
    };
    
    await setDoc(preferencesRef, updatedPreferences, { merge: true });
    return updatedPreferences;
  } catch (error) {
    console.error('Error updating therapist preferences:', error);
    throw error;
  }
}

export async function addTherapist(data) {
  try {
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const docRef = await addDoc(collection(db, 'Therapist'), {
      uid: data.uid || '',
      name: data.name || '',
      email: normalizedEmail,
      phone: data.phone || '',
      profilePicture: data.profilePicture || '',
      bio: data.bio || '',
      specialization: data.specialization || '',
      practiceSince: data.practiceSince ? Timestamp.fromDate(new Date(data.practiceSince)) : null,
      youtubeProfile: data.youtubeProfile || '',
      languages: Array.isArray(data.languages) ? data.languages : [],
      expertise: Array.isArray(data.expertise) ? data.expertise : [],
      approved: false,
      pronouns: data.pronouns || '',
      slug: data.slug || '',
      address: {
        address: data.address?.address || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        country: data.address?.country || '',
        zipCode: data.address?.zipCode || '',
      },
      qualifications: Array.isArray(data.qualifications) ? data.qualifications.map(q => ({
        degreeName: q.degreeName || '',
        degreeType: q.degreeType || '',
        instituteName: q.instituteName || '',
        yearOfPassing: q.yearOfPassing || '',
      })) : [],
      certifications: Array.isArray(data.certifications) ? data.certifications.map(c => ({
        certificationName: c.certificationName || '',
        certificationNumber: c.certificationNumber || '',
        certificationAuthority: c.certificationAuthority || '',
        certificationYear: c.certificationYear || '',
        certificationExpiryDate: c.certificationExpiryDate || '',
      })) : [],
      charges: Array.isArray(data.charges) ? data.charges.map(ch => ({
        sessionType: ch.sessionType || 'individual',
        amount: typeof ch.amount === 'number' ? ch.amount : 0,
      })) : [],
    });

    // Initialize settings documents
    await initializeGoogleCalendarConfig(docRef.id);
    const preferencesRef = doc(db, 'Therapist', docRef.id, 'settings', 'preferences');
    await setDoc(preferencesRef, {
      notifications: {
        email: {
          bookingConfirmation: true,
          cancellationAlert: true,
          reminderNotifications: false,
        },
        sms: {
          bookingConfirmation: false,
          cancellationAlert: true,
        },
      },
      sessionDefaults: {
        duration: 60,
        bufferBefore: 10,
        bufferAfter: 10,
        cancellationWindow: 24,
        autoAccept: true,
      },
      bookingWindow: {
        advanceDays: 60,
        minimumNoticeHours: 24,
        maximumBookingsPerDay: 8,
      },
      updatedAt: Timestamp.now(),
    }, { merge: true });

    return docRef.id;
  } catch (error) {
    console.error('Error adding therapist:', error);
    throw error;
  }
}

// Weekly Schedule management functions
export async function getWeeklySchedule(therapistId) {
  try {
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const dayRef = doc(db, 'Therapist', therapistId, 'weeklySchedule', day);
      const dayDoc = await getDoc(dayRef);
      
      if (dayDoc.exists()) {
        schedule[day] = dayDoc.data();
      } else {
        // Create default schedule for this day
        const defaultDay = {
          dayName: day.charAt(0).toUpperCase() + day.slice(1),
          dayOfWeek: days.indexOf(day) + 1, // 1=Monday, 7=Sunday
          isAvailable: day === 'saturday' || day === 'sunday' ? false : true,
          startTime: day === 'saturday' || day === 'sunday' ? null : '09:00',
          endTime: day === 'saturday' || day === 'sunday' ? null : '18:00',
          timeBlocks: [],
          updatedAt: Timestamp.now()
        };
        
        await setDoc(dayRef, defaultDay);
        schedule[day] = defaultDay;
      }
    }
    
    return schedule;
  } catch (error) {
    console.error('Error getting weekly schedule:', error);
    throw error;
  }
}

export async function updateDaySchedule(therapistId, dayName, dayData) {
  try {
    const dayRef = doc(db, 'Therapist', therapistId, 'weeklySchedule', dayName.toLowerCase());
    const updatedData = {
      ...dayData,
      updatedAt: Timestamp.now()
    };
    
    await setDoc(dayRef, updatedData, { merge: true });
    return updatedData;
  } catch (error) {
    console.error('Error updating day schedule:', error);
    throw error;
  }
}

export async function addTimeBlock(therapistId, dayName, timeBlock) {
  try {
    const dayRef = doc(db, 'Therapist', therapistId, 'weeklySchedule', dayName.toLowerCase());
    const dayDoc = await getDoc(dayRef);
    
    if (dayDoc.exists()) {
      const dayData = dayDoc.data();
      const newTimeBlock = {
        blockId: `block_${Date.now()}`,
        startTime: timeBlock.startTime,
        endTime: timeBlock.endTime,
        isActive: timeBlock.isActive !== undefined ? timeBlock.isActive : true,
        reason: timeBlock.reason || null
      };
      
      const updatedTimeBlocks = [...(dayData.timeBlocks || []), newTimeBlock];
      
      await setDoc(dayRef, {
        ...dayData,
        timeBlocks: updatedTimeBlocks,
        updatedAt: Timestamp.now()
      });
      
      return newTimeBlock;
    }
    
    throw new Error('Day schedule not found');
  } catch (error) {
    console.error('Error adding time block:', error);
    throw error;
  }
}

export async function removeTimeBlock(therapistId, dayName, blockId) {
  try {
    const dayRef = doc(db, 'Therapist', therapistId, 'weeklySchedule', dayName.toLowerCase());
    const dayDoc = await getDoc(dayRef);
    
    if (dayDoc.exists()) {
      const dayData = dayDoc.data();
      const updatedTimeBlocks = (dayData.timeBlocks || []).filter(block => block.blockId !== blockId);
      
      await setDoc(dayRef, {
        ...dayData,
        timeBlocks: updatedTimeBlocks,
        updatedAt: Timestamp.now()
      });
      
      return true;
    }
    
    throw new Error('Day schedule not found');
  } catch (error) {
    console.error('Error removing time block:', error);
    throw error;
  }
}

// Time-Off Blocks subcollection management
export async function getTimeOffBlocks(therapistId) {
  try {
    const timeOffRef = collection(db, 'Therapist', therapistId, 'timeOffBlocks');
    const timeOffSnapshot = await getDocs(timeOffRef);
    
    const timeOffBlocks = [];
    timeOffSnapshot.forEach((doc) => {
      timeOffBlocks.push({
        blockId: doc.id,
        ...doc.data()
      });
    });
    
    return timeOffBlocks;
  } catch (error) {
    console.error('Error getting time-off blocks:', error);
    throw error;
  }
}

export async function addTimeOffBlock(therapistId, timeOffData) {
  try {
    const timeOffRef = collection(db, 'Therapist', therapistId, 'timeOffBlocks');
    
    const newTimeOffBlock = {
      startDate: timeOffData.startDate,
      endDate: timeOffData.endDate,
      isAllDay: timeOffData.isAllDay !== undefined ? timeOffData.isAllDay : true,
      startTime: timeOffData.startTime || null,
      endTime: timeOffData.endTime || null,
      type: timeOffData.type || 'vacation', // vacation, holiday, personal, sick
      title: timeOffData.title || '',
      notes: timeOffData.notes || null,
      isActive: timeOffData.isActive !== undefined ? timeOffData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(timeOffRef, newTimeOffBlock);
    
    return {
      blockId: docRef.id,
      ...newTimeOffBlock
    };
  } catch (error) {
    console.error('Error adding time-off block:', error);
    throw error;
  }
}

export async function updateTimeOffBlock(therapistId, blockId, updates) {
  try {
    const blockRef = doc(db, 'Therapist', therapistId, 'timeOffBlocks', blockId);
    
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await setDoc(blockRef, updatedData, { merge: true });
    
    return {
      blockId,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating time-off block:', error);
    throw error;
  }
}

export async function deleteTimeOffBlock(therapistId, blockId) {
  try {
    const blockRef = doc(db, 'Therapist', therapistId, 'timeOffBlocks', blockId);
    await deleteDoc(blockRef);
    return true;
  } catch (error) {
    console.error('Error deleting time-off block:', error);
    throw error;
  }
}

// Booked Slots subcollection management
export async function getBookedSlots(therapistId, startDate = null, endDate = null) {
  try {
    const bookedSlotsRef = collection(db, 'Therapist', therapistId, 'bookedSlots');
    const bookedSlotsSnapshot = await getDocs(bookedSlotsRef);
    
    const bookedSlots = [];
    bookedSlotsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter by date range if provided
      if (startDate && endDate) {
        if (data.date >= startDate && data.date <= endDate) {
          bookedSlots.push({
            slotId: doc.id,
            ...data
          });
        }
      } else {
        bookedSlots.push({
          slotId: doc.id,
          ...data
        });
      }
    });
    
    // Sort by date and time
    return bookedSlots.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  } catch (error) {
    console.error('Error getting booked slots:', error);
    throw error;
  }
}

export async function addBookedSlot(therapistId, slotData) {
  try {
    const bookedSlotsRef = collection(db, 'Therapist', therapistId, 'bookedSlots');
    
    const newBookedSlot = {
      date: slotData.date, // YYYY-MM-DD format
      startTime: slotData.startTime, // HH:mm format
      endTime: slotData.endTime, // HH:mm format
      timestamp: slotData.timestamp || Timestamp.now(),
      type: slotData.type, // "session", "googleCalendar", "manual", "timeoff"
      status: slotData.status || 'confirmed', // "confirmed", "cancelled", "pending"
      
      // For type: "session"
      sessionId: slotData.sessionId || null,
      clientId: slotData.clientId || null,
      
      // For type: "googleCalendar"
      googleEventId: slotData.googleEventId || null,
      title: slotData.title || null,
      
      // For type: "manual" or "timeoff"
      reason: slotData.reason || null,
      notes: slotData.notes || null,
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(bookedSlotsRef, newBookedSlot);
    
    return {
      slotId: docRef.id,
      ...newBookedSlot
    };
  } catch (error) {
    console.error('Error adding booked slot:', error);
    throw error;
  }
}

export async function updateBookedSlot(therapistId, slotId, updates) {
  try {
    const slotRef = doc(db, 'Therapist', therapistId, 'bookedSlots', slotId);
    
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await setDoc(slotRef, updatedData, { merge: true });
    
    return {
      slotId,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating booked slot:', error);
    throw error;
  }
}

export async function deleteBookedSlot(therapistId, slotId) {
  try {
    const slotRef = doc(db, 'Therapist', therapistId, 'bookedSlots', slotId);
    await deleteDoc(slotRef);
    return true;
  } catch (error) {
    console.error('Error deleting booked slot:', error);
    throw error;
  }
}

// Helper function to check slot conflicts
export async function checkSlotConflicts(therapistId, date, startTime, endTime, excludeSlotId = null) {
  try {
    const bookedSlots = await getBookedSlots(therapistId, date, date);
    
    const conflicts = bookedSlots.filter(slot => {
      if (excludeSlotId && slot.slotId === excludeSlotId) {
        return false; // Exclude the slot being updated
      }
      
      if (slot.status === 'cancelled') {
        return false; // Don't consider cancelled slots
      }
      
      // Check for time overlap
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      
      return (
        (startTime >= slotStart && startTime < slotEnd) ||
        (endTime > slotStart && endTime <= slotEnd) ||
        (startTime <= slotStart && endTime >= slotEnd)
      );
    });
    
    return conflicts;
  } catch (error) {
    console.error('Error checking slot conflicts:', error);
    throw error;
  }
}