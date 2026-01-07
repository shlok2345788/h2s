interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  const getIcon = () => {
    switch (difficulty) {
      case 'Easy':
        return '✅';
      case 'Medium':
        return '⚠️';
      case 'Hard':
        return '🔥';
    }
  };

  const getClass = () => {
    if (difficulty === 'Easy') return 'badge badge--easy';
    if (difficulty === 'Medium') return 'badge badge--medium';
    return 'badge badge--hard';
  };

  return (
    <div className={getClass()}>
      <span>{getIcon()}</span>
      <span>{difficulty}</span>
    </div>
  );
};

export default DifficultyBadge;
