import { Router, Request, Response, NextFunction } from 'express';
import {
  registerWithEmail,
  loginWithEmail,
  registerInstitute,
  generateApiKeyForUser,
  linkGoogleToEmail,
} from '../services/auth.service';
import { validateRegister, toRegisterResponse } from '../schemas/register.schema';

export const authRouter = Router();

// Legacy registration endpoint (email/password)
authRouter.post('/register', (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = validateRegister(req.body);
    const record = registerInstitute(input.institute, input.email);
    res.json(toRegisterResponse(record));
  } catch (error) {
    next(error);
  }
});

// Email/Password Registration
authRouter.post('/register-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { instituteName, email, password, confirmPassword } = req.body;

    // Validation
    if (!instituteName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'Missing required fields: instituteName, email, password, confirmPassword',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match',
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address',
      });
    }

    const { user, token, apiKey } = await registerWithEmail(instituteName, email, password);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        instituteName: user.instituteName,
        email: user.email,
      },
      token,
      apiKey,
    });
  } catch (error: any) {
    if (error.message.includes('Email already registered')) {
      return res.status(400).json({
        error: 'Email already registered. Please log in or use a different email.',
      });
    }
    next(error);
  }
});

// Email/Password Login
authRouter.post('/login-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password',
      });
    }

    const { user, token, apiKey } = await loginWithEmail(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        instituteName: user.instituteName,
        email: user.email,
      },
      token,
      apiKey,
    });
  } catch (error: any) {
    res.status(401).json({
      error: error.message || 'Invalid credentials',
    });
  }
});

// Google OAuth endpoint - generates API key after Google authentication
authRouter.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, email, displayName, uid } = req.body;

    // Validate required fields
    if (!idToken || !email || !uid) {
      return res.status(400).json({
        error: 'Missing required fields: idToken, email, uid',
      });
    }

    // TODO: Verify Google ID token with Google's API
    // For now, trust the token from Firebase client-side validation

    const { user, token, apiKey } = await linkGoogleToEmail(email, uid, displayName);

    res.json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: user._id,
        instituteName: user.instituteName,
        email: user.email,
      },
      token,
      apiKey,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message || 'Google authentication failed',
    });
  }
});

// Validate token endpoint
authRouter.post('/validate-token', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    // TODO: Implement token validation
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});
