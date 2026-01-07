import { BigQuery } from '@google-cloud/bigquery';

interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  subject?: string;
}

interface DifficultyDistribution {
  Easy: number;
  Medium: number;
  Hard: number;
}

interface QualityTrend {
  date: string;
  avgQuality: number;
  count: number;
}

interface OverviewStats {
  totalQuestions: number;
  avgQuality: number;
  difficultyDistribution: DifficultyDistribution;
  flagsDetected: number;
  qualityTrend: QualityTrend[];
}

let bigquery: BigQuery | null = null;

const getBigQueryClient = () => {
  if (!bigquery && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
    });
  }
  return bigquery;
};

const DATASET_ID = process.env.BIGQUERY_DATASET || 'question_analytics';
const TABLE_ID = process.env.BIGQUERY_TABLE || 'analysis_results';

export const getOverviewStats = async (query: AnalyticsQuery = {}): Promise<OverviewStats> => {
  const client = getBigQueryClient();
  
  if (!client) {
    // Return mock data if BigQuery not configured
    return getMockOverviewStats();
  }

  try {
    const whereClause = buildWhereClause(query);
    
    // Total questions
    const [totalResult] = await client.query({
      query: `
        SELECT COUNT(*) as total
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        ${whereClause}
      `,
    });
    const totalQuestions = parseInt(totalResult[0]?.total || '0');

    // Average quality
    const [qualityResult] = await client.query({
      query: `
        SELECT AVG(quality_score) as avg_quality
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        ${whereClause}
      `,
    });
    const avgQuality = parseFloat(qualityResult[0]?.avg_quality || '0');

    // Difficulty distribution
    const [diffResult] = await client.query({
      query: `
        SELECT difficulty, COUNT(*) as count
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        ${whereClause}
        GROUP BY difficulty
      `,
    });
    const difficultyDistribution: DifficultyDistribution = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };
    diffResult.forEach((row: any) => {
      difficultyDistribution[row.difficulty as keyof DifficultyDistribution] = parseInt(row.count);
    });

    // Flags detected
    const [flagsResult] = await client.query({
      query: `
        SELECT SUM(ARRAY_LENGTH(flags)) as total_flags
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        ${whereClause}
      `,
    });
    const flagsDetected = parseInt(flagsResult[0]?.total_flags || '0');

    // Quality trend (last 7 days)
    const [trendResult] = await client.query({
      query: `
        SELECT 
          DATE(analyzed_at) as date,
          AVG(quality_score) as avg_quality,
          COUNT(*) as count
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        WHERE analyzed_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        GROUP BY date
        ORDER BY date ASC
      `,
    });
    const qualityTrend: QualityTrend[] = trendResult.map((row: any) => ({
      date: row.date.value,
      avgQuality: parseFloat(row.avg_quality),
      count: parseInt(row.count),
    }));

    return {
      totalQuestions,
      avgQuality,
      difficultyDistribution,
      flagsDetected,
      qualityTrend,
    };
  } catch (error) {
    console.error('BigQuery analytics error:', error);
    return getMockOverviewStats();
  }
};

export const getSubjectAnalytics = async (subject?: string): Promise<any> => {
  const client = getBigQueryClient();
  
  if (!client) {
    return null;
  }

  try {
    const whereClause = subject ? `WHERE subject = '${subject}'` : '';
    
    const [result] = await client.query({
      query: `
        SELECT 
          subject,
          COUNT(*) as total,
          AVG(quality_score) as avg_quality,
          AVG(CASE WHEN difficulty = 'Easy' THEN 1 WHEN difficulty = 'Medium' THEN 2 ELSE 3 END) as avg_difficulty
        FROM \`${DATASET_ID}.${TABLE_ID}\`
        ${whereClause}
        GROUP BY subject
        ORDER BY total DESC
      `,
    });

    return result;
  } catch (error) {
    console.error('BigQuery subject analytics error:', error);
    return null;
  }
};

export const getFlagFrequency = async (): Promise<Map<string, number>> => {
  const client = getBigQueryClient();
  
  if (!client) {
    return new Map();
  }

  try {
    const [result] = await client.query({
      query: `
        SELECT flag, COUNT(*) as frequency
        FROM \`${DATASET_ID}.${TABLE_ID}\`,
        UNNEST(flags) as flag
        GROUP BY flag
        ORDER BY frequency DESC
        LIMIT 20
      `,
    });

    const flagMap = new Map<string, number>();
    result.forEach((row: any) => {
      flagMap.set(row.flag, parseInt(row.frequency));
    });

    return flagMap;
  } catch (error) {
    console.error('BigQuery flag frequency error:', error);
    return new Map();
  }
};

export const logAnalysis = async (data: {
  question: string;
  subject: string;
  bloom_level: number;
  difficulty: string;
  quality_score: number;
  confidence: number;
  flags: string[];
}) => {
  const client = getBigQueryClient();
  
  if (!client) {
    return;
  }

  try {
    await client
      .dataset(DATASET_ID)
      .table(TABLE_ID)
      .insert([{
        ...data,
        analyzed_at: new Date().toISOString(),
        question_hash: hashQuestion(data.question), // Store hash, not full text for privacy
      }]);
  } catch (error) {
    console.error('BigQuery insert error:', error);
  }
};

// Helper functions
function buildWhereClause(query: AnalyticsQuery): string {
  const conditions: string[] = [];
  
  if (query.startDate) {
    conditions.push(`analyzed_at >= '${query.startDate}'`);
  }
  if (query.endDate) {
    conditions.push(`analyzed_at <= '${query.endDate}'`);
  }
  if (query.subject) {
    conditions.push(`subject = '${query.subject}'`);
  }
  
  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

function hashQuestion(question: string): string {
  // Simple hash for privacy - in production use crypto
  let hash = 0;
  for (let i = 0; i < question.length; i++) {
    const char = question.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getMockOverviewStats(): OverviewStats {
  return {
    totalQuestions: 1247,
    avgQuality: 78.3,
    difficultyDistribution: {
      Easy: 312,
      Medium: 678,
      Hard: 257,
    },
    flagsDetected: 89,
    qualityTrend: [
      { date: '2026-01-01', avgQuality: 72.5, count: 45 },
      { date: '2026-01-02', avgQuality: 75.2, count: 52 },
      { date: '2026-01-03', avgQuality: 76.8, count: 61 },
      { date: '2026-01-04', avgQuality: 78.1, count: 48 },
      { date: '2026-01-05', avgQuality: 79.4, count: 55 },
      { date: '2026-01-06', avgQuality: 78.9, count: 50 },
      { date: '2026-01-07', avgQuality: 80.2, count: 58 },
    ],
  };
}
