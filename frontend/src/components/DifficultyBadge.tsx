import { motion } from 'framer-motion';

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  const getStyles = () => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 border-green-500 text-green-300';
      case 'Medium':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      case 'Hard':
        return 'bg-red-500/20 border-red-500 text-red-300';
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`px-4 py-2 border-2 rounded-lg font-bold text-sm flex items-center gap-2 ${getStyles()}`}
    >
      <span>{getIcon()}</span>
      <span>{difficulty}</span>
    </motion.div>
  );
};

export default DifficultyBadge;
