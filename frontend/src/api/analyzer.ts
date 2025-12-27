import axios from 'axios';
import type { AnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const analyzeQuestion = async (questions: string[]): Promise<AnalysisResult[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      questions,
    });
    return response.data.results;
  } catch (error) {
    console.error('API call failed, using mock data:', error);
    // Fallback to mock analysis if API fails
    return mockAnalyze(questions);
  }
};

// Mock analysis for MVP
const mockAnalyze = (questions: string[]): AnalysisResult[] => {
  return questions.map((question) => {
    const wordCount = question.split(' ').length;
    const hasQuestionMark = question.includes('?');
    const hasComplexWords = /algorithm|complexity|implement|architecture|optimization/i.test(question);
    
    // Mock difficulty logic
    let difficulty: 'Easy' | 'Medium' | 'Hard';
    if (wordCount < 10 && hasQuestionMark) {
      difficulty = 'Easy';
    } else if (hasComplexWords || wordCount > 20) {
      difficulty = 'Hard';
    } else {
      difficulty = 'Medium';
    }

    // Mock quality score
    let qualityScore = 70;
    if (hasQuestionMark) qualityScore += 10;
    if (wordCount > 5 && wordCount < 30) qualityScore += 10;
    if (!hasComplexWords && wordCount < 8) qualityScore -= 15;
    qualityScore = Math.min(100, Math.max(0, qualityScore));

    // Mock flags
    const flags: string[] = [];
    if (!hasQuestionMark && !question.match(/^(write|explain|describe|implement)/i)) {
      flags.push('Ambiguous: Consider rephrasing as a clear question');
    }
    if (wordCount > 30) {
      flags.push('Too Broad: Break into smaller questions');
    }
    if (wordCount < 5) {
      flags.push('Needs Context: Add more details');
    }

    // Mock keywords
    const keywords = question
      .toLowerCase()
      .match(/\b(algorithm|complexity|function|data|structure|react|node|api|database|query|sort|search|array|tree|graph)\b/g) || [];

    return {
      question,
      difficulty,
      qualityScore,
      flags,
      keywords: [...new Set(keywords)],
    };
  });
};
