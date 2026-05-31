const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // parse JSON bodies
app.use(express.static(__dirname)); // serve static files (index.html, css, js, etc.)

// API routes
app.get('/api/registry', (req, res) => {
  // Simple mock data; could be replaced with a file read later
  const mockData = [
    { id: 1, name: 'Node A', status: 'active' },
    { id: 2, name: 'Node B', status: 'inactive' },
    { id: 3, name: 'Node C', status: 'active' }
  ];
  res.json(mockData);
});

app.post('/api/submit', (req, res) => {
  const payload = req.body;
  // In a real app, you'd persist the payload. Here we just echo success.
  res.json({ status: 'ok', received: payload });
});

// Fallback for client‑side routing – serve index.html for any unknown path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AWAAZ//OS development server running at http://localhost:${PORT}`);
});
