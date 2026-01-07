import { analyzeWithGcpNl } from '../clients/gcpNl.client';
import { callPythonInference } from '../clients/pythonInference.client';
import { callVertexModel } from '../clients/vertexAi.client';
import { logAnalysis } from '../clients/firestore.client';
import { AnalysisRequest, AnalysisResult, Difficulty } from '../types';

const heuristicAnalyze = (payload: AnalysisRequest): AnalysisResult => {
  const { question, subject, type } = payload;
  const wordCount = question.split(' ').length;
  const hasQuestionMark = question.includes('?');
  const hasComplexWords = /algorithm|complexity|implement|architecture|optimization|distributed|concurrent|async|paradigm|polymorphism/i.test(question);
  const hasTechnicalTerms = /database|query|index|transaction|api|rest|graphql|microservice|container|kubernetes|probability|integral|vector/i.test(question);

  let difficultyScore = 0;
  if (hasComplexWords) difficultyScore += 2;
  if (hasTechnicalTerms) difficultyScore += 1;
  if (wordCount > 20) difficultyScore += 1;
  if (wordCount < 8) difficultyScore -= 1;

  const difficulty: Difficulty = difficultyScore <= 0 ? 'Easy' : difficultyScore <= 2 ? 'Medium' : 'Hard';

  let qualityScore = 70;
  if (hasQuestionMark || question.match(/^(write|explain|describe|implement|design|create)/i)) {
    qualityScore += 15;
  }
  if (wordCount >= 8 && wordCount <= 30) qualityScore += 10;
  else if (wordCount < 5) qualityScore -= 20;
  else if (wordCount > 40) qualityScore -= 15;
  if (question.match(/\b(specifically|exactly|how|why|what|when|where)\b/i)) qualityScore += 5;
  const hasGoodStructure = question.includes(',') || question.includes(';') || question.includes(' and ');
  if (hasGoodStructure && wordCount > 15) qualityScore += 5;
  qualityScore = Math.min(100, Math.max(30, qualityScore));

  const flags: string[] = [];
  if (!hasQuestionMark && !question.match(/^(write|explain|describe|implement|design|create|build)/i)) {
    flags.push('Ambiguous phrasing — add a clear ask.');
  }
  if (wordCount > 35) flags.push('Broad scope — consider splitting into multiple prompts.');
  if (wordCount < 6) flags.push('Needs more context for fair evaluation.');
  if (!hasComplexWords && !hasTechnicalTerms && wordCount > 15) {
    flags.push('Lacks technical depth for the selected subject.');
  }
  const hasVagueTerms = /thing|stuff|something|basically|just|simply/i.test(question);
  if (hasVagueTerms) flags.push('Vague language — replace informal terms.');

  const keywords = question
    .toLowerCase()
    .match(/\b(algorithm|complexity|function|class|object|data|structure|react|node|api|database|query|sort|search|array|tree|graph|stack|queue|hash|linked|list|binary|recursion|iteration|async|await|probability|matrix|vector|derivative|integral)\b/g) || [];

  const explanation = difficulty === 'Hard'
    ? 'High cognitive load detected from technical terminology and length.'
    : difficulty === 'Medium'
      ? 'Balanced structure with moderate complexity and identifiable goals.'
      : 'Concise prompt with straightforward intent and limited complexity.';

  const suggestedFix = flags.includes('Broad scope — consider splitting into multiple prompts.')
    ? 'Break the question into two or more focused parts targeting single concepts.'
    : 'Tighten the phrasing and ensure the ask maps to one assessable skill.';

  return {
    question,
    subject,
    questionType: type,
    difficulty,
    qualityScore,
    flags,
    explanation,
    suggestedFix,
    keywords: [...new Set(keywords)].slice(0, 8),
  };
};

export const analyzeQuestion = async (payload: AnalysisRequest, apiKey: string): Promise<AnalysisResult> => {
  const start = Date.now();

  const cleaned = {
    ...payload,
    question: payload.question.replace(/\s+/g, ' ').trim(),
  };

  const [nlSignals, pythonResult] = await Promise.all([
    analyzeWithGcpNl(cleaned.question),
    callPythonInference(cleaned),
  ]);

  let baseResult: AnalysisResult = pythonResult || heuristicAnalyze(cleaned);

  if (nlSignals) {
    baseResult.flags = [...baseResult.flags];
    if (nlSignals.passiveVoice) {
      baseResult.flags.push('Passive voice detected — prefer active phrasing.');
    }
    if (nlSignals.sentenceCount > 3) {
      baseResult.flags.push('Multiple clauses — consider simplifying sentences.');
    }
    baseResult.keywords = Array.from(new Set([...(baseResult.keywords || []), ...nlSignals.keywords]));
  }

  const vertexResult = await callVertexModel(cleaned);
  if (vertexResult.difficulty) baseResult.difficulty = vertexResult.difficulty;
  if (vertexResult.qualityScore) baseResult.qualityScore = vertexResult.qualityScore;
  if (vertexResult.explanation) baseResult.explanation = vertexResult.explanation;

  logAnalysis({
    apiKey,
    subject: cleaned.subject,
    type: cleaned.type,
    latencyMs: Date.now() - start,
    flags: baseResult.flags,
    createdAt: Date.now(),
  });

  return baseResult;
};
