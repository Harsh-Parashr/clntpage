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
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'clients.json');

// Helper to read clients from file
function readClients() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Helper to write clients to file
function writeClients(clients) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2), 'utf-8');
}

// GET all clients
app.get('/api/clients', (req, res) => {
  const clients = readClients();
  // Simulate network delay (e.g., 1.2s)
  setTimeout(() => {
    res.json(clients);
  }, 12000);
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

app.listen(PORT, () => {
  console.log(`Client API server running on http://localhost:${PORT}`);
});
