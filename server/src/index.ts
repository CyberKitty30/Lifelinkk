import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { initDatabase, getDbStatus } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Healthy',
    system: 'LifeLink - Blood Donation & Blood Bank Management System API',
    database: getDbStatus()
  });
});

// Initialize DB and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 [Server] LifeLink API Server running at http://localhost:${PORT}`);
    console.log(`📡 [API Status] Health Check: http://localhost:${PORT}/health`);
  });
});
