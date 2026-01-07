const DeveloperDocsPage = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.example.com';

  return (
    <div className="hero">
      <div className="hero__pill">Developer docs</div>
      <h1 className="hero__title">Integrate the Question Analyzer API</h1>
      <p className="hero__subtitle">Authenticate with x-api-key, call the endpoints, and consume explainable results with confidence.</p>

      <div className="layout-grid">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Authentication</div>
            <span className="pill">Header: x-api-key</span>
          </div>
          <p className="small-text">Never hardcode keys in client apps. Store them server-side or in your secrets manager.</p>
          <pre className="code-block">{`# Example with curl
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $YOUR_API_KEY" \
  ${baseUrl}/analyze-question \
  -d '{"question":"Explain Dijkstra's algorithm","subject":"Computer Science","type":"Theory"}'
`}</pre>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Endpoints</div>
            <span className="pill">v1</span>
          </div>
          <div className="two-column">
            <div className="timeline-item">
              <strong>POST /auth/register</strong>
              <p className="small-text">Request: institute, email, password. Response: apiKey (view it in Dashboard).</p>
            </div>
            <div className="timeline-item">
              <strong>POST /analyze-question</strong>
              <p className="small-text">Headers: x-api-key. Body: question, subject, type (MCQ|Theory). Returns explainable difficulty + quality.</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Response shape</div>
            <span className="pill">Explainable</span>
          </div>
          <pre className="code-block">{`{
  "difficulty": "Medium",
  "quality_score": 82,
  "flags": ["ambiguous wording"],
  "explanation": "High sentence complexity and abstract terminology detected",
  "suggested_fix": "Limit the scope of the question",
  "keywords": ["algorithm", "complexity"],
  "shap_tokens": [{"token":"algorithm","weight":0.18}]
}`}</pre>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Best practices</div>
            <span className="pill">Production</span>
          </div>
          <ul className="flag-list" style={{ marginTop: 8 }}>
            <li className="flag-item">Use server-side calls; never expose the API key in browsers or mobile apps.</li>
            <li className="flag-item">Retry on 429/5xx with exponential backoff; cache results when re-analyzing unchanged questions.</li>
            <li className="flag-item">Send subject and type accurately—models weight Bloom verbs and subject keywords.</li>
            <li className="flag-item">Log request IDs for support; redact question text in your logs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDocsPage;
