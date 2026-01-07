interface QualityScoreProps {
  score: number;
}

const QualityScore = ({ score }: QualityScoreProps) => {
  return (
    <div>
      <div className="panel__header" style={{ marginBottom: 8 }}>
        <span className="label">Quality score</span>
        <strong>{score}/100</strong>
      </div>
      <div className="score-bar">
        <div className="score-bar__fill" style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <div className="small-text" style={{ marginTop: 4 }}>
        Higher scores reflect precise wording, balanced scope, and clear objectives.
      </div>
    </div>
  );
};

export default QualityScore;
