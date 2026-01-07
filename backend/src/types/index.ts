export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface AnalysisRequest {
  question: string;
  subject: string;
  type: 'MCQ' | 'Theory';
}

export interface AnalysisResult {
  question: string;
  subject?: string;
  questionType?: 'MCQ' | 'Theory';
  difficulty: Difficulty;
  qualityScore: number;
  flags: string[];
  explanation: string;
  suggestedFix: string;
  keywords?: string[];
  shapTokens?: Array<{ token: string; weight: number }>;
}

export interface ApiKeyRecord {
  apiKey: string;
  institute: string;
  email: string;
  createdAt: number;
  uid?: string; // Google OAuth UID
  provider?: 'google' | 'email'; // Auth provider
}

export interface GoogleOAuthPayload {
  idToken: string;
  email: string;
  displayName: string;
  uid: string;
}

export interface RequestContext {
  apiKeyRecord?: ApiKeyRecord;
}
