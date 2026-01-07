export interface AnalysisResult {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  qualityScore: number;
  flags: string[];
  explanation: string;
  suggestedFix: string;
  subject?: string;
  questionType?: 'MCQ' | 'Theory';
  keywords?: string[];
}

export interface AnalyzeRequest {
  question: string;
  subject: string;
  type: 'MCQ' | 'Theory';
}

export interface AnalyzeResponse {
  result: AnalysisResult;
}

export interface RegisterRequest {
  institute: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  apiKey: string;
  institute: string;
}
