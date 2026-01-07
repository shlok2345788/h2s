import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type ThemeColor = 'purple' | 'gold';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as ThemeColor) || 'gold';
  });

  useEffect(() => {
    localStorage.setItem('theme-color', theme);
    
    // Apply theme to document root
    if (theme === 'gold') {
      document.documentElement.classList.remove('theme-purple');
      document.documentElement.classList.add('theme-gold');
    } else {
      document.documentElement.classList.remove('theme-gold');
      document.documentElement.classList.add('theme-purple');
    }
  }, [theme]);

  return { theme, setTheme };
};

interface ThemeToggleProps {
  theme: ThemeColor;
  onToggle: (theme: ThemeColor) => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <span className="text-sm font-medium text-slate-300">Theme:</span>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle('gold')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            theme === 'gold'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
          }`}
        >
          🌟 Gold
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle('purple')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            theme === 'purple'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
          }`}
        >
          💜 Purple
        </motion.button>
      </div>
    </div>
  );
};
