import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { rateLimit } from '../middleware/rateLimit';
import { validateAnalyze } from '../schemas/analyze.schema';
import { analyzeQuestion } from '../services/analyze.service';
import { AnalysisRequest } from '../types';

export const analyzeRouter = Router();

analyzeRouter.post('/', apiKeyAuth, rateLimit, async (req, res, next) => {
  try {
    const payload = validateAnalyze(req.body) as AnalysisRequest;
    const apiKey = req.header('x-api-key') as string;
    const result = await analyzeQuestion(payload, apiKey);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});
