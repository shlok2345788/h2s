import { useEffect, useState } from 'react';
import QuestionInput from '../components/QuestionInput';
import ResultCard from '../components/ResultCard';
import { analyzeQuestion } from '../api/analyzer';
import type { AnalysisResult, AnalyzeRequest } from '../types';

const AnalyzerPage = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('apiKey');
    if (stored) setApiKey(stored);
  }, []);

  const handleAnalyze = async (payload: AnalyzeRequest) => {
    setLoading(true);
    try {
      const analysisResult = await analyzeQuestion(payload, apiKey || undefined);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero">
      <div className="hero__pill">Question analysis</div>
      <h1 className="hero__title">Paste a question and get instant difficulty & quality insights</h1>
      <p className="hero__subtitle">Subject-aware analysis with clear explanations and suggested fixes.</p>

      <div className="layout-grid">
        <QuestionInput onAnalyze={handleAnalyze} loading={loading} apiKey={apiKey} />

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Result</div>
            <span className="pill">Explainable output</span>
          </div>
          {loading && <p className="small-text">Analyzing…</p>}
          {!loading && result && <ResultCard result={result} index={0} />}
          {!loading && !result && (
            <p className="small-text">Submit a question to see the AI assessment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzerPage;
