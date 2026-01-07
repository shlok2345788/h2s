import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  (req as Request & { requestId?: string }).requestId = requestId;
  console.log(`[REQ ${requestId}] ${req.method} ${req.url}`);
  next();
};
