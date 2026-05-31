const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Ensure a .env file exists with sensible development defaults
const ENV_PATH = path.join(__dirname, '.env');
if (!fs.existsSync(ENV_PATH)) {
  const defaultJwt = crypto.randomBytes(24).toString('hex');
  const adminPass = process.env.ADMIN_PASS || 'adminpass';
  const content = `JWT_SECRET=${defaultJwt}\nPORT=3000\nADMIN_PASS=${adminPass}\nOPENAI_API_KEY=\n`;
  try { fs.writeFileSync(ENV_PATH, content, { flag: 'wx', mode: 0o600 }); console.log('.env created with secure defaults'); } catch (e) { /* ignore if race */ }
}
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('./db_sqlite');
const chatbot = require('./chatbot');
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI client initialized');
  } catch (e) {
    console.warn('Failed to initialize OpenAI client', e.message || e);
  }
}

const PORT = process.env.PORT || 3000;

// Ensure database exists (run migrations automatically if missing)
const DB_PATH = path.join(__dirname, 'awaaz.db');
if (!fs.existsSync(DB_PATH)) {
  console.log('Database not found at', DB_PATH, '- running migrations');
  try { require('./migrate'); } catch (e) { console.warn('Migration step failed:', e && e.message ? e.message : e); }
}

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://unpkg.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:', 'https:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
    }
  }
}));
app.use(cors());
app.use(express.json());

// Basic rate limiter
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', apiLimiter);

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-for-prod';

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// API: list reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.getReports(500);
    res.json(reports);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Validation schema for creating reports
const reportSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().allow('').max(2000),
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  tags: Joi.array().items(Joi.string()).default([])
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// API: post new report (protected)
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    const { error, value } = reportSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const report = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: value.title,
      description: value.description || '',
      lat: parseFloat(value.lat),
      lon: parseFloat(value.lon),
      tags: value.tags || [],
      createdAt: new Date().toISOString()
    };

    await db.addReport(report);
    if (global.io) global.io.emit('new-report', report);
    res.status(201).json(report);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// API: chatbot stub
app.post('/api/chat', async (req, res) => {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: 'Missing question' });

  // If OpenAI key present, use the API for richer responses
  if (openaiClient) {
    try {
      // Build a focused system prompt to keep responses informative and non-legal-advice
      const system = `You are Awaaz Assistant. Provide concise, non-authoritative guidance about Indian data protection and surveillance rights. When unsure, suggest users consult a lawyer. Keep answers short and step-by-step.`;
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question }
        ],
        max_tokens: 400,
        temperature: 0.2
      });
      const text = response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content ? response.choices[0].message.content : null;
      if (text) return res.json({ title: 'Awaaz Assistant', body: text });
    } catch (e) {
      console.warn('OpenAI error', e.message || e);
      // fallback to local stub
    }
  }

  // Fallback to local rule-based stub
  const answer = chatbot.getLegalRightsResponse(question);
  res.json(answer);
});

// Me endpoint
app.get('/api/me', authenticateToken, (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

// Admin endpoints
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const reports = await db.getReports(1000);
    res.json(reports);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/admin/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await db.deleteReportById(id);
    res.json(r);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/admin/flag/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await db.flagReportById(id);
    res.json(r);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// Auth: register
const registerSchema = Joi.object({ username: Joi.string().alphanum().min(3).max(30).required(), password: Joi.string().min(6).max(200).required() });
app.post('/api/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const existing = await db.findUserByUsername(value.username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const hash = await bcrypt.hash(value.password, 10);
    const user = await db.createUser(value.username, hash, 'reporter');
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Auth: login
const loginSchema = Joi.object({ username: Joi.string().required(), password: Joi.string().required() });
app.post('/api/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const user = await db.findUserByUsername(value.username);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(value.password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
global.io = io;

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('hello', (d) => console.log('hello', d));
});

server.listen(PORT, () => {
  console.log(`AWAAZ//OS backend running at http://0.0.0.0:${PORT}`);
});

// Bind to 0.0.0.0 so other machines on the network can access (if firewall allows)
// Note: when deployed, ensure environment and firewall rules permit external access.

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
