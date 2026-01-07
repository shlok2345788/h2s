import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export interface JWTPayload {
  id: string;
  email: string;
  instituteName: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const generateSecureApiKey = (prefix: string = 'sk_prod'): string => {
  const timestamp = Date.now().toString(36);
  const randomBytes = Math.random().toString(36).substring(2, 15);
  const additionalRandom = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}${randomBytes}${additionalRandom}`.substring(0, 40);
};
