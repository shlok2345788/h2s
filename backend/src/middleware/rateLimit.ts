import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

interface RateBucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, RateBucket>();

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = req.header('x-api-key');
  if (!key) return res.status(401).json({ error: 'Missing API key' });

  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, windowStart: now };
  const elapsed = now - bucket.windowStart;

  if (elapsed > 60_000) {
    bucket.count = 0;
    bucket.windowStart = now;
  }

  if (bucket.count >= env.rateLimitPerMinute) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  next();
};
