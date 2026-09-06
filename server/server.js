import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/connection.js';

import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import officerRoutes from './routes/officer.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Auth callback fallback for direct backend hits
app.get('/auth/callback', (req, res) => {
  const host = req.get('host');
  if (host && host.includes('devtunnels.ms')) {
    const clientHost = host.replace('-5000.', '-5173.');
    return res.redirect(`https://${clientHost}/auth/callback`);
  }
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/callback`);
});

// API root
app.get('/', (req, res) => {
  res.json({ name: 'CivicPulse AI API', status: 'ok', health: '/api/health' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Verify Supabase and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
  console.log(`CivicPulse AI Server running on port ${PORT}`);
});
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
