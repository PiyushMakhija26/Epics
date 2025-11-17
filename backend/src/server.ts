import express from 'express';
// @ts-ignore - some dev environments may not have @types/cors installed
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/mongodb';

// Load env BEFORE importing modules that read process.env at import time
dotenv.config();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Import routes after dotenv is configured
const authRoutes = require('./routes/auth').default;
const requestsRoutes = require('./routes/requests').default;
const adminRoutes = require('./routes/admin').default;
const chatbotRoutes = require('./routes/chatbot').default;
const locationsRoutes = require('./routes/locations').default;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/locations', locationsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CivicServe Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
