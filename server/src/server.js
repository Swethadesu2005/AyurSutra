import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import billRoutes from './routes/bills.js';
import inventoryRoutes from './routes/inventory.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'AyurSutra API' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and configure it.');
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`AyurSutra API running on port ${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
