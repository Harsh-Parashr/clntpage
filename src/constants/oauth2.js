// OAuth2 configuration for Google Calendar API
export const GOOGLE_OAUTH2_CONFIG = {
  client_id: import.meta?.env?.VITE_GOOGLE_CLIENT_ID || '640148942262-aoupa14tl76fhaskh96lsfq3u5hf9h1p.apps.googleusercontent.com',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  scopes: [
    'https://www.googleapis.com/auth/calendar',         // Full access to calendars
    'https://www.googleapis.com/auth/calendar.events',  // Full access to events
    'https://www.googleapis.com/auth/calendar.settings.readonly', // Read calendar settings
  ],
  // Response type 'code' for authorization code flow (more secure than implicit flow)
  response_type: 'code',
  // Access type 'offline' to get refresh token
  access_type: 'offline',
  // Force approval prompt to ensure we get refresh token
  prompt: 'consent'
};