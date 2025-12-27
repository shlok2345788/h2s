export interface AnalysisResult {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  qualityScore: number;
  flags: string[];
  keywords?: string[];
}

export interface AnalyzeRequest {
  questions: string[];
}

export interface AnalyzeResponse {
  results: AnalysisResult[];
}
