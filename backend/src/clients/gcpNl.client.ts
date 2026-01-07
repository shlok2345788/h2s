import { LanguageServiceClient } from '@google-cloud/language';

export interface NlSignals {
  sentenceCount: number;
  passiveVoice: boolean;
  complexityScore: number;
  keywords: string[];
  syntaxTreeDepth?: number;
  namedEntities?: Array<{ name: string; type: string; salience: number }>;
  sentiment?: { score: number; magnitude: number };
  avgDependencyDistance?: number;
}

// Initialize GCP Natural Language client
let nlClient: LanguageServiceClient | null = null;

const getClient = () => {
  if (!nlClient && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    nlClient = new LanguageServiceClient();
  }
  return nlClient;
};

export const analyzeWithGcpNl = async (text: string): Promise<NlSignals> => {
  const client = getClient();
  
  // Fallback to mock if no credentials
  if (!client) {
    const sentenceCount = Math.max(1, text.split(/[.!?]/).filter(Boolean).length);
    const passiveVoice = /was\s+\w+ed/i.test(text);
    const complexityScore = Math.min(1, text.split(' ').length / 50);
    const keywords = (text.toLowerCase().match(/\b(algorithm|probability|database|vector|analysis)\b/g) || []).slice(0, 5);
    return { sentenceCount, passiveVoice, complexityScore, keywords };
  }

  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT' as const,
    };

    // Perform comprehensive analysis
    const [syntaxResult] = await client.analyzeSyntax({ document });
    const [entitiesResult] = await client.analyzeEntities({ document });
    const [sentimentResult] = await client.analyzeSentiment({ document });

    // Calculate syntax tree depth from dependency parse
    let maxDepth = 0;
    let totalDependencyDistance = 0;
    let dependencyCount = 0;

    if (syntaxResult.tokens) {
      const tokenPositions = new Map<number, number>();
      syntaxResult.tokens.forEach((token, idx) => {
        if (token.text?.beginOffset !== undefined) {
          tokenPositions.set(token.text.beginOffset, idx);
        }
      });

      syntaxResult.tokens.forEach((token) => {
        const depth = calculateTokenDepth(token, syntaxResult.tokens || []);
        maxDepth = Math.max(maxDepth, depth);

        // Calculate dependency distance
        if (token.dependencyEdge?.headTokenIndex !== undefined) {
          const currentIdx = tokenPositions.get(token.text?.beginOffset || 0) || 0;
          const headIdx = token.dependencyEdge.headTokenIndex;
          totalDependencyDistance += Math.abs(currentIdx - headIdx);
          dependencyCount++;
        }
      });
    }

    // Extract named entities with salience
    const namedEntities = (entitiesResult.entities || [])
      .map(entity => ({
        name: entity.name || '',
        type: entity.type || 'UNKNOWN',
        salience: entity.salience || 0,
      }))
      .filter(e => e.salience > 0.01)
      .slice(0, 10);

    // Extract keywords from entities and tokens
    const keywords = namedEntities
      .slice(0, 5)
      .map(e => e.name.toLowerCase());

    // Detect passive voice from syntax
    const hasPassive = syntaxResult.tokens?.some(
      token => token.partOfSpeech?.tag === 'VERB' && 
                token.partOfSpeech?.voice === 'PASSIVE'
    ) || false;

    const sentenceCount = syntaxResult.sentences?.length || 1;
    const complexityScore = Math.min(1, maxDepth / 10);
    const avgDependencyDistance = dependencyCount > 0 
      ? totalDependencyDistance / dependencyCount 
      : 0;

    return {
      sentenceCount,
      passiveVoice: hasPassive,
      complexityScore,
      keywords,
      syntaxTreeDepth: maxDepth,
      namedEntities,
      sentiment: {
        score: sentimentResult.documentSentiment?.score || 0,
        magnitude: sentimentResult.documentSentiment?.magnitude || 0,
      },
      avgDependencyDistance,
    };
  } catch (error) {
    console.error('GCP NL API error:', error);
    // Fallback to basic analysis
    const sentenceCount = Math.max(1, text.split(/[.!?]/).filter(Boolean).length);
    const passiveVoice = /was\s+\w+ed/i.test(text);
    const complexityScore = Math.min(1, text.split(' ').length / 50);
    const keywords = (text.toLowerCase().match(/\b(algorithm|probability|database|vector|analysis)\b/g) || []).slice(0, 5);
    return { sentenceCount, passiveVoice, complexityScore, keywords };
  }
};

// Helper to calculate token depth in dependency tree
function calculateTokenDepth(token: any, allTokens: any[]): number {
  if (!token.dependencyEdge?.headTokenIndex) return 0;
  
  const headIdx = token.dependencyEdge.headTokenIndex;
  if (headIdx < 0 || headIdx >= allTokens.length) return 1;
  
  const parent = allTokens[headIdx];
  return 1 + calculateTokenDepth(parent, allTokens);
}
