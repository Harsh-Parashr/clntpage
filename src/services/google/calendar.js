import { GOOGLE_OAUTH2_CONFIG } from '../../constants/oauth2';

/**
 * Generate the Google OAuth2 authorization URL
 * @param {string} redirectUri - The URI to redirect to after authorization
 * @returns {string} The authorization URL
 */
export function getGoogleAuthUrl(redirectUri) {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH2_CONFIG.client_id,
    redirect_uri: redirectUri,
    response_type: GOOGLE_OAUTH2_CONFIG.response_type,
    access_type: GOOGLE_OAUTH2_CONFIG.access_type,
    prompt: GOOGLE_OAUTH2_CONFIG.prompt,
    scope: GOOGLE_OAUTH2_CONFIG.scopes.join(' ')
  });

  return `${GOOGLE_OAUTH2_CONFIG.auth_uri}?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param {string} code - The authorization code from Google
 * @returns {Promise<{access_token: string, refresh_token: string, calendar_id: string}>}
 */
export async function exchangeCodeForTokens(code) {
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  
  const response = await fetch('/api/google/exchange-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      code,
      redirect_uri: redirectUri 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to exchange authorization code');
  }

  return response.json();
}

/**
 * Get a new access token using the refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<{access_token: string, expiry_date: number}>}
 */
export async function refreshAccessToken(refreshToken) {
  const response = await fetch('/api/google/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to refresh access token');
  }

  return response.json();
}

/**
 * Get calendar events
 * @param {string} accessToken - The access token
 * @param {string} calendarId - The calendar ID
 * @returns {Promise<Array>} List of calendar events
 */
export async function getCalendarEvents(accessToken, calendarId, { timeMin, timeMax } = {}) {
  const params = new URLSearchParams({ access_token: accessToken, calendar_id: calendarId });
  if (timeMin) params.append('time_min', new Date(timeMin).toISOString());
  if (timeMax) params.append('time_max', new Date(timeMax).toISOString());
  const response = await fetch(`/api/google/events?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to fetch calendar events');
  }

  return response.json();
}

/**
 * Create a Google Calendar event
 * @param {string} accessToken
 * @param {string} calendarId
 * @param {{summary:string, description?:string, start:Date|string, end:Date|string}} payload
 * @returns {Promise<{id:string, htmlLink?:string}>}
 */
export async function createCalendarEvent(accessToken, calendarId, payload) {
  const body = {
    access_token: accessToken,
    calendar_id: calendarId,
    summary: payload.summary,
    description: payload.description || '',
    start: (payload.start instanceof Date) ? payload.start.toISOString() : payload.start,
    end: (payload.end instanceof Date) ? payload.end.toISOString() : payload.end,
  };
  const res = await fetch('/api/google/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.details || 'Failed to create event');
  }
  return res.json();
}