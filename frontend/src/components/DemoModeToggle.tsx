import { motion } from 'framer-motion';
import { useState } from 'react';

interface DemoModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const DemoModeToggle = ({ enabled, onToggle }: DemoModeToggleProps) => {
  return (
    <div 
      className="flex items-center gap-4 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-lg"
      style={{
        background: `linear-gradient(to right, rgba(var(--accent-rgb), 0.2), rgba(var(--accent-rgb), 0.1))`,
        borderColor: `rgba(var(--accent-rgb), 0.3)`,
      }}
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">Demo Mode</div>
        <div className="text-xs text-slate-300">
          {enabled ? 'Using cached responses for instant results' : 'Live ML predictions'}
        </div>
      </div>
      <motion.button
        onClick={() => onToggle(!enabled)}
        className="relative w-14 h-7 rounded-full transition-all duration-300"
        style={{
          background: enabled 
            ? `linear-gradient(to right, var(--gradient-from), var(--gradient-to))`
            : '#475569',
          boxShadow: enabled ? `0 4px 12px rgba(var(--accent-rgb), 0.4)` : 'none',
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
          animate={{ left: enabled ? '32px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
};

interface DemoModeContextType {
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

export const useDemoMode = () => {
  const [demoMode, setDemoMode] = useState(false);
  return { demoMode, setDemoMode };
};
