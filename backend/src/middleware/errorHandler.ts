import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[ERROR]', message);
  res.status(500).json({ error: message });
};
