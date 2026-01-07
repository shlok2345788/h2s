import { User, IUser } from '../models/user.model';
import { generateToken, generateSecureApiKey, JWTPayload } from '../utils/jwt';

// Generate a cryptographically secure API key
const generateNewApiKey = (prefix: string = 'sk_prod'): string => {
  return generateSecureApiKey(prefix);
};

export const registerWithEmail = async (
  instituteName: string,
  email: string,
  password: string
): Promise<{ user: IUser; token: string; apiKey: string }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Create new user with email auth
  const apiKey = generateNewApiKey('sk_email');

  const user = new User({
    instituteName,
    email,
    password, // Will be hashed by the model's pre-save hook
    authProvider: 'email',
    apiKey,
  });

  await user.save();

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    instituteName: user.instituteName,
  };
  const token = generateToken(tokenPayload);

  return { user, token, apiKey };
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string; apiKey: string }> => {
  // Find user by email and explicitly select password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare passwords
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    instituteName: user.instituteName,
  };
  const token = generateToken(tokenPayload);

  return { user, token, apiKey: user.apiKey };
};

export const registerInstitute = (institute: string, email: string): any => {
  // Legacy function - use registerWithEmail instead
  return {
    apiKey: generateNewApiKey('sk_legacy'),
    institute,
    email,
    createdAt: Date.now(),
  };
};

export const generateApiKeyForUser = (
  uid: string,
  email: string,
  displayName: string
): string => {
  // For Google OAuth users
  return generateNewApiKey('sk_google');
};

export const linkGoogleToEmail = async (
  email: string,
  googleId: string,
  displayName: string
): Promise<{ user: IUser; token: string; apiKey: string }> => {
  // Try to find existing user by email
  let user = await User.findOne({ email });

  if (user) {
    // User exists with email, link Google ID
    if (user.authProvider === 'email') {
      user.authProvider = 'both';
    }
    user.googleId = googleId;
    await user.save();
  } else {
    // Check if Google ID already exists
    const googleUser = await User.findOne({ googleId });
    if (googleUser) {
      throw new Error('Google account already linked to another email');
    }

    // Create new user with Google auth
    const apiKey = generateNewApiKey('sk_google');
    user = new User({
      instituteName: displayName,
      email,
      googleId,
      authProvider: 'google',
      apiKey,
    });
    await user.save();
  }

  // Generate JWT token
  const tokenPayload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    instituteName: user.instituteName,
  };
  const token = generateToken(tokenPayload);

  return { user, token, apiKey: user.apiKey };
};

