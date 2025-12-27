import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface AnalysisResult {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  qualityScore: number;
  flags: string[];
  keywords: string[];
}

interface AnalyzeRequest {
  questions: string[];
}

// Mock Analysis Logic
const analyzeQuestion = (question: string): AnalysisResult => {
  const wordCount = question.split(' ').length;
  const hasQuestionMark = question.includes('?');
  const hasComplexWords = /algorithm|complexity|implement|architecture|optimization|distributed|concurrent|async|paradigm|polymorphism/i.test(question);
  const hasTechnicalTerms = /database|query|index|transaction|API|REST|GraphQL|microservice|container|kubernetes/i.test(question);
  
  // Determine difficulty
  let difficulty: 'Easy' | 'Medium' | 'Hard';
  let difficultyScore = 0;
  
  if (hasComplexWords) difficultyScore += 2;
  if (hasTechnicalTerms) difficultyScore += 1;
  if (wordCount > 20) difficultyScore += 1;
  if (wordCount < 8) difficultyScore -= 1;
  
  if (difficultyScore <= 0) {
    difficulty = 'Easy';
  } else if (difficultyScore <= 2) {
    difficulty = 'Medium';
  } else {
    difficulty = 'Hard';
  }
  
  // Calculate quality score
  let qualityScore = 70;
  
  if (hasQuestionMark || question.match(/^(write|explain|describe|implement|design|create)/i)) {
    qualityScore += 15;
  }
  
  if (wordCount >= 8 && wordCount <= 30) {
    qualityScore += 10;
  } else if (wordCount < 5) {
    qualityScore -= 20;
  } else if (wordCount > 40) {
    qualityScore -= 15;
  }
  
  if (question.match(/\b(specifically|exactly|how|why|what|when|where)\b/i)) {
    qualityScore += 5;
  }
  
  const hasGoodStructure = question.includes(',') || question.includes(';') || question.includes('and');
  if (hasGoodStructure && wordCount > 15) {
    qualityScore += 5;
  }
  
  qualityScore = Math.min(100, Math.max(30, qualityScore));
  
  // Identify flags
  const flags: string[] = [];
  
  if (!hasQuestionMark && !question.match(/^(write|explain|describe|implement|design|create|build)/i)) {
    flags.push('Ambiguous: Consider rephrasing as a clear question or instruction');
  }
  
  if (wordCount > 35) {
    flags.push('Too Broad: Consider breaking into multiple focused questions');
  }
  
  if (wordCount < 6) {
    flags.push('Needs Context: Add more specific details or context');
  }
  
  if (!hasComplexWords && !hasTechnicalTerms && wordCount > 15) {
    flags.push('Lacks Technical Depth: Consider adding specific technical terms');
  }
  
  const hasVagueTerms = /thing|stuff|something|basically|just|simply/i.test(question);
  if (hasVagueTerms) {
    flags.push('Vague Language: Replace informal terms with precise terminology');
  }
  
  // Extract keywords
  const keywords: string[] = [];
  const technicalKeywords = question.toLowerCase().match(
    /\b(algorithm|complexity|function|class|object|data|structure|react|node|api|database|query|sort|search|array|tree|graph|stack|queue|hash|linked|list|binary|recursion|iteration|async|await|promise|callback|closure|prototype|inheritance|polymorphism|encapsulation|rest|graphql|sql|nosql|mongodb|redis|docker|kubernetes|microservice|design|pattern|solid|mvc|mvvm)\b/g
  ) || [];
  
  keywords.push(...new Set(technicalKeywords));
  
  return {
    question,
    difficulty,
    qualityScore,
    flags,
    keywords: keywords.slice(0, 8), // Limit to 8 keywords
  };
};

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Question Analyzer API is running' });
});

app.post('/api/analyze', (req: Request<{}, {}, AnalyzeRequest>, res: Response) => {
  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: questions array is required',
      });
    }
    
    const results = questions.map(analyzeQuestion);
    
    res.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Analyze endpoint: http://localhost:${PORT}/api/analyze`);
});
