import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
    >
      {/* Question Text */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-300 flex-1">
            Question {index + 1}
          </h3>
          <DifficultyBadge difficulty={result.difficulty} />
        </div>
        <p className="text-gray-400 leading-relaxed border-l-4 border-purple-500 pl-4">
          {result.question}
        </p>
      </div>

      {/* Quality Score */}
      <div className="mb-6">
        <QualityScore score={result.qualityScore} />
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="mb-6">
          <FlagList flags={result.flags} />
        </div>
      )}

      {/* Keywords Highlight */}
      {result.keywords && result.keywords.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">
            Key Concepts Detected:
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((keyword, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
                className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResultCard;
