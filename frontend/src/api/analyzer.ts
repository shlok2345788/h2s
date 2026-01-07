import axios from 'axios';
import type {
  AnalyzeRequest,
  AnalysisResult,
  RegisterRequest,
  RegisterResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Email/Password types
export interface EmailRegisterPayload {
  instituteName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface EmailLoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    instituteName: string;
    email: string;
  };
  token: string;
  apiKey: string;
}

// Google OAuth type
interface GoogleAuthPayload {
  idToken: string;
  email: string;
  displayName: string;
  uid: string;
}

interface GoogleAuthResponse {
  apiKey: string;
  instituteName: string;
  message: string;
}

// Email/Password Registration
export const registerWithEmail = async (
  payload: EmailRegisterPayload,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register-email`, payload);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
    throw new Error(errorMessage);
  }
};

// Email/Password Login
export const loginWithEmail = async (
  payload: EmailLoginPayload,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login-email`, payload);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

// Legacy function for backward compatibility
export const registerInstitute = async (
  payload: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);
  return response.data;
};

// Google OAuth
export const generateApiKeyFromGoogle = async (
  payload: GoogleAuthPayload,
): Promise<GoogleAuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/google`, payload);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Google authentication failed';
    throw new Error(errorMessage);
  }
};


export const analyzeQuestion = async (
  payload: AnalyzeRequest,
  apiKey?: string,
): Promise<AnalysisResult> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/analyze-question`,
      payload,
      {
        headers: apiKey ? { 'x-api-key': apiKey } : {},
      },
    );

    return response.data.result;
  } catch (error) {
    console.error('API call failed, falling back to mock data:', error);
    return mockAnalyze(payload);
  }
};

// Lightweight mock analysis to keep the UI functional offline
const mockAnalyze = ({ question, subject, type }: AnalyzeRequest): AnalysisResult => {
  const wordCount = question.split(' ').length;
  const hasQuestionMark = question.includes('?');
  const hasComplexWords = /algorithm|complexity|implement|architecture|optimization|analysis|compute/i.test(question);

  let difficulty: 'Easy' | 'Medium' | 'Hard';
  if (wordCount < 12 && hasQuestionMark) {
    difficulty = 'Easy';
  } else if (hasComplexWords || wordCount > 24) {
    difficulty = 'Hard';
  } else {
    difficulty = 'Medium';
  }

  let qualityScore = 68;
  if (hasQuestionMark) qualityScore += 8;
  if (wordCount >= 12 && wordCount <= 32) qualityScore += 12;
  if (!hasComplexWords && wordCount < 8) qualityScore -= 15;
  qualityScore = Math.min(100, Math.max(30, qualityScore));

  const flags: string[] = [];
  if (!hasQuestionMark && !question.match(/^(write|explain|describe|implement)/i)) {
    flags.push('Ambiguous phrasing — consider using an explicit ask.');
  }
  if (wordCount > 36) {
    flags.push('Broad scope — break this into smaller parts.');
  }
  if (wordCount < 6) {
    flags.push('Needs more context for a fair answer.');
  }

  const keywords = question
    .toLowerCase()
    .match(/\b(algorithm|complexity|function|react|node|api|database|query|sort|graph|matrix|probability)\b/g) || [];

  return {
    question,
    subject,
    questionType: type,
    difficulty,
    qualityScore,
    flags,
    explanation: difficulty === 'Hard'
      ? 'High cognitive load detected from abstract or technical terms.'
      : 'Question phrasing appears concise and direct.',
    suggestedFix:
      flags.length > 0
        ? 'Rewrite with clearer intent and constrain the scope to one skill.'
        : 'Question looks balanced; add rubric details if needed.',
    keywords: [...new Set(keywords)],
  };
};
