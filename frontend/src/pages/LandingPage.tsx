const LandingPage = () => {
  return (
    <div className="hero">
      <span className="hero__pill">Education-grade quality control</span>
      <h1 className="hero__title">AI Question Difficulty & Quality Analyzer</h1>
      <p className="hero__subtitle">
        Assess clarity, difficulty, and quality before an exam goes live. Issue API keys to teams and plug the analyzer into your item bank.
      </p>

      <div className="cta-row">
        <a className="btn btn-primary" href="/analyze">Analyze a question</a>
        <a className="btn btn-secondary" href="/auth">Login / Register</a>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">95%</div>
          <div className="stat-label">coverage on ambiguity flags</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">30 req/min</div>
          <div className="stat-label">per-key throttling by default</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">5 min</div>
          <div className="stat-label">to get your first API key</div>
        </div>
      </div>

      <div className="layout-grid">
        <div className="panel">
          <div className="panel__title">Built for institutes</div>
          <p className="small-text">Role-based access, key rotation, and request logging keep your assessment pipeline safe.</p>
        </div>
        <div className="panel">
          <div className="panel__title">Explainable AI</div>
          <p className="small-text">Difficulty, quality score, flags, and suggested fixes are returned with plain-language rationales.</p>
        </div>
        <div className="panel">
          <div className="panel__title">Fast integration</div>
          <p className="small-text">REST endpoints for registration and question analysis with API key authentication.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
