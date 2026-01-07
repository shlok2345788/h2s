import crypto from 'crypto';
import { ApiKeyRecord, AnalysisResult } from '../types';
import { env } from '../config/env';

const keyStore = new Map<string, ApiKeyRecord>();

export const issueApiKey = (institute: string, email: string): ApiKeyRecord => {
  const apiKey = crypto.randomBytes(24).toString('hex');
  const record: ApiKeyRecord = {
    apiKey,
    institute,
    email,
    createdAt: Date.now(),
  };
  keyStore.set(apiKey, record);
  return record;
};

export const findApiKey = (apiKey: string): ApiKeyRecord | undefined => {
  return keyStore.get(apiKey);
};

export interface AnalysisLog {
  apiKey: string;
  subject: string;
  type: string;
  latencyMs: number;
  flags: string[];
  createdAt: number;
}

const analysisLogs: AnalysisLog[] = [];

export const logAnalysis = (log: AnalysisLog) => {
  if (env.useInMemoryStore) {
    analysisLogs.push(log);
  }
  // Placeholder for Firestore integration
};
