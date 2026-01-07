import type { AnalysisResult } from '../types';
import DifficultyBadge from './DifficultyBadge';
import QualityScore from './QualityScore';
import FlagList from './FlagList';

interface ResultCardProps {
  result: AnalysisResult;
  index: number;
}

const ResultCard = ({ result, index }: ResultCardProps) => {
  return (
    <div className="result-card" data-index={index}>
      <div className="result-card__header">
        <div>
          <div className="small-text">Question {index + 1}</div>
          <p className="result-card__question">{result.question}</p>
        </div>
        <DifficultyBadge difficulty={result.difficulty} />
      </div>

      <div className="metric-row">
        <QualityScore score={result.qualityScore} />
        <span className="chip">Subject: {result.subject || '—'}</span>
        <span className="chip">Type: {result.questionType || '—'}</span>
      </div>

      {result.flags.length > 0 && <FlagList flags={result.flags} />}

      <div className="panel" style={{ padding: 12, boxShadow: 'none' }}>
        <div className="label">AI explanation</div>
        <p className="small-text" style={{ color: 'var(--text)', marginTop: 6 }}>
          {result.explanation}
        </p>
        <div className="label" style={{ marginTop: 10 }}>Suggested improvement</div>
        <p className="small-text" style={{ color: 'var(--text)', marginTop: 6 }}>
          {result.suggestedFix}
        </p>
      </div>

      {result.keywords && result.keywords.length > 0 && (
        <div>
          <div className="label">Key concepts detected</div>
          <div className="key-row" style={{ marginTop: 8 }}>
            {result.keywords.map((keyword, i) => (
              <span className="chip" key={i}>{keyword}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
