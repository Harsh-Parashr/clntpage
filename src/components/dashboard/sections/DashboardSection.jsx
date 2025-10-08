import React from 'react';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { auth } from '../../../services/firebase/config';
import { getGoogleCalendarConfig, connectGoogleCalendar, getTherapistDocumentIdByEmail } from '../../../services/firebase/calendar';
import { getGoogleAuthUrl, exchangeCodeForTokens } from '../../../services/google/calendar';

// Mock data for appointments
const appointments = [
  {
    time: '09:00 AM',
    patientName: 'James Rodriguez',
    sessionType: 'Individual Session',
    status: 'Confirmed',
    color: 'bg-blue-500',
  },
  {
    time: '10:30 AM',
    patientName: 'Maria Garcia',
    sessionType: 'Couples Therapy',
    status: 'Confirmed',
    color: 'bg-purple-500',
  },
  {
    time: '01:00 PM',
    patientName: 'Olivia Chen',
    sessionType: 'Individual Session',
    status: 'Pending',
    color: 'bg-yellow-500',
  },
  {
    time: '02:30 PM',
    patientName: 'Michael Taylor',
    sessionType: 'Individual Session',
    status: 'Cancelled',
    color: 'bg-red-500',
  },
  {
    time: '04:00 PM',
    patientName: 'The Millers',
    sessionType: 'Family Session',
    status: 'Confirmed',
    color: 'bg-indigo-500',
  },
];

// Helper component for status badges
const StatusBadge = ({ status }) => {
  const styles = {
    Confirmed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

// Helper component for action buttons in each appointment card
const AppointmentActions = ({ status }) => {
  switch (status) {
    case 'Confirmed':
      return (
        <>
          <button className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">Join Session</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">Reschedule</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
        </>
      );
    case 'Pending':
      return (
        <>
          <button className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">Confirm</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">Reschedule</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
        </>
      );
    case 'Cancelled':
      return (
        <>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">Reschedule</button>
        </>
      );
    default:
      return null;
  }
};


// Main Component
export default function DashboardSection({ therapistName }) {
  const [googleConnected, setGoogleConnected] = React.useState(false);

  React.useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const docId = await getTherapistDocumentIdByEmail(user.email);
        if (!docId) return;
        const cfg = await getGoogleCalendarConfig(docId);
        setGoogleConnected(!!cfg?.isConnected);
      } catch (e) {
        // noop
      }
    })();
  }, []);

  const handleConnectGoogle = React.useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const docId = await getTherapistDocumentIdByEmail(user.email);
      if (!docId) throw new Error('Therapist document not found');

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const authUrl = getGoogleAuthUrl(redirectUri);

      const popup = window.open(
        authUrl,
        'google_oauth2',
        'width=500,height=700'
      );

      const code = await new Promise((resolve, reject) => {
        const timer = setInterval(() => {
          try {
            if (popup && popup.closed) {
              clearInterval(timer);
              reject(new Error('Popup closed by user'));
            }
          } catch (e) {
            // Ignore cross-origin errors
          }
        }, 500);

        const handler = (event) => {
          if (event.origin !== window.location.origin) return;
          const { type, code, error } = event.data || {};
          if (type === 'GOOGLE_OAUTH2_CALLBACK') {
            window.removeEventListener('message', handler);
            clearInterval(timer);
            if (error) {
              reject(new Error(error));
            } else {
              resolve(code);
            }
          }
        };
        window.addEventListener('message', handler);
      });

      if (!code) return;
      const { access_token, refresh_token, calendar_id } = await exchangeCodeForTokens(code);

      await connectGoogleCalendar(docId, calendar_id, access_token, refresh_token || null);
      setGoogleConnected(true);
    } catch (err) {
      console.error('Google connect failed:', err);
      alert('Failed to connect Google Calendar. Please try again.');
    }
  }, []);

  return (
      <main className="flex-1 p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:flex-1">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">{`Welcome back, ${therapistName || 'Therapist'}`}</p>
            </header>

            {/* Today's Schedule */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Today's Schedule</h2>
              <div className="space-y-4">
                {appointments.map((appt, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className={`w-1.5 h-16 rounded-full ${appt.color}`}></div>
                    <div className="w-20 text-gray-600 font-semibold text-sm">{appt.time}</div>
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800">{appt.patientName}</p>
                      <p className="text-sm text-gray-500">{appt.sessionType}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={appt.status} />
                      <div className="flex items-center gap-2">
                        <AppointmentActions status={appt.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="w-full lg:w-72">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                <Plus className="h-5 w-5" />
                Schedule Appointment
              </button>
              <button
                onClick={googleConnected ? undefined : handleConnectGoogle}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg border transition-colors ${
                  googleConnected
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <LinkIcon className="h-5 w-5" />
                {googleConnected ? 'Google Calendar Connected' : 'Connect Google Calendar'}
              </button>
            </div>
          </div>
        </div>
      </main>
  );
}

