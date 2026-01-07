import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { getOverviewStats, getSubjectAnalytics, getFlagFrequency } from '../clients/bigquery.client';
import { getModelStatus } from '../clients/vertexAi.client';

export const analyticsRouter = Router();

// Overview dashboard stats
analyticsRouter.get('/overview', apiKeyAuth, async (req, res, next) => {
  try {
    const { startDate, endDate, subject } = req.query;
    
    const stats = await getOverviewStats({
      startDate: startDate as string,
      endDate: endDate as string,
      subject: subject as string,
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Subject-wise analytics
analyticsRouter.get('/subjects', apiKeyAuth, async (req, res, next) => {
  try {
    const { subject } = req.query;
    const analytics = await getSubjectAnalytics(subject as string);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// Flag frequency analysis
analyticsRouter.get('/flags', apiKeyAuth, async (req, res, next) => {
  try {
    const flagFrequency = await getFlagFrequency();
    const flagArray = Array.from(flagFrequency.entries()).map(([flag, count]) => ({
      flag,
      count,
    }));
    res.json(flagArray);
  } catch (error) {
    next(error);
  }
});

// Model deployment status
analyticsRouter.get('/models/status', apiKeyAuth, async (req, res, next) => {
  try {
    const status = await getModelStatus();
    res.json(status || { deployed: false, message: 'Model status unavailable' });
  } catch (error) {
    next(error);
  }
});

// Health check for analytics services
analyticsRouter.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    services: {
      bigquery: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      vertexAi: !!process.env.VERTEX_ENDPOINT_ID,
    },
  });
});
