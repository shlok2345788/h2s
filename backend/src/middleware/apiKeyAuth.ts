import { NextFunction, Request, Response } from 'express';
import { findApiKey } from '../clients/firestore.client';
import { ApiKeyRecord } from '../types';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const key = req.header('x-api-key');
  if (!key) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const record = findApiKey(key);
  if (!record) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  (req as Request & { apiKeyRecord: ApiKeyRecord }).apiKeyRecord = record;
  next();
};
