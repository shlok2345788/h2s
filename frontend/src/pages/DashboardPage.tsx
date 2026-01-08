import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

const maskKey = (key: string) => {
  if (!key) return 'No key set';
  if (key.length <= 8) return '••••••';
  return `${key.slice(0, 4)}••••••${key.slice(-4)}`;
};

const DashboardPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [instituteName, setInstituteName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
    });

    // Load stored data
    const stored = localStorage.getItem('apiKey');
    const storedInstitute = localStorage.getItem('instituteName');
    if (stored) setApiKey(stored);
    if (storedInstitute) setInstituteName(storedInstitute);

    return unsubscribe;
  }, [navigate]);

  const copyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    alert('API key copied to clipboard!');
  };

  return (
    <div className="hero">
      <div className="hero__pill">Institute dashboard</div>
      <h1 className="hero__title">
        {instituteName ? `${instituteName} — Control Panel` : 'Control panel for access, models, and docs'}
      </h1>
      <p className="hero__subtitle">
        {user
          ? `Logged in as ${user.email}. Manage API keys, review usage, and explore advanced features. Keys are masked by default—reveal only when you intend to copy.`
          : 'Manage API keys, review usage, and enable the advanced training track. Keys are masked by default—reveal only when you intend to copy.'}
      </p>

      <div className="layout-grid">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">API key settings</div>
            <span className="pill">Header: x-api-key</span>
          </div>
          <div className="api-key-box">
            <span className="muted api-key-text">
              {revealed ? apiKey || 'No key set' : maskKey(apiKey)}
            </span>
            <div className="cta-row cta-row--flush">
              <button
                className="btn btn-secondary"
                onClick={() => setRevealed((r) => !r)}
              >
                {revealed ? 'Hide' : 'Reveal once'}
              </button>
              <button
                className="btn btn-primary"
                onClick={copyKey}
                disabled={!apiKey}
              >
                Copy securely
              </button>
            </div>
          </div>
          <p className="small-text small-text--spaced">
            Rotate keys from the API Keys page. Keep keys out of screenshots and issue per-environment credentials.
          </p>
          <div className="list-columns list-columns--spaced">
            <div className="timeline-item">
              <strong>Google Auth</strong>
              <p className="small-text">
                Your account is secured via Google OAuth 2.0. Keys are unique to your email.
              </p>
            </div>
            <div className="timeline-item">
              <strong>Logging</strong>
              <p className="small-text">
                Requests log subject, type, latency, and flags—question text is redacted.
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Usage & reliability (mock)</div>
            <span className="pill">Updated hourly</span>
          </div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">3,240</div>
              <div className="stat-label">requests this month</div>
              <div className="usage-meter">
                <div className="usage-fill usage-fill--65" />
              </div>
              <p className="small-text small-text--spaced-sm">
                Limit: 5,000 req/mo (raise via support)
              </p>
            </div>
            <div className="stat-card">
              <div className="stat-value">282 ms</div>
              <div className="stat-label">p95 latency</div>
              <p className="small-text small-text--spaced-sm">
                Based on last 1k calls (mock telemetry).
              </p>
            </div>
            <div className="stat-card">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">success rate</div>
              <p className="small-text small-text--spaced-sm">
                Retries recommended for 429/5xx with jitter.
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Advanced training track</div>
            <span className="pill">Vertex AI + SHAP</span>
          </div>
          <p className="small-text">
            Enable the advanced model for higher fidelity scoring and richer explanations. Includes
            SHAP-based token attributions, Bloom verbs weighting, and readability-aware calibration.
          </p>
          <div className="two-column two-column--spaced">
            <div className="timeline-item">
              <div className="badge-soft">Model: Next-gen (mock)</div>
              <p className="small-text">
                Difficulty head: multiclass logistic; Quality head: calibrated regression with
                readability features.
              </p>
            </div>
            <div className="timeline-item">
              <div className="badge-soft">Explainability</div>
              <p className="small-text">
                Top SHAP tokens, sentence depth, passive voice hints, and scope warnings combined
                into the final rationale.
              </p>
            </div>
          </div>
          <div className="cta-row cta-row--spaced">
            <a className="btn btn-primary" href="/docs">
              View developer docs
            </a>
            <a className="btn btn-secondary" href="/apikeys">
              Rotate key
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
