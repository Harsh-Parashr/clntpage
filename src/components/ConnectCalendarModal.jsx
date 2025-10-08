import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { connectGoogleCalendar, disconnectGoogleCalendar, getTherapistDocumentIdByEmail } from '../services/firebase/calendar';
import { getGoogleAuthUrl, exchangeCodeForTokens } from '../services/google/calendar';

import { auth } from '../services/firebase/config';

const ConnectCalendarModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleCalendarConnect = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Generate redirect URI
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      // Get authorization URL and redirect to Google
      const authUrl = getGoogleAuthUrl(redirectUri);
      
      // Open the authorization URL in a popup window
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

    } catch (err) {
      setError('Failed to initiate Google Calendar connection. Please try again.');
      console.error('Error connecting to Google Calendar:', err);
      setLoading(false);
    }
  };

  // Handle OAuth2 callback
  useEffect(() => {
    const handleOAuth2Callback = async (event) => {
      // Only handle messages from our window
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_OAUTH2_CALLBACK') {
        try {
          const { code } = event.data;
          
          // Exchange code for tokens and get calendar ID
          const { access_token, refresh_token, calendar_id } = await exchangeCodeForTokens(code);
          
          // Resolve therapist documentId by email
          const user = auth.currentUser;
          if (!user) throw new Error('Not authenticated');
          const docId = await getTherapistDocumentIdByEmail(user.email);
          if (!docId) throw new Error('Therapist document not found');
          // Connect the calendar
          await connectGoogleCalendar(
            docId,
            calendar_id,
            access_token,
            refresh_token
          );
          
          onClose();
        } catch (err) {
          setError('Failed to complete Google Calendar connection. Please try again.');
          console.error('Error in OAuth callback:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleOAuth2Callback);
    return () => window.removeEventListener('message', handleOAuth2Callback);
  }, [therapistId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Connect Google Calendar</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Connect your Google Calendar to automatically sync your appointments and manage your schedule efficiently.
          </p>
          
          {error && (
            <div className="text-red-500 mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleCalendarConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Connect with Google Calendar'}
          </button>
        </div>

        <div className="text-sm text-gray-500">
          <p className="mb-2">By connecting, you agree to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Allow MentCura to view and manage your calendar</li>
            <li>Sync your appointments automatically</li>
            <li>Manage availability based on your calendar events</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectCalendarModal;