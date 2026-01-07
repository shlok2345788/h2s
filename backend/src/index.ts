import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { env } from './config/env';
import { connectDatabase } from './clients/mongodb.client';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './controllers/auth.controller';
import { analyzeRouter } from './controllers/analyze.controller';
import { analyticsRouter } from './controllers/analytics.controller';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Connect to MongoDB
connectDatabase().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Question Analyzer API is running' });
});

app.use('/auth', authRouter);
app.use('/analyze-question', analyzeRouter);
app.use('/analytics', analyticsRouter);

app.use(errorHandler);

const port = env.port || 5000;
app.listen(port, () => {
  console.log(`\n🚀 Server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
  console.log(`\n✅ Auth Endpoints:`);
  console.log(`   POST http://localhost:${port}/auth/register-email (Email registration)`);
  console.log(`   POST http://localhost:${port}/auth/login-email (Email login)`);
  console.log(`   POST http://localhost:${port}/auth/google (Google OAuth)`);
  console.log(`\n📊 Analysis:`);
  console.log(`   POST http://localhost:${port}/analyze-question (Analyze question)`);
  console.log(`\n📈 Analytics:`);
  console.log(`   GET  http://localhost:${port}/analytics/overview (Dashboard stats)`);
  console.log(`   GET  http://localhost:${port}/analytics/subjects (Subject analytics)`);
  console.log(`   GET  http://localhost:${port}/analytics/flags (Flag frequency)`);
  console.log(`   GET  http://localhost:${port}/analytics/models/status (Model status)\n`);
});

