import { motion } from 'framer-motion';

interface FlagListProps {
  flags: string[];
}

const FlagList = ({ flags }: FlagListProps) => {
  const getFlagIcon = (flag: string) => {
    if (flag.toLowerCase().includes('ambiguous')) return '❓';
    if (flag.toLowerCase().includes('broad')) return '📏';
    if (flag.toLowerCase().includes('context')) return '📝';
    if (flag.toLowerCase().includes('grammar')) return '✏️';
    return '⚠️';
  };

  const getFlagColor = (flag: string) => {
    if (flag.toLowerCase().includes('ambiguous')) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300';
    if (flag.toLowerCase().includes('broad')) return 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300';
    if (flag.toLowerCase().includes('context')) return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300';
    return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300';
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-3">Issues Detected:</h4>
      <div className="space-y-2">
        {flags.map((flag, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${getFlagColor(flag)} border rounded-lg`}
          >
            <span className="text-xl">{getFlagIcon(flag)}</span>
            <span className="text-sm font-medium">{flag}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FlagList;
