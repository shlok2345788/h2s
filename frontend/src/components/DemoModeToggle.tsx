import { motion } from 'framer-motion';
import { useState } from 'react';

interface DemoModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const DemoModeToggle = ({ enabled, onToggle }: DemoModeToggleProps) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-lg bg-gradient-to-r from-[rgba(var(--accent-rgb),0.2)] to-[rgba(var(--accent-rgb),0.1)] border-[rgba(var(--accent-rgb),0.3)]">
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm font-semibold text-white">Demo Mode</div>
        <div className="text-xs text-slate-300 mt-0.5 line-clamp-1">
          {enabled ? 'Using cached responses' : 'Live ML predictions'}
        </div>
      </div>
      <motion.button
        onClick={() => onToggle(!enabled)}
        className={`relative w-12 sm:w-14 h-6 sm:h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
          enabled 
            ? 'bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-[0_4px_12px_rgba(var(--accent-rgb),0.4)]' 
            : 'bg-slate-600'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-0.5 sm:top-1 w-5 h-5 bg-white rounded-full shadow-lg"
          animate={{ left: enabled ? 'calc(100% - 1.25rem)' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
};

export const useDemoMode = () => {
  const [demoMode, setDemoMode] = useState(false);
  return { demoMode, setDemoMode };
};
