import { useEffect, useState } from 'react';
import { registerInstitute } from '../api/analyzer';

const maskKey = (key: string) => {
  if (!key) return 'No key on file';
  if (key.length < 8) return '••••••';
  return `${key.slice(0, 4)}••••••${key.slice(-4)}`;
};

const ApiKeysPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [institute, setInstitute] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [usage] = useState({ monthly: 3200, limit: 5000, lastCallMs: 280 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('apiKey');
    if (stored) setApiKey(stored);
  }, []);

  const generateKey = async () => {
    if (!institute || !email) {
      setStatus('Provide institute and email to issue a key.');
      return;
    }
    try {
      setLoading(true);
      const response = await registerInstitute({
        institute,
        email,
        password: Math.random().toString(36).slice(2, 10),
      });
      setApiKey(response.apiKey);
      localStorage.setItem('apiKey', response.apiKey);
      setStatus('New key generated. Update your integrations.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to generate key. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero">
      <div className="hero__pill">API Access</div>
      <h1 className="hero__title">Manage and rotate your API keys</h1>
      <p className="hero__subtitle">Issue fresh keys per environment, monitor usage, and keep integrations healthy.</p>

      <div className="layout-grid">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Generate a new key</div>
            <span className="pill">One key per institute</span>
          </div>
          <div className="form-grid">
            <label className="field">
              <span className="label">Institute</span>
              <input
                className="input"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                placeholder="Acme Exams"
              />
            </label>
            <label className="field">
              <span className="label">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="security@acme.edu"
              />
            </label>
          </div>
          <div className="cta-row">
            <button className="btn btn-primary" onClick={generateKey} disabled={loading}>
              {loading ? 'Issuing…' : 'Generate API Key'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => apiKey && navigator.clipboard.writeText(apiKey)}
              disabled={!apiKey}
            >
              Copy Current Key
            </button>
          </div>
          {status && <p className="small-text" style={{ marginTop: 10 }}>{status}</p>}
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Active Key</div>
            <span className="pill">Header: x-api-key</span>
          </div>
          {apiKey ? (
            <>
              <div className="api-key-box">
                <span className="muted">{revealed ? apiKey : maskKey(apiKey)}</span>
                <div className="cta-row" style={{ margin: 0 }}>
                  <button className="btn btn-secondary" onClick={() => setRevealed((r) => !r)}>
                    {revealed ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => apiKey && navigator.clipboard.writeText(apiKey)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="list-columns" style={{ marginTop: 12 }}>
                <div className="timeline-item">
                  <strong>Rate limiting</strong>
                  <p className="small-text">Requests are throttled per key. Handle 429 responses gracefully.</p>
                </div>
                <div className="timeline-item">
                  <strong>Logging</strong>
                  <p className="small-text">Each call is logged for audits and error tracing.</p>
                </div>
              </div>
            </>
          ) : (
            <p className="small-text">No key on file yet. Generate one to start.</p>
          )}
        </div>

          <div className="panel">
            <div className="panel__header">
              <div className="panel__title">Usage overview (mock)</div>
              <span className="pill">Updated hourly</span>
            </div>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">{usage.monthly}</div>
                <div className="stat-label">requests this month</div>
                <div className="usage-meter">
                  <div className="usage-fill" style={{ width: `${Math.min(100, (usage.monthly / usage.limit) * 100)}%` }} />
                </div>
                <p className="small-text">Limit: {usage.limit} calls</p>
              </div>
              <div className="stat-card">
                <div className="stat-value">{usage.lastCallMs} ms</div>
                <div className="stat-label">avg latency (mock)</div>
                <p className="small-text" style={{ marginTop: 6 }}>Healthy response times for recent calls.</p>
              </div>
              <div className="stat-card">
                <div className="stat-value">x-api-key</div>
                <div className="stat-label">header to send</div>
                <p className="small-text" style={{ marginTop: 6 }}>Rotate keys when team members change.</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ApiKeysPage;
