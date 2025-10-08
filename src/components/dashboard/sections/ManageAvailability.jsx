import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../../../services/firebase/config';
import { 
    getTherapistPreferences, 
    updateTherapistPreferences,
    getWeeklySchedule,
    updateDaySchedule,
    addTimeBlock,
    removeTimeBlock,
    getTimeOffBlocks,
    addTimeOffBlock,
    updateTimeOffBlock,
    deleteTimeOffBlock,
    getBookedSlots,
    addBookedSlot,
    updateBookedSlot,
    deleteBookedSlot,
    checkSlotConflicts
} from '../../../services/firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

// --- SVG Icons (as stateless functional components) ---
// Kept in the same file for simplicity as requested.

const LogoIcon = () => (
    <svg height="28" width="28" viewBox="0 0 28 28" className="text-green-600" fill="currentColor">
        <path d="M14 0C6.268 0 0 6.268 0 14s6.268 14 14 14 14-6.268 14-14S21.732 0 14 0zm0 25.667C7.56 25.667 2.333 20.44 2.333 14S7.56 2.333 14 2.333 25.667 7.56 25.667 14 20.44 25.667 14 25.667z"></path>
        <path d="M14 6.3c-1.93 0-3.5 1.57-3.5 3.5v8.4c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5V9.8c0-1.93-1.57-3.5-3.5-3.5zm0 13.3c-.643 0-1.167-.523-1.167-1.167V9.8c0-.643.523-1.167 1.167-1.167s1.167.523 1.167 1.167v8.633c0 .644-.524 1.167-1.167 1.167z"></path>
    </svg>
);

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ClientsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ScheduleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2"></path><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M6 15h0"></path><path d="M10 15h4"></path></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6V2h-6zM2.5 16v6h6v-6h-6zM15.5 2v6h6V2h-6zM15.5 16v6h6v-6h-6z"></path><path d="M9 2.5V8M9 16v5.5M2 9h6.5M16 9h5.5"></path></svg>;

const CheckCircleIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "text-green-500 mr-1"}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

// --- Icons for Modal ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CalendarIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 mr-3 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;


// --- Mock Data ---
const appointments = {
    tuesday: [{ name: 'Olivia Chen', time: '9:00 - 9:50 AM', type: 'Individual Therapy', status: 'Confirmed', color: 'blue' }],
    wednesday: [{ name: 'Ethan Hayes', time: '11:00 - 11:50 AM', type: 'Couples Counseling', status: 'Confirmed', color: 'purple' }, { name: 'Chloe Davis', time: '2:00 - 2:50 PM', type: 'Adolescent Therapy', status: 'Pending', color: 'yellow' }],
    thursday: [{ name: 'James Rodriguez', time: '10:00 - 10:50 AM', type: 'Individual Therapy', status: 'Confirmed', color: 'blue' }, { name: 'Mia Williams', time: '1:00 - 1:50 PM', type: 'Individual Therapy', status: 'Canceled', color: 'red' }]
};
const upcomingAppointments = [{ day: 'TUE', date: '25', name: 'Olivia Chen', time: '9:00 AM - Individual' }, { day: 'WED', date: '26', name: 'Ethan Hayes', time: '11:00 AM - Couples' }, { day: 'WED', date: '26', name: 'Chloe Davis', time: '2:00 PM - Adolescent', status: 'Pending' }];
const dayHeadings = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dateHeadings = ["24", "25", "26", "27", "28", "29", "30"];


// --- Main App Component ---

// Refactored: Export as ManageAvailabilitySection, no sidebar, accepts onBack prop
export default function ManageAvailabilitySection({ onBack }) {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [therapistId, setTherapistId] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [timeOffBlocks, setTimeOffBlocks] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showTimeOffModal, setShowTimeOffModal] = useState(false);
    const [editingTimeOff, setEditingTimeOff] = useState(null);
    const [showBookedSlotModal, setShowBookedSlotModal] = useState(false);
    const [editingBookedSlot, setEditingBookedSlot] = useState(null);
    const [bookedSlotForm, setBookedSlotForm] = useState({
        type: 'manual',
        date: '',
        startTime: '',
        endTime: '',
        title: '',
        notes: '',
        reason: '',
        clientId: '',
        sessionId: '',
        googleEventId: '',
        status: 'active'
    });
    
    const carouselRef = useRef(null);
    
    const daysOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const weeklyHours = {
        Monday: '9:00 AM - 5:00 PM',
        Tuesday: '9:00 AM - 5:00 PM',
        Wednesday: '9:00 AM - 1:00 PM',
        Thursday: '9:00 AM - 5:00 PM',
        Friday: 'Not Available',
        Saturday: 'Not Available',
        Sunday: 'Not Available',
    };

    // Load therapist preferences on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email) {
                try {
                    const therapistsRef = collection(db, 'Therapist');
                    const q = query(therapistsRef, where('email', '==', user.email));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const therapistDoc = querySnapshot.docs[0];
                        const therapistDocId = therapistDoc.id;
                        setTherapistId(therapistDocId);
                        
                        // Load preferences, weekly schedule, time-off blocks, and booked slots
                        const [prefs, schedule, timeOff, slots] = await Promise.all([
                            getTherapistPreferences(therapistDocId),
                            getWeeklySchedule(therapistDocId),
                            getTimeOffBlocks(therapistDocId),
                            getBookedSlots(therapistDocId)
                        ]);
                        
                        setPreferences(prefs);
                        setWeeklySchedule(schedule);
                        setTimeOffBlocks(timeOff);
                        setBookedSlots(slots);
                    }
                } catch (error) {
                    console.error('Error loading therapist data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, []);

    const handleSavePreferences = async () => {
        if (!therapistId || !preferences) return;
        
        setSaving(true);
        try {
            await updateTherapistPreferences(therapistId, preferences);
            alert('Preferences saved successfully!');
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Error saving preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const updatePreference = async (path, value) => {
        setPreferences(prev => {
            const newPrefs = { ...prev };
            const keys = path.split('.');
            let current = newPrefs;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newPrefs;
        });

        // Save to Firestore
        if (therapistId) {
            try {
                const newPrefs = { ...preferences };
                const keys = path.split('.');
                let current = newPrefs;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                
                current[keys[keys.length - 1]] = value;
                await updateTherapistPreferences(therapistId, newPrefs);
            } catch (error) {
                console.error('Error updating preference:', error);
            }
        }
    };

    const updateDayAvailability = async (dayName, isAvailable) => {
        if (!therapistId) return;
        
        try {
            const dayKey = dayName.toLowerCase();
            const currentDayData = weeklySchedule?.[dayKey] || {};
            
            const updatedDayData = {
                ...currentDayData,
                isAvailable,
                startTime: isAvailable ? (currentDayData.startTime || '09:00') : null,
                endTime: isAvailable ? (currentDayData.endTime || '18:00') : null
            };
            
            await updateDaySchedule(therapistId, dayName, updatedDayData);
            
            setWeeklySchedule(prev => ({
                ...prev,
                [dayKey]: updatedDayData
            }));
        } catch (error) {
            console.error('Error updating day availability:', error);
        }
    };

    const updateDayTimes = async (dayName, startTime, endTime) => {
        if (!therapistId) return;
        
        try {
            const dayKey = dayName.toLowerCase();
            const currentDayData = weeklySchedule?.[dayKey] || {};
            
            const updatedDayData = {
                ...currentDayData,
                startTime,
                endTime
            };
            
            await updateDaySchedule(therapistId, dayName, updatedDayData);
            
            setWeeklySchedule(prev => ({
                ...prev,
                [dayKey]: updatedDayData
            }));
        } catch (error) {
            console.error('Error updating day times:', error);
        }
    };

    const handleAddTimeBlock = async (dayName, startTime, endTime, reason = null) => {
        if (!therapistId) return;
        
        try {
            const newBlock = await addTimeBlock(therapistId, dayName, {
                startTime,
                endTime,
                isActive: true,
                reason
            });
            
            const dayKey = dayName.toLowerCase();
            setWeeklySchedule(prev => {
                const currentDay = prev[dayKey] || {};
                return {
                    ...prev,
                    [dayKey]: {
                        ...currentDay,
                        timeBlocks: [...(currentDay.timeBlocks || []), newBlock]
                    }
                };
            });
        } catch (error) {
            console.error('Error adding time block:', error);
        }
    };

    const handleRemoveTimeBlock = async (dayName, blockId) => {
        if (!therapistId) return;
        
        try {
            await removeTimeBlock(therapistId, dayName, blockId);
            
            const dayKey = dayName.toLowerCase();
            setWeeklySchedule(prev => {
                const currentDay = prev[dayKey] || {};
                return {
                    ...prev,
                    [dayKey]: {
                        ...currentDay,
                        timeBlocks: (currentDay.timeBlocks || []).filter(block => block.blockId !== blockId)
                    }
                };
            });
        } catch (error) {
            console.error('Error removing time block:', error);
        }
    };

    const handleAddTimeOff = async (timeOffData) => {
        if (!therapistId) return;
        
        try {
            const newTimeOff = await addTimeOffBlock(therapistId, timeOffData);
            setTimeOffBlocks(prev => [...prev, newTimeOff]);
            setShowTimeOffModal(false);
            setEditingTimeOff(null);
        } catch (error) {
            console.error('Error adding time-off block:', error);
            alert('Error adding time-off block. Please try again.');
        }
    };

    const handleEditTimeOff = async (blockId, updates) => {
        if (!therapistId) return;
        
        try {
            await updateTimeOffBlock(therapistId, blockId, updates);
            setTimeOffBlocks(prev => 
                prev.map(block => 
                    block.blockId === blockId 
                        ? { ...block, ...updates }
                        : block
                )
            );
            setShowTimeOffModal(false);
            setEditingTimeOff(null);
        } catch (error) {
            console.error('Error updating time-off block:', error);
            alert('Error updating time-off block. Please try again.');
        }
    };

    const handleDeleteTimeOff = async (blockId) => {
        if (!therapistId) return;
        
        if (!confirm('Are you sure you want to delete this time-off block?')) {
            return;
        }
        
        try {
            await deleteTimeOffBlock(therapistId, blockId);
            setTimeOffBlocks(prev => prev.filter(block => block.blockId !== blockId));
        } catch (error) {
            console.error('Error deleting time-off block:', error);
            alert('Error deleting time-off block. Please try again.');
        }
    };

    const handleAddBookedSlot = async (slotData) => {
        if (!therapistId) return;
        
        try {
            // Check for conflicts first
            const conflicts = await checkSlotConflicts(
                therapistId, 
                slotData.date, 
                slotData.startTime, 
                slotData.endTime
            );
            
            if (conflicts.length > 0) {
                const conflictDetails = conflicts.map(c => `${c.startTime}-${c.endTime} (${c.type})`).join(', ');
                if (!confirm(`Time slot conflicts detected: ${conflictDetails}. Continue anyway?`)) {
                    return;
                }
            }
            
            const newSlot = await addBookedSlot(therapistId, slotData);
            setBookedSlots(prev => [...prev, newSlot]);
            setShowBookedSlotModal(false);
            setEditingBookedSlot(null);
        } catch (error) {
            console.error('Error adding booked slot:', error);
            alert('Error adding booked slot. Please try again.');
        }
    };

    const handleEditBookedSlot = async (slotId, updates) => {
        if (!therapistId) return;
        
        try {
            // Check for conflicts if time is being changed
            if (updates.date || updates.startTime || updates.endTime) {
                const currentSlot = bookedSlots.find(s => s.slotId === slotId);
                const date = updates.date || currentSlot.date;
                const startTime = updates.startTime || currentSlot.startTime;
                const endTime = updates.endTime || currentSlot.endTime;
                
                const conflicts = await checkSlotConflicts(
                    therapistId, 
                    date, 
                    startTime, 
                    endTime, 
                    slotId
                );
                
                if (conflicts.length > 0) {
                    const conflictDetails = conflicts.map(c => `${c.startTime}-${c.endTime} (${c.type})`).join(', ');
                    if (!confirm(`Time slot conflicts detected: ${conflictDetails}. Continue anyway?`)) {
                        return;
                    }
                }
            }
            
            await updateBookedSlot(therapistId, slotId, updates);
            setBookedSlots(prev => 
                prev.map(slot => 
                    slot.slotId === slotId 
                        ? { ...slot, ...updates }
                        : slot
                )
            );
            setShowBookedSlotModal(false);
            setEditingBookedSlot(null);
        } catch (error) {
            console.error('Error updating booked slot:', error);
            alert('Error updating booked slot. Please try again.');
        }
    };

    const handleDeleteBookedSlot = async (slotId) => {
        if (!therapistId) return;
        
        if (!confirm('Are you sure you want to delete this booked slot?')) {
            return;
        }
        
        try {
            await deleteBookedSlot(therapistId, slotId);
            setBookedSlots(prev => prev.filter(slot => slot.slotId !== slotId));
        } catch (error) {
            console.error('Error deleting booked slot:', error);
            alert('Error deleting booked slot. Please try again.');
        }
    };

    const handleBookedSlotSubmit = async (e) => {
        e.preventDefault();
        if (!therapistId) return;
        
        try {
            if (editingBookedSlot) {
                // Update existing slot
                await handleEditBookedSlot(editingBookedSlot.slotId, bookedSlotForm);
            } else {
                // Add new slot
                await handleAddBookedSlot(bookedSlotForm);
            }
            
            // Reset form and close modal
            setBookedSlotForm({
                type: 'manual',
                date: '',
                startTime: '',
                endTime: '',
                title: '',
                notes: '',
                reason: '',
                clientId: '',
                sessionId: '',
                googleEventId: '',
                status: 'active'
            });
            setShowBookedSlotModal(false);
            setEditingBookedSlot(null);
        } catch (error) {
            console.error('Error saving booked slot:', error);
            alert('Error saving booked slot. Please try again.');
        }
    };

    const CARD_SCROLL_PX = 200; // amount to scroll per click (adjust to match card width + gap)
    const scrollPrev = () => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollBy({ left: -CARD_SCROLL_PX, behavior: 'smooth' });
    };
    const scrollNext = () => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollBy({ left: CARD_SCROLL_PX, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <main className="flex-1 bg-white p-4 sm:p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading preferences...</div>
                </div>
            </main>
        );
    }
    return (
        <main className="flex-1 bg-white p-4 sm:p-8">
            <header className="flex flex-wrap justify-between items-center mb-6 border-b pb-4">
                <div>
                    <p className="text-sm text-gray-500">Schedule / <span className="font-semibold text-gray-700">Manage Availability</span></p>
                    <h1 className="text-3xl font-bold">Manage Availability</h1>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    {onBack && (
                        <button onClick={onBack} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">Back</button>
                    )}
                    <button 
                        onClick={handleSavePreferences}
                        disabled={saving || !preferences}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 ${
                            saving || !preferences 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        <SaveIcon /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Weekly Schedule */}
                    <div className="p-6 border rounded-lg relative">
                        <h3 className="font-bold text-lg mb-1">Weekly Schedule Setup</h3>
                        <p className="text-sm text-gray-500 mb-4">Define your standard working hours for each day of the week.</p>
                        <div>
                            <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
                            <div className="flex items-center">
                                <button onClick={scrollPrev} aria-label="Previous" className="text-green-600 hover:text-green-700 p-2 mr-2">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>

                                <div ref={carouselRef} className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-2" style={{ scrollBehavior: 'smooth' }}>
                                    {daysOrder.map((day) => {
                                        const dayKey = day.toLowerCase();
                                        const dayData = weeklySchedule?.[dayKey];
                                        const displayTime = dayData?.isAvailable 
                                            ? `${dayData.startTime || '09:00'} - ${dayData.endTime || '18:00'}`
                                            : 'Not Available';
                                        
                                        return (
                                            <div
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`flex-shrink-0 w-36 p-4 rounded-lg text-center cursor-pointer transition-colors ${
                                                    selectedDay === day
                                                        ? 'bg-green-50 border-2 border-green-500'
                                                        : 'bg-gray-50 border border-gray-200 hover:border-gray-400'
                                                }`}
                                            >
                                                <p className="font-bold">{day}</p>
                                                <p className={`text-sm mt-2 ${displayTime === 'Not Available' ? 'text-gray-400' : ''}`}>
                                                    {displayTime}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={scrollNext} aria-label="Next" className="text-green-600 hover:text-green-700 p-2 ml-2">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Day Availability */}
                    <div className="p-6 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{selectedDay} Availability</h3>
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        checked={weeklySchedule?.[selectedDay.toLowerCase()]?.isAvailable || false}
                                        onChange={(e) => updateDayAvailability(selectedDay, e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-900">Available</span>
                            </label>
                        </div>
                        {weeklySchedule?.[selectedDay.toLowerCase()]?.isAvailable ? (
                            <>
                                {/* Main working hours */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="time" 
                                            value={weeklySchedule?.[selectedDay.toLowerCase()]?.startTime || '09:00'}
                                            onChange={(e) => updateDayTimes(selectedDay, e.target.value, weeklySchedule?.[selectedDay.toLowerCase()]?.endTime || '18:00')}
                                            className="p-2 border rounded-md w-32" 
                                        />
                                        <span>-</span>
                                        <input 
                                            type="time" 
                                            value={weeklySchedule?.[selectedDay.toLowerCase()]?.endTime || '18:00'}
                                            onChange={(e) => updateDayTimes(selectedDay, weeklySchedule?.[selectedDay.toLowerCase()]?.startTime || '09:00', e.target.value)}
                                            className="p-2 border rounded-md w-32" 
                                        />
                                        <span className="text-sm text-gray-500">Main working hours</span>
                                    </div>
                                </div>
                                
                                {/* Time blocks (breaks, lunch, etc.) */}
                                {weeklySchedule?.[selectedDay.toLowerCase()]?.timeBlocks?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Blocked Times</h4>
                                        <div className="space-y-2">
                                            {weeklySchedule[selectedDay.toLowerCase()].timeBlocks.map((block) => (
                                                <div key={block.blockId} className="flex items-center gap-3 p-2 bg-red-50 rounded-md">
                                                    <span className="text-sm">{block.startTime} - {block.endTime}</span>
                                                    {block.reason && (
                                                        <span className="text-xs text-gray-500">({block.reason})</span>
                                                    )}
                                                    <button 
                                                        onClick={() => handleRemoveTimeBlock(selectedDay, block.blockId)}
                                                        className="ml-auto"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => {
                                        const startTime = prompt('Enter start time (HH:mm):');
                                        const endTime = prompt('Enter end time (HH:mm):');
                                        const reason = prompt('Enter reason (optional):');
                                        if (startTime && endTime) {
                                            handleAddTimeBlock(selectedDay, startTime, endTime, reason || null);
                                        }
                                    }}
                                    className="mt-4 text-sm font-semibold text-green-600 hover:text-green-800"
                                >
                                    + Add Time Block
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Not available on {selectedDay}.</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Session & Break Settings */}
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-bold text-lg mb-4">Session & Break Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Default Session Duration (minutes)</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.sessionDefaults?.duration || 60}
                                            onChange={(e) => updatePreference('sessionDefaults.duration', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Buffer Before Session (minutes)</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.sessionDefaults?.bufferBefore || 10}
                                            onChange={(e) => updatePreference('sessionDefaults.bufferBefore', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Buffer After Session (minutes)</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.sessionDefaults?.bufferAfter || 10}
                                            onChange={(e) => updatePreference('sessionDefaults.bufferAfter', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cancellation Window (hours)</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.sessionDefaults?.cancellationWindow || 24}
                                            onChange={(e) => updatePreference('sessionDefaults.cancellationWindow', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences?.sessionDefaults?.autoAccept || false}
                                            onChange={(e) => updatePreference('sessionDefaults.autoAccept', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">Auto-accept bookings</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* Booking Window Settings */}
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-bold text-lg mb-4">Booking Window Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Advance Booking Days</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.bookingWindow?.advanceDays || 60}
                                            onChange={(e) => updatePreference('bookingWindow.advanceDays', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Minimum Notice Hours</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.bookingWindow?.minimumNoticeHours || 24}
                                            onChange={(e) => updatePreference('bookingWindow.minimumNoticeHours', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Maximum Bookings Per Day</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={preferences?.bookingWindow?.maximumBookingsPerDay || 8}
                                            onChange={(e) => updatePreference('bookingWindow.maximumBookingsPerDay', parseInt(e.target.value))}
                                            className="w-full p-2.5 border rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Notification Settings */}
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-bold text-lg mb-4">Notification Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3">Email Notifications</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences?.notifications?.email?.bookingConfirmation || false}
                                            onChange={(e) => updatePreference('notifications.email.bookingConfirmation', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Booking Confirmation</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences?.notifications?.email?.cancellationAlert || false}
                                            onChange={(e) => updatePreference('notifications.email.cancellationAlert', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Cancellation Alert</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences?.notifications?.email?.reminderNotifications || false}
                                            onChange={(e) => updatePreference('notifications.email.reminderNotifications', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Reminder Notifications</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">SMS Notifications</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences?.notifications?.sms?.bookingConfirmation || false}
                                            onChange={(e) => updatePreference('notifications.sms.bookingConfirmation', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Booking Confirmation</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences?.notifications?.sms?.cancellationAlert || false}
                                            onChange={(e) => updatePreference('notifications.sms.cancellationAlert', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Cancellation Alert</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Time-Off & Blocked Slots */}
                    <div className="p-6 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Time-Off & Blocked Slots</h3>
                            <button 
                                onClick={() => setShowTimeOffModal(true)}
                                className="px-3 py-1.5 text-sm font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                            >
                                + Block New Time
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Manage your holidays, vacations, and one-off unavailable times.</p>
                        <div className="space-y-3">
                            {timeOffBlocks.length > 0 ? (
                                timeOffBlocks.map((block) => (
                                    <div key={block.blockId} className="flex justify-between items-center p-3 border rounded-md">
                                        <div>
                                            <p><strong>{block.title || `${block.type.charAt(0).toUpperCase() + block.type.slice(1)}`}</strong></p>
                                            <p className="text-sm text-gray-500">
                                                {block.startDate} - {block.endDate}
                                                {!block.isAllDay && ` from ${block.startTime} to ${block.endTime}`}
                                            </p>
                                            {block.notes && (
                                                <p className="text-xs text-gray-400 mt-1">{block.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingTimeOff(block);
                                                    setShowTimeOffModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteTimeOff(block.blockId)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No time-off blocks configured.</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Booked Slots Management */}
                    <div className="p-6 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Booked Slots</h3>
                            <button 
                                onClick={() => setShowBookedSlotModal(true)}
                                className="px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                            >
                                + Add Manual Block
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">View and manage all booked time slots including sessions, calendar events, and manual blocks.</p>
                        
                        {/* Filter tabs */}
                        <div className="flex space-x-2 mb-4">
                            <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">All</button>
                            <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">Sessions</button>
                            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Calendar</button>
                            <button className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">Manual</button>
                        </div>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {bookedSlots.length > 0 ? (
                                bookedSlots.slice(0, 10).map((slot) => {
                                    const getSlotColor = (type, status) => {
                                        if (status === 'cancelled') return 'bg-red-50 border-red-200';
                                        switch (type) {
                                            case 'session': return 'bg-green-50 border-green-200';
                                            case 'googleCalendar': return 'bg-blue-50 border-blue-200';
                                            case 'manual': return 'bg-orange-50 border-orange-200';
                                            case 'timeoff': return 'bg-purple-50 border-purple-200';
                                            default: return 'bg-gray-50 border-gray-200';
                                        }
                                    };
                                    
                                    const getSlotIcon = (type) => {
                                        switch (type) {
                                            case 'session': return '👤';
                                            case 'googleCalendar': return '📅';
                                            case 'manual': return '🔒';
                                            case 'timeoff': return '🏖️';
                                            default: return '📌';
                                        }
                                    };
                                    
                                    return (
                                        <div key={slot.slotId} className={`flex justify-between items-center p-3 border rounded-md ${getSlotColor(slot.type, slot.status)}`}>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">{getSlotIcon(slot.type)}</span>
                                                <div>
                                                    <p className="font-medium">
                                                        {slot.title || 
                                                         (slot.type === 'session' ? `Session with Client ${slot.clientId}` : 
                                                          slot.type === 'manual' ? (slot.reason || 'Manual Block') :
                                                          slot.type === 'timeoff' ? 'Time Off' :
                                                          'Calendar Event')}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {slot.date} • {slot.startTime} - {slot.endTime}
                                                        {slot.status === 'cancelled' && ' • Cancelled'}
                                                    </p>
                                                    {slot.notes && (
                                                        <p className="text-xs text-gray-500 mt-1">{slot.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {(slot.type === 'manual' || slot.type === 'timeoff') && (
                                                    <>
                                                        <button 
                                                            onClick={() => {
                                                                setEditingBookedSlot(slot);
                                                                setBookedSlotForm({
                                                                    type: slot.type,
                                                                    date: slot.date,
                                                                    startTime: slot.startTime,
                                                                    endTime: slot.endTime,
                                                                    title: slot.title || '',
                                                                    notes: slot.notes || '',
                                                                    reason: slot.reason || '',
                                                                    clientId: slot.clientId || '',
                                                                    sessionId: slot.sessionId || '',
                                                                    googleEventId: slot.googleEventId || '',
                                                                    status: slot.status || 'active'
                                                                });
                                                                setShowBookedSlotModal(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteBookedSlot(slot.slotId)}>
                                                            <TrashIcon />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-center py-8">No booked slots found.</p>
                            )}
                            {bookedSlots.length > 10 && (
                                <p className="text-center text-sm text-gray-500 pt-2">
                                    Showing 10 of {bookedSlots.length} slots
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <aside className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-md mb-2">Bulk Actions</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={() => {
                                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                    Promise.all(days.map(day => updateDayAvailability(day, false)));
                                }}
                                className="w-full p-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-left"
                            >
                                Clear all availability for this week
                            </button>
                            <button 
                                onClick={() => {
                                    const workdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                                    Promise.all(workdays.map(day => updateDayAvailability(day, true)));
                                }}
                                className="w-full p-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-left"
                            >
                                Copy Monday's schedule to all weekdays
                            </button>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-md mb-4">Real-time Preview</h3>
                        <div className="flex justify-around mb-4 gap-2">
                            <button className="w-full py-2 text-green-800 bg-green-100 rounded-lg font-semibold">Available</button>
                            <button className="w-full py-2 text-red-800 bg-red-100 rounded-lg font-semibold">Booked</button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between p-2 rounded-lg bg-green-100 text-green-800"><p>9:00 AM - 9:50 AM</p><span className="font-semibold">Open</span></div>
                            <div className="flex justify-between p-2 rounded-lg bg-green-100 text-green-800"><p>10:00 AM - 10:50 AM</p><span className="font-semibold">Open</span></div>
                            <div className="flex justify-between p-2 rounded-lg bg-red-100 text-red-800"><p>11:00 AM - 11:50 AM</p><span className="font-semibold">O. Chen</span></div>
                            <div className="text-center text-xs text-gray-500 p-2 rounded-lg bg-gray-100">Lunch Break (12:00 PM - 1:00 PM)</div>
                            <div className="flex justify-between p-2 rounded-lg bg-green-100 text-green-800 relative"><p>1:00 PM - 1:50 PM</p><span className="font-semibold">Open</span></div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-4">Drag and drop to reorder time slots.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-md mb-2">Calendar Integration</h3>
                        <div className="flex items-center">
                            <p className="font-semibold text-sm">Google Calendar</p>
                            <span className="ml-auto text-sm text-blue-600 font-semibold flex items-center gap-1"><CheckCircleIcon className="text-blue-500" /> Synced</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Conflicts with existing calendar events will be highlighted.</p>
                    </div>
                </aside>
            </div>
            
            {/* Time-Off Modal */}
            {showTimeOffModal && (
                <TimeOffModal
                    isOpen={showTimeOffModal}
                    onClose={() => {
                        setShowTimeOffModal(false);
                        setEditingTimeOff(null);
                    }}
                    onSave={editingTimeOff ? 
                        (updates) => handleEditTimeOff(editingTimeOff.blockId, updates) : 
                        handleAddTimeOff
                    }
                    editingBlock={editingTimeOff}
                />
            )}
            
            {/* Booked Slot Modal */}
            {showBookedSlotModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {editingBookedSlot ? 'Edit Booked Slot' : 'Add Manual Block'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowBookedSlotModal(false);
                                    setEditingBookedSlot(null);
                                    setBookedSlotForm({
                                        type: 'manual',
                                        date: '',
                                        startTime: '',
                                        endTime: '',
                                        title: '',
                                        notes: '',
                                        reason: '',
                                        clientId: '',
                                        sessionId: '',
                                        googleEventId: '',
                                        status: 'active'
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleBookedSlotSubmit} className="space-y-4">
                            {/* Slot Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Type</label>
                                <select
                                    value={bookedSlotForm.type}
                                    onChange={(e) => setBookedSlotForm({...bookedSlotForm, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="manual">Manual Block</option>
                                    <option value="timeoff">Time Off</option>
                                    <option value="session">Session</option>
                                    <option value="googleCalendar">Google Calendar</option>
                                </select>
                            </div>
                            
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={bookedSlotForm.date}
                                    onChange={(e) => setBookedSlotForm({...bookedSlotForm, date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            
                            {/* Time Range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={bookedSlotForm.startTime}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, startTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={bookedSlotForm.endTime}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, endTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Title (for manual and timeoff) */}
                            {(bookedSlotForm.type === 'manual' || bookedSlotForm.type === 'timeoff') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={bookedSlotForm.title}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Brief title for this block"
                                    />
                                </div>
                            )}
                            
                            {/* Reason (for manual blocks) */}
                            {bookedSlotForm.type === 'manual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <input
                                        type="text"
                                        value={bookedSlotForm.reason}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, reason: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Reason for blocking this time"
                                    />
                                </div>
                            )}
                            
                            {/* Client ID (for sessions) */}
                            {bookedSlotForm.type === 'session' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                                    <input
                                        type="text"
                                        value={bookedSlotForm.clientId}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, clientId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Client identifier"
                                        required
                                    />
                                </div>
                            )}
                            
                            {/* Google Event ID (for calendar events) */}
                            {bookedSlotForm.type === 'googleCalendar' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Event ID</label>
                                    <input
                                        type="text"
                                        value={bookedSlotForm.googleEventId}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, googleEventId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Google Calendar event ID"
                                        required
                                    />
                                </div>
                            )}
                            
                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={bookedSlotForm.notes}
                                    onChange={(e) => setBookedSlotForm({...bookedSlotForm, notes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows="3"
                                    placeholder="Additional notes or description"
                                />
                            </div>
                            
                            {/* Status (for editing) */}
                            {editingBookedSlot && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={bookedSlotForm.status}
                                        onChange={(e) => setBookedSlotForm({...bookedSlotForm, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookedSlotModal(false);
                                        setEditingBookedSlot(null);
                                        setBookedSlotForm({
                                            type: 'manual',
                                            date: '',
                                            startTime: '',
                                            endTime: '',
                                            title: '',
                                            notes: '',
                                            reason: '',
                                            clientId: '',
                                            sessionId: '',
                                            googleEventId: '',
                                            status: 'active'
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {editingBookedSlot ? 'Update Slot' : 'Add Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

// Time-Off Modal Component
function TimeOffModal({ isOpen, onClose, onSave, editingBlock }) {
    const [title, setTitle] = useState(editingBlock?.title || '');
    const [startDate, setStartDate] = useState(editingBlock?.startDate || '');
    const [endDate, setEndDate] = useState(editingBlock?.endDate || '');
    const [isAllDay, setIsAllDay] = useState(editingBlock?.isAllDay !== undefined ? editingBlock.isAllDay : true);
    const [startTime, setStartTime] = useState(editingBlock?.startTime || '09:00');
    const [endTime, setEndTime] = useState(editingBlock?.endTime || '17:00');
    const [type, setType] = useState(editingBlock?.type || 'vacation');
    const [notes, setNotes] = useState(editingBlock?.notes || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const timeOffData = {
            title,
            startDate,
            endDate,
            isAllDay,
            startTime: isAllDay ? null : startTime,
            endTime: isAllDay ? null : endTime,
            type,
            notes: notes.trim() || null
        };
        
        if (editingBlock) {
            onSave(timeOffData);
        } else {
            onSave(timeOffData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">
                    {editingBlock ? 'Edit Time-Off Block' : 'Add Time-Off Block'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g., Summer Vacation, Doctor Appointment"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Block Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="vacation">Vacation</option>
                            <option value="holiday">Holiday</option>
                            <option value="personal">Personal</option>
                            <option value="sick">Sick</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAllDay}
                                onChange={(e) => setIsAllDay(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">All day</span>
                        </label>
                    </div>
                    
                    {!isAllDay && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                            rows={2}
                            placeholder="Additional details..."
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            {editingBlock ? 'Update' : 'Add'} Block
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


