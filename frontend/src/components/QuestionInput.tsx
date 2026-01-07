import { useState } from 'react';
import type { AnalyzeRequest } from '../types';

interface QuestionInputProps {
  onAnalyze: (payload: AnalyzeRequest) => void;
  loading: boolean;
  apiKey?: string;
}

const QuestionInput = ({ onAnalyze, loading, apiKey }: QuestionInputProps) => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [type, setType] = useState<'MCQ' | 'Theory'>('MCQ');

  const handleSubmit = () => {
    if (!question.trim()) return;
    onAnalyze({ question, subject, type });
  };

  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title">Question Input</div>
        <span className="pill">API key: {apiKey ? 'loaded' : 'not set'}</span>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="label">Subject</span>
          <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option>Computer Science</option>
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Biology</option>
            <option>History</option>
          </select>
        </label>

        <label className="field">
          <span className="label">Question Type</span>
          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value as 'MCQ' | 'Theory')}
          >
            <option value="MCQ">MCQ</option>
            <option value="Theory">Theory</option>
          </select>
        </label>
      </div>

      <label className="field" style={{ marginTop: 8 }}>
        <span className="label">Question</span>
        <textarea
          className="textarea"
          placeholder="Paste the question you want analyzed"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </label>

      <div className="cta-row" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !question.trim()}>
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() =>
            setQuestion(
              'Explain how Dijkstra\'s algorithm computes the shortest path in a weighted graph and discuss its time complexity.',
            )
          }
        >
          Load example
        </button>
      </div>

      <p className="small-text" style={{ marginTop: 10 }}>
        We evaluate syntax, cognitive load, ambiguity, and scope. Provide your API key in the header for live scoring; otherwise a mock response is returned.
      </p>
    </div>
  );
};

export default QuestionInput;
