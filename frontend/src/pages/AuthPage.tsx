import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { generateApiKeyFromGoogle, registerWithEmail, loginWithEmail } from '../api/analyzer';

type AuthMode = 'register' | 'login' | 'choice';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('choice');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email/Password form state
  const [form, setForm] = useState({
    instituteName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    instituteName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        generateApiKeyAfterGoogleAuth(currentUser);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const generateApiKeyAfterGoogleAuth = async (googleUser: FirebaseUser) => {
    try {
      const token = await googleUser.getIdToken();
      const response = await generateApiKeyFromGoogle({
        idToken: token,
        email: googleUser.email || '',
        displayName: googleUser.displayName || googleUser.email || 'User',
        uid: googleUser.uid,
      });

      if (response.apiKey) {
        localStorage.setItem('apiKey', response.apiKey);
        localStorage.setItem('instituteName', response.instituteName);
        localStorage.setItem('userEmail', googleUser.email || '');
        localStorage.setItem('authToken', token);
        setMessage('✓ Authenticated! API key generated. Redirecting to Dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      setMessage('Error generating API key. Contact support.');
    }
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      instituteName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (authMode === 'register') {
      if (!form.instituteName.trim()) {
        newErrors.instituteName = 'Institute name is required';
      }
      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err);
  };

  const handleEmailRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await registerWithEmail({
        instituteName: form.instituteName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (response.apiKey && response.token) {
        localStorage.setItem('apiKey', response.apiKey);
        localStorage.setItem('instituteName', response.user.instituteName);
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('authToken', response.token);
        setMessage('✓ Registration successful! Redirecting to Dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error: any) {
      setMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await loginWithEmail({
        email: form.email,
        password: form.password,
      });

      if (response.apiKey && response.token) {
        localStorage.setItem('apiKey', response.apiKey);
        localStorage.setItem('instituteName', response.user.instituteName);
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('authToken', response.token);
        setMessage('✓ Login successful! Redirecting to Dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error: any) {
      setMessage(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setMessage('');
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setMessage('Authenticating with Google...');
      await generateApiKeyAfterGoogleAuth(result.user);
    } catch (error: any) {
      console.error('Authentication failed:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setMessage(error.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('apiKey');
      localStorage.removeItem('instituteName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('authToken');
      setMessage('Signed out successfully.');
    } catch (error) {
      console.error('Sign out error:', error);
      setMessage('Error signing out.');
    }
  };

  if (user) {
    return (
      <div className="hero">
        <div className="hero__pill">Google Authenticated</div>
        <h1 className="hero__title">Welcome, {user.displayName || user.email}</h1>
        <p className="hero__subtitle">Your API key has been generated. Access your dashboard to view and manage it.</p>

        <div className="layout-grid">
          <div className="panel">
            <div className="panel__header">
              <div className="panel__title">Authenticated</div>
              <div className="pill">OAuth 2.0 Secure</div>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              >
                <p className="small-text" style={{ marginBottom: 8 }}>
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="small-text">
                  <strong>UID:</strong> {user.uid.slice(0, 8)}...
                </p>
              </div>
              <button className="btn btn-secondary" onClick={handleSignOut} style={{ width: '100%' }}>
                Sign Out
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel__header">
              <div className="panel__title">Next steps</div>
              <span className="pill">Secure handling</span>
            </div>
            <p className="small-text">Your API key has been generated automatically. View and manage it from your dashboard.</p>
            <div className="cta-row" style={{ marginTop: 10 }}>
              <a className="btn btn-primary" href="/dashboard">
                Go to Dashboard
              </a>
              <a className="btn btn-secondary" href="/analyze">
                Analyze Questions
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="hero">
        <div className="hero__pill">Secure Authentication</div>
        <h1 className="hero__title">Login or Register</h1>
        <p className="hero__subtitle">
          Choose your preferred authentication method to access the AI Question Difficulty & Quality Analyzer.
        </p>

        {authMode === 'choice' && (
          <div className="layout-grid">
            <div className="panel">
              <div className="panel__header">
                <div className="panel__title">Google OAuth</div>
                <span className="pill">Recommended</span>
              </div>
              <p className="small-text">
                Quick sign-in with your Google account. No password needed. Secure and convenient.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {loading ? 'Signing in...' : '🔐 Sign in with Google'}
              </button>
            </div>

            <div className="panel">
              <div className="panel__header">
                <div className="panel__title">Email & Password</div>
                <span className="pill">Standard</span>
              </div>
              <p className="small-text">
                Create an account or login with your email and password. Full control over your credentials.
              </p>
              <div className="cta-row" style={{ marginTop: '12px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setAuthMode('register');
                    setMessage('');
                    setForm({ instituteName: '', email: '', password: '', confirmPassword: '' });
                    setErrors({ instituteName: '', email: '', password: '', confirmPassword: '' });
                  }}
                  style={{ flex: 1 }}
                >
                  Register
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setAuthMode('login');
                    setMessage('');
                    setForm({ instituteName: '', email: '', password: '', confirmPassword: '' });
                    setErrors({ instituteName: '', email: '', password: '', confirmPassword: '' });
                  }}
                  style={{ flex: 1 }}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {(authMode === 'register' || authMode === 'login') && (
          <div className="layout-grid">
            <div className="panel">
              <div className="panel__header">
                <div className="panel__title">
                  {authMode === 'register' ? 'Create Account' : 'Sign In'}
                </div>
                <span className="pill">Email Authentication</span>
              </div>

              <div className="form-grid">
                {authMode === 'register' && (
                  <label className="field">
                    <span className="label">Institute Name *</span>
                    <input
                      className="input"
                      value={form.instituteName}
                      onChange={(e) => setForm({ ...form, instituteName: e.target.value })}
                      placeholder="e.g., Acme University"
                      type="text"
                    />
                    {errors.instituteName && <span className="error-text">{errors.instituteName}</span>}
                  </label>
                )}

                <label className="field">
                  <span className="label">Email Address *</span>
                  <input
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@example.com"
                    type="email"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </label>

                <label className="field">
                  <span className="label">Password *</span>
                  <input
                    className="input"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                  {authMode === 'register' && (
                    <span className="hint-text">Minimum 6 characters</span>
                  )}
                </label>

                {authMode === 'register' && (
                  <label className="field">
                    <span className="label">Confirm Password *</span>
                    <input
                      className="input"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    {errors.confirmPassword && (
                      <span className="error-text">{errors.confirmPassword}</span>
                    )}
                  </label>
                )}
              </div>

              <div className="cta-row">
                <button
                  className="btn btn-primary"
                  onClick={authMode === 'register' ? handleEmailRegister : handleEmailLogin}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading
                    ? authMode === 'register'
                      ? 'Creating Account...'
                      : 'Signing In...'
                    : authMode === 'register'
                      ? 'Create Account'
                      : 'Sign In'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setAuthMode('choice')}
                  type="button"
                  style={{ flex: 1 }}
                >
                  Back
                </button>
              </div>

              {message && (
                <p
                  className="small-text"
                  style={{
                    marginTop: 12,
                    padding: '10px',
                    backgroundColor: message.includes('✓') ? '#f0f8f0' : '#f8f0f0',
                    borderRadius: '4px',
                    color: message.includes('✓') ? '#2d7d2d' : '#7d2d2d',
                  }}
                >
                  {message}
                </p>
              )}
            </div>

            <div className="panel">
              <div className="panel__header">
                <div className="panel__title">Password Guidelines</div>
                <span className="pill">Best Practices</span>
              </div>
              <div className="list-columns" style={{ gap: '12px' }}>
                <div className="timeline-item">
                  <strong>✓ Use a strong password</strong>
                  <p className="small-text">At least 6 characters. Include uppercase, lowercase, and numbers for better security.</p>
                </div>
                <div className="timeline-item">
                  <strong>✓ Keep it private</strong>
                  <p className="small-text">Never share your password with anyone. We'll never ask for it.</p>
                </div>
                <div className="timeline-item">
                  <strong>✓ Unique password</strong>
                  <p className="small-text">Use a different password than other websites to protect your account.</p>
                </div>
              </div>
              {authMode === 'register' && (
                <div className="timeline-item" style={{ marginTop: '12px' }}>
                  <strong>📋 After registration</strong>
                  <p className="small-text">Your API key will be automatically generated and displayed on your dashboard.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
