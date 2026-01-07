interface FlagListProps {
  flags: string[];
}

const FlagList = ({ flags }: FlagListProps) => {
  return (
    <div>
      <h4 className="label">Flags detected</h4>
      <div className="flag-list">
        {flags.map((flag, index) => (
          <div className="flag-item" key={index}>
            <span>⚠️</span>
            <span className="small-text" style={{ color: 'var(--text)' }}>{flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlagList;
