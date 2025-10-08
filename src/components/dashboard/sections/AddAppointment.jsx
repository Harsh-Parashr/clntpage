import React, { useState } from 'react';
import { auth } from '../../../services/firebase/config';
import { getGoogleCalendarConfig, addBookedSlot } from '../../../services/firebase/calendar';
import { createCalendarEvent } from '../../../services/google/calendar';

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

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-1">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

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

const AppointmentCard = ({ appointment }) => {
    const colorClasses = { blue: 'border-l-blue-500 bg-blue-50', purple: 'border-l-purple-500 bg-purple-50', yellow: 'border-l-yellow-500 bg-yellow-50', red: 'border-l-red-500 bg-red-50' };
    const statusClasses = { 'Confirmed': 'text-green-600', 'Pending': 'text-yellow-600', 'Canceled': 'text-red-600 line-through' };
    return (
        <div className={`p-2 rounded-lg border-l-4 ${colorClasses[appointment.color]} mb-2`}>
            <p className="font-semibold text-gray-800 text-sm">{appointment.name}</p>
            <p className="text-xs text-gray-600">{appointment.time}</p>
            <p className="text-xs text-gray-500 mt-1">{appointment.type}</p>
            <p className={`text-xs font-semibold mt-1 flex items-center ${statusClasses[appointment.status]}`}>
                {appointment.status === 'Confirmed' && <CheckCircleIcon />}
                {appointment.status}
            </p>
        </div>
    );
};


// --- New Appointment Modal Component ---
const NewAppointmentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // State for form inputs. In a real app, this would be more robust.
    const [client, setClient] = useState('');
    const [sessionType, setSessionType] = useState('individual');
    const [callType, setCallType] = useState('video');
    const [date, setDate] = useState('2024-06-27');
    const [time, setTime] = useState('11:00');
    const [duration, setDuration] = useState(50);
    const [notes, setNotes] = useState('');
    const [reminders, setReminders] = useState(true);
    const [googleCalendar, setGoogleCalendar] = useState(true);
    const [priority, setPriority] = useState(false);
    const [recurring, setRecurring] = useState(false);

    // Dummy data for select dropdowns
    const clients = [{ id: 1, name: 'James Rodriguez' }, { id: 2, name: 'Maria Garcia' }, { id: 3, name: 'David Smith' }, { id: 4, name: 'Emily Johnson' }];

    const handleSchedule = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');
            if (!client || !date || !time || !duration) throw new Error('Please complete all required fields');

            const startDate = new Date(`${date}T${time}:00`);
            const endDate = new Date(startDate.getTime() + duration * 60000);

            let googleEventId = null;
            if (googleCalendar) {
                const cfg = await getGoogleCalendarConfig(user.uid);
                if (!cfg?.isConnected || !cfg?.calendarId || !cfg?.accessToken) {
                    throw new Error('Google Calendar is not connected');
                }
                const created = await createCalendarEvent(cfg.accessToken, cfg.calendarId, {
                    summary: `${sessionType === 'individual' ? 'Individual' : sessionType === 'couple' ? "Couple's" : 'Family'} Session with ${client}`,
                    description: notes || '',
                    start: startDate,
                    end: endDate,
                });
                googleEventId = created.id;
            }

            await addBookedSlot(user.uid, {
                date,
                startTime: time,
                endTime: `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}`,
                timestamp: startDate,
                type: 'session',
                sessionId: null,
                clientId: client || null,
                googleEventId: googleEventId || null,
                reason: sessionType,
                notes: notes || '',
            });

            onClose();
        } catch (err) {
            alert(err.message || 'Failed to schedule appointment');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">New Appointment</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <div>
                        <label htmlFor="client-selection" className="block text-sm font-medium text-gray-700 mb-1">Client Selection</label>
                        <div className="relative"><SearchIcon /><select id="client-selection" value={client} onChange={(e) => setClient(e.target.value)} className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none transition"><option value="" disabled>Search or select a client...</option>{clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select><ChevronDownIcon /></div>
                        <p className="text-xs text-gray-500 mt-1.5">Client's local time: 10:30 AM (UTC-5)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Details</label>
                        <div className="flex space-x-4">
                            <div className="relative w-1/2"><select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none transition"><option value="individual">Individual Therapy</option><option value="couple">Couple's Therapy</option><option value="family">Family Therapy</option></select><ChevronDownIcon /></div>
                            <div className="relative w-1/2"><select value={callType} onChange={(e) => setCallType(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none transition"><option value="video">Video Call</option><option value="phone">Phone Call</option><option value="in-person">In Person</option></select><ChevronDownIcon /></div>
                        </div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                            <div className="relative"><input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" /></div>
                        </div>
                        <div className="self-end"><div className="relative"><input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" /></div></div>
                        <div className="self-end"><div className="relative"><select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none transition"><option value={30}>30 min</option><option value={50}>50 min</option><option value={60}>60 min</option><option value={90}>90 min</option></select><ChevronDownIcon /></div></div>
                        <p className="text-xs text-gray-500 sm:col-span-3">End time: 11:50 AM (Your Time: America/New_York)</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Options</label>
                        <div className="space-y-3">
                            <div className="flex items-center"><input id="recurring" type="checkbox" checked={recurring} onChange={() => setRecurring(!recurring)} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><label htmlFor="recurring" className="ml-2 block text-sm text-gray-900">Recurring Appointment</label></div>
                            <div className="flex items-center"><input id="reminders" type="checkbox" checked={reminders} onChange={() => setReminders(!reminders)} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><label htmlFor="reminders" className="ml-2 block text-sm text-gray-900">Send Email Reminders</label></div>
                            <div className="flex items-center"><input id="google-calendar" type="checkbox" checked={googleCalendar} onChange={() => setGoogleCalendar(!googleCalendar)} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><label htmlFor="google-calendar" className="ml-2 block text-sm text-gray-900">Add to Google Calendar</label></div>
                            <div className="flex items-center"><input id="priority" type="checkbox" checked={priority} onChange={() => setPriority(!priority)} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><label htmlFor="priority" className="ml-2 block text-sm text-gray-900">Mark as High Priority</label></div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Description</label>
                        <textarea id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any relevant notes for the session..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"></textarea>
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md flex items-start">
                    <AlertTriangleIcon />
                    <div><p className="font-bold text-yellow-800">Conflict detected</p><p className="text-sm text-yellow-700">You have another appointment with James Rodriguez from 10:00 AM to 10:50 AM.</p></div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-3">
                    <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSchedule} className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"><CalendarIcon className="mr-2" /> Schedule Appointment</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Schedule Page Component ---
export default NewAppointmentModal;

