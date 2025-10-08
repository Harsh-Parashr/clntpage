const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'clients.json');

// Parse JSON bodies
app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://mentcura.com'
    : ['http://localhost:3000', 'http://localhost:5173']
}));

// --- Client API Helpers ---
function readClients() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeClients(clients) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2), 'utf-8');
}

// --- Client API Endpoints ---
// GET all clients
app.get('/api/clients', (req, res) => {
  const clients = readClients();
  // Simulate network delay (e.g., 1.2s)
  setTimeout(() => {
    res.json(clients);
  }, 1200);
});

// POST new client
app.post('/api/clients', (req, res) => {
  const newClient = req.body;
  if (!newClient || !newClient.name || !newClient.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const clients = readClients();
  // Generate unique id if not present
  newClient.id = newClient.id || `CL-${Date.now()}`;
  // Add empty fields for missing details
  const clientToAdd = {
    id: newClient.id,
    name: newClient.name,
    email: newClient.email,
    phone: newClient.phone || '',
    status: 'Active',
    lastSession: '',
    nextAppointment: '',
    totalSessions: 0,
    dob: newClient.dob || '',
    gender: newClient.gender || '',
    address: newClient.address || '',
    insurance: '',
    paymentStatus: '',
    frequency: '',
    treatmentGoals: [],
    sessionHistory: [],
    notes: [],
  };
  clients.push(clientToAdd);
  writeClients(clients);
  res.status(201).json(clientToAdd);
});

// PUT update client by id
app.put('/api/clients/:id', (req, res) => {
  const clientId = req.params.id;
  const updatedData = req.body;
  let clients = readClients();
  const idx = clients.findIndex(c => String(c.id) === String(clientId));
  if (idx === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }
  // Merge updated fields
  clients[idx] = { ...clients[idx], ...updatedData, id: clients[idx].id };
  writeClients(clients);
  res.json(clients[idx]);
});

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? 'https://mentcura.com/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback'
);

// Calendar API setup
const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client
});

// Exchange authorization code for tokens
app.post('/api/google/exchange-token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    // Temporarily update the redirect URI for this token exchange
    const currentRedirectUri = oauth2Client.redirectUri;
    oauth2Client.redirectUri = redirect_uri;
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Restore the original redirect URI
    oauth2Client.redirectUri = currentRedirectUri;
    
    // Get primary calendar ID
    oauth2Client.setCredentials(tokens);
    const response = await calendar.calendarList.list();
    const primaryCalendar = response.data.items.find(cal => cal.primary);
    
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      calendar_id: primaryCalendar.id
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Failed to exchange authorization code';
    
    if (error.code === 'invalid_grant') {
      statusCode = 400;
      errorMessage = 'Invalid authorization code or code already used';
    } else if (error.message && error.message.includes('redirect_uri_mismatch')) {
      statusCode = 400;
      errorMessage = 'Redirect URI mismatch';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Refresh access token
app.post('/api/google/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    oauth2Client.setCredentials({
      refresh_token: refresh_token
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    res.json({
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Failed to refresh access token',
      details: error.message 
    });
  }
});

// Get calendar events
app.get('/api/google/events', async (req, res) => {
  try {
    const { access_token, calendar_id, time_min, time_max } = req.query;
    
    oauth2Client.setCredentials({
      access_token: access_token
    });
    
    const listParams = {
      calendarId: calendar_id,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500,
    };
    if (time_min) listParams.timeMin = new Date(time_min).toISOString();
    if (time_max) listParams.timeMax = new Date(time_max).toISOString();

    const response = await calendar.events.list(listParams);
    
    res.json(response.data.items);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error.message 
    });
  }
});

// Create calendar event
app.post('/api/google/events', async (req, res) => {
  try {
    const { access_token, calendar_id, summary, description, start, end } = req.body;
    oauth2Client.setCredentials({ access_token });
    const response = await calendar.events.insert({
      calendarId: calendar_id,
      requestBody: {
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
      }
    });
    res.json({ id: response.data.id, htmlLink: response.data.htmlLink });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});