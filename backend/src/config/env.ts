import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MIN || 30),
  pythonEndpoint: process.env.PYTHON_INFERENCE_URL || '',
  vertexEndpoint: process.env.VERTEX_ENDPOINT || '',
  gcpProjectId: process.env.GCP_PROJECT_ID || '',
  useInMemoryStore: (process.env.USE_IN_MEMORY_DB || 'true').toLowerCase() === 'true',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/question-analyzer',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
};
