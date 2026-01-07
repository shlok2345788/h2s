import { AnalysisRequest } from '../types';

export const validateAnalyze = (body: unknown): AnalysisRequest => {
  const value = body as Partial<AnalysisRequest>;
  if (!value || !value.question || !value.subject || !value.type) {
    throw new Error('question, subject, and type are required');
  }
  const trimmedQuestion = value.question.trim();
  if (trimmedQuestion.length < 5) {
    throw new Error('question is too short');
  }
  return {
    question: trimmedQuestion,
    subject: value.subject.trim(),
    type: value.type === 'Theory' ? 'Theory' : 'MCQ',
  };
};
