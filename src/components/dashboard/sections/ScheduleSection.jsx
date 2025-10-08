import React from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, CheckCircle, UserPlus, ChevronDown } from 'lucide-react';
import { auth } from '../../../services/firebase/config';
import { getGoogleCalendarConfig, updateGoogleCalendarConfig, getTherapistDocumentIdByEmail } from '../../../services/firebase/calendar';
import { getCalendarEvents, refreshAccessToken } from '../../../services/google/calendar';
import NewAppointmentModal from './AddAppointment';
import ManageAvailabilitySection from './ManageAvailability';

// Mock data for clients
const clients = [
    // ... (keeping existing client data)
    {
        name: 'James Rodriguez',
        email: 'james.rodriguez@example.com',
        phone: '(555) 123-4567',
        status: 'Active',
        lastSession: 'June 15, 2024',
        nextAppointment: 'June 22, 2024',
        totalSessions: 12,
        avatar: 'https://placehold.co/64x64/c7d2fe/312e81?text=JR',
    },
    {
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        phone: '(555) 987-6543',
        status: 'Upcoming',
        lastSession: 'June 1, 2024',
        nextAppointment: 'June 25, 2024',
        totalSessions: 5,
        avatar: 'https://placehold.co/64x64/f3e8ff/581c87?text=MG',
    },
     { name: 'Ethan Hayes', avatar: 'https://placehold.co/64x64/dcfce7/14532d?text=EH' },
     { name: 'Chloe Davis', avatar: 'https://placehold.co/64x64/f3e8ff/581c87?text=CD' },
     { name: 'Mia Williams', avatar: 'https://placehold.co/64x64/fee2e2/991b1b?text=MW' },
    // ... (add other clients if needed)
];

// Mock data for schedule
const scheduleData = {
    '25': [
        { client: 'Olivia Chen', time: '9:00 - 9:50 AM', type: 'Individual Therapy', status: 'Confirmed', color: 'blue' }
    ],
    '26': [
        { client: 'Ethan Hayes', time: '11:00 - 11:50 AM', type: 'Couples Counseling', status: 'Confirmed', color: 'purple' },
        { client: 'Chloe Davis', time: '1:00 - 2:50 PM', type: 'Adolescent Therapy', status: 'Pending', color: 'yellow' }
    ],
    '27': [
        { client: 'James Rodriguez', time: '10:00 - 10:50 AM', type: 'Individual Therapy', status: 'Confirmed', color: 'blue' },
         { client: 'Mia Williams', time: '1:00 - 1:50 PM', type: 'Individual Therapy', status: 'Cancelled', color: 'red' }
    ],
};


export default function ScheduleSection() {
    const [eventsByDate, setEventsByDate] = React.useState({});
    const [connected, setConnected] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState('week');
    const [currentStart, setCurrentStart] = React.useState(() => {
        const now = new Date();
        const start = new Date(now);
        const day = start.getDay();
        const diffToMon = (day === 0 ? -6 : 1) - day;
        start.setDate(start.getDate() + diffToMon);
        start.setHours(0,0,0,0);
        return start;
    });
    const [showManageAvailability, setShowManageAvailability] = React.useState(false);

    const getWeekDays = React.useCallback((startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
            days.push({ day: dayLabel, date: d.getDate(), fullDate: d });
        }
        return days;
    }, []);
    const weekDays = getWeekDays(currentStart);
    
    const statusIcons = {
        Confirmed: <CheckCircle className="text-green-500" size={12} />,
        Pending: <UserPlus className="text-yellow-500" size={12} />,
        Cancelled: <ChevronDown className="text-red-500" size={12} />, // Placeholder icon
    };

    const colorClasses = {
        blue: 'border-l-4 border-blue-500 bg-blue-50',
        purple: 'border-l-4 border-purple-500 bg-purple-50',
        yellow: 'border-l-4 border-yellow-500 bg-yellow-50',
        red: 'border-l-4 border-red-500 bg-red-50'
    };

    const formatDateKey = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getRangeForMode = React.useCallback(() => {
        if (viewMode === 'day') {
            const start = new Date(currentStart);
            start.setHours(0,0,0,0);
            const end = new Date(start);
            end.setDate(start.getDate() + 1);
            return { start, end };
        }
        if (viewMode === 'month') {
            const anchor = new Date(currentStart);
            const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
            const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
            return { start, end };
        }
        const start = new Date(currentStart);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return { start, end };
    }, [currentStart, viewMode]);

    const syncGoogleEvents = React.useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;
        const docId = await getTherapistDocumentIdByEmail(user.email);
        if (!docId) return;
        const cfg = await getGoogleCalendarConfig(docId);
        setConnected(!!cfg?.isConnected);
        if (!cfg?.isConnected || !cfg.calendarId) return;
        let accessToken = cfg.accessToken;
        const { start, end } = getRangeForMode();
        try {
            const items = await getCalendarEvents(accessToken, cfg.calendarId, { timeMin: start, timeMax: end });
            const byDate = {};
            items.forEach(evt => {
                const startStr = evt.start?.dateTime || evt.start?.date;
                if (!startStr) return;
                const d = new Date(startStr);
                const key = formatDateKey(d);
                if (!byDate[key]) byDate[key] = [];
                byDate[key].push(evt);
            });
            setEventsByDate(byDate);
            await updateGoogleCalendarConfig(docId, { lastSyncAt: new Date() });
        } catch (e) {
            if (cfg.refreshToken) {
                try {
                    const refreshed = await refreshAccessToken(cfg.refreshToken);
                    accessToken = refreshed.access_token;
                    const items = await getCalendarEvents(accessToken, cfg.calendarId, { timeMin: start, timeMax: end });
                    const byDate = {};
                    items.forEach(evt => {
                        const startStr = evt.start?.dateTime || evt.start?.date;
                        if (!startStr) return;
                        const d = new Date(startStr);
                        const key = formatDateKey(d);
                        if (!byDate[key]) byDate[key] = [];
                        byDate[key].push(evt);
                    });
                    setEventsByDate(byDate);
                    await updateGoogleCalendarConfig(docId, { accessToken, lastSyncAt: new Date() });
                } catch (err) {
                    console.error('Failed to refresh token and sync events:', err);
                }
            }
        }
    }, [getRangeForMode]);

    React.useEffect(() => {
        // sync when week changes
        syncGoogleEvents();
        const id = setInterval(syncGoogleEvents, 300000); // 5 minutes
        return () => clearInterval(id);
    }, [syncGoogleEvents, currentStart]);

    if (showManageAvailability) {
        return (
            <ManageAvailabilitySection onBack={() => setShowManageAvailability(false)} />
        )
    }
    return (
        <>
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Schedule</h1>
                    <p className="text-gray-500 mt-1">
                        {(() => {
                            const start = currentStart;
                            const end = new Date(currentStart);
                            end.setDate(currentStart.getDate() + 6);
                            const sameMonth = start.getMonth() === end.getMonth();
                            const startStr = `${start.toLocaleString(undefined, { month: 'short' })} ${start.getDate()}`;
                            const endStr = `${end.toLocaleString(undefined, { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
                            return sameMonth ? `${start.toLocaleString(undefined, { month: 'short' })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}` : `${startStr} - ${endStr}`;
                        })()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => {
                        const now = new Date();
                        if (viewMode === 'day') {
                            now.setHours(0,0,0,0);
                            setCurrentStart(now);
                        } else if (viewMode === 'month') {
                            const start = new Date(now.getFullYear(), now.getMonth(), 1);
                            setCurrentStart(start);
                        } else {
                            const start = new Date(now);
                            const day = start.getDay();
                            const diffToMon = (day === 0 ? -6 : 1) - day;
                            start.setDate(start.getDate() + diffToMon);
                            start.setHours(0,0,0,0);
                            setCurrentStart(start);
                        }
                    }} className="px-3 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Today</button>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button onClick={() => {
                            const prev = new Date(currentStart);
                            if (viewMode === 'day') {
                                prev.setDate(prev.getDate() - 1);
                            } else if (viewMode === 'month') {
                                prev.setMonth(prev.getMonth() - 1, 1);
                            } else {
                                prev.setDate(prev.getDate() - 7);
                            }
                            setCurrentStart(prev);
                        }} className="p-2 text-gray-600 hover:bg-gray-50 rounded-l-md"><ChevronLeft size={20} /></button>
                        <button onClick={() => {
                            const next = new Date(currentStart);
                            if (viewMode === 'day') {
                                next.setDate(next.getDate() + 1);
                            } else if (viewMode === 'month') {
                                next.setMonth(next.getMonth() + 1, 1);
                            } else {
                                next.setDate(next.getDate() + 7);
                            }
                            setCurrentStart(next);
                        }} className="p-2 text-gray-600 hover:bg-gray-50 border-l border-gray-300 rounded-r-md"><ChevronRight size={20} /></button>
                    </div>
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => { setViewMode('day'); const t = new Date(); t.setHours(0,0,0,0); setCurrentStart(t); }} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode==='day' ? 'bg-white text-teal-700 shadow' : 'text-gray-600'}`}>Day</button>
                        <button onClick={() => { setViewMode('week'); }} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode==='week' ? 'bg-white text-teal-700 shadow' : 'text-gray-600'}`}>Week</button>
                        <button onClick={() => { setViewMode('month'); const m = new Date(currentStart); const first = new Date(m.getFullYear(), m.getMonth(), 1); setCurrentStart(first); }} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode==='month' ? 'bg-white text-teal-700 shadow' : 'text-gray-600'}`}>Month</button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
                        <Plus size={20} /> New Appointment
                    </button>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Calendar View */}
                {viewMode === 'day' && (
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="text-center py-2 border-b border-gray-200">
                            <p className="text-xs text-gray-500">{currentStart.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</p>
                            <p className="text-lg font-semibold">{currentStart.getDate()}</p>
                        </div>
                        <div className="p-2 space-y-1">
                            {(eventsByDate[formatDateKey(currentStart)] || []).map((evt, i) => (
                                <div key={i} className={`p-2 rounded-md text-xs border-l-4 border-emerald-500 bg-emerald-50`}>
                                    <p className="font-bold text-gray-800">{evt.summary || 'Calendar Event'}</p>
                                    <p className="text-gray-600">{(() => {
                                        const s = evt.start?.dateTime || evt.start?.date;
                                        const e = evt.end?.dateTime || evt.end?.date;
                                        if (!s || !e) return '';
                                        const sd = new Date(s); const ed = new Date(e);
                                        const pad = (n) => n.toString().padStart(2,'0');
                                        return `${pad(sd.getHours())}:${pad(sd.getMinutes())} - ${pad(ed.getHours())}:${pad(ed.getMinutes())}`;
                                    })()}</p>
                                    <p className="text-gray-500">{evt.organizer?.email || evt.description || ''}</p>
                                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                                        <CheckCircle className="text-emerald-500" size={12} /> Synced
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {viewMode === 'week' && (
                    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                        {weekDays.map(({ day, date, fullDate }) => (
                            <div key={day+date} className="bg-white">
                                <div className="text-center py-2 border-b border-gray-200">
                                    <p className="text-xs text-gray-500">{day}</p>
                                    <p className="text-lg font-semibold">{date}</p>
                                </div>
                                <div className="p-1 space-y-1 h-full">
                                    {(eventsByDate[formatDateKey(fullDate)] || []).map((evt, i) => (
                                        <div key={i} className={`p-2 rounded-md text-xs border-l-4 border-emerald-500 bg-emerald-50`}>
                                            <p className="font-bold text-gray-800">{evt.summary || 'Calendar Event'}</p>
                                            <p className="text-gray-600">{(() => {
                                                const s = evt.start?.dateTime || evt.start?.date;
                                                const e = evt.end?.dateTime || evt.end?.date;
                                                if (!s || !e) return '';
                                                const sd = new Date(s); const ed = new Date(e);
                                                const pad = (n) => n.toString().padStart(2,'0');
                                                return `${pad(sd.getHours())}:${pad(sd.getMinutes())} - ${pad(ed.getHours())}:${pad(ed.getMinutes())}`;
                                            })()}</p>
                                            <p className="text-gray-500">{evt.organizer?.email || evt.description || ''}</p>
                                            <div className="flex items-center gap-1 mt-1 text-gray-600">
                                                <CheckCircle className="text-emerald-500" size={12} /> Synced
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {viewMode === 'month' && (() => {
                    const firstOfMonth = new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
                    const startDay = (firstOfMonth.getDay() + 6) % 7; // Monday as 0
                    const gridStart = new Date(firstOfMonth);
                    gridStart.setDate(firstOfMonth.getDate() - startDay);
                    const cells = [];
                    for (let i = 0; i < 42; i++) {
                        const d = new Date(gridStart);
                        d.setDate(gridStart.getDate() + i);
                        const inMonth = d.getMonth() === currentStart.getMonth();
                        cells.push({ d, inMonth });
                    }
                    const weekdayHeaders = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
                    return (
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                {weekdayHeaders.map(w => (
                                    <div key={w} className="p-2 text-center text-xs font-semibold text-gray-500">{w}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-px bg-gray-200">
                                {cells.map(({ d, inMonth }, idx) => (
                                    <div key={idx} className={`bg-white min-h-[100px] ${inMonth ? '' : 'opacity-50'}`}>
                                        <div className="text-right p-2 text-xs font-semibold text-gray-700">{d.getDate()}</div>
                                        <div className="px-1 pb-2 space-y-1">
                                            {(eventsByDate[formatDateKey(d)] || []).slice(0,3).map((evt, i) => (
                                                <div key={i} className="p-1 rounded text-[10px] border-l-4 border-emerald-500 bg-emerald-50">
                                                    <div className="font-semibold text-gray-800 truncate">{evt.summary || 'Event'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
                {/* Right Sidebar */}
                <div className="w-80 flex flex-col gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-3">Upcoming Appointments</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="text-center bg-teal-50 text-teal-700 p-2 rounded-md">
                                    <p className="text-xs font-bold">TUE</p>
                                    <p className="text-lg font-extrabold">25</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Olivia Chen</p>
                                    <p className="text-xs text-gray-500">9:00 AM - Individual</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                 <div className="text-center bg-teal-50 text-teal-700 p-2 rounded-md">
                                    <p className="text-xs font-bold">WED</p>
                                    <p className="text-lg font-extrabold">26</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Ethan Hayes</p>
                                    <p className="text-xs text-gray-500">11:00 AM - Couples</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                 <div className="text-center bg-teal-50 text-teal-700 p-2 rounded-md">
                                    <p className="text-xs font-bold">WED</p>
                                    <p className="text-lg font-extrabold">26</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Chloe Davis</p>
                                    <p className="text-xs text-gray-500 flex items-center">2:00 PM - Adolescent <span className="ml-1 px-1.5 py-0.5 text-yellow-800 bg-yellow-100 rounded-full text-[10px] font-medium">Pending</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-3">Calendar Integration</h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                Google Calendar
                              </div>
                              <span className={`flex items-center gap-1 font-semibold ${connected ? 'text-green-600' : 'text-gray-500'}`}><CheckCircle size={14}/>{connected ? 'Connected' : 'Not Connected'}</span>
                           </div>
                        </div>
                     </div>
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                          <div className="bg-white inline-block p-2 rounded-full mb-2">
                            <Calendar size={24} className="text-teal-600"/>
                          </div>
                          <h3 className="font-semibold text-sm">Available Slots</h3>
                          <p className="text-xs text-gray-500 mt-1 mb-3">View and manage your open availability for clients to book.</p>
                          <button
                            className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm"
                            onClick={() => setShowManageAvailability(true)}
                          >
                            Manage Availability
                          </button>
                     </div>
                </div>
            </div>
        </div>
        <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

