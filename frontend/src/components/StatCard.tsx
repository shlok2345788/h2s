import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
}

export const StatCard = ({ title, value, subtitle, trend, trendValue, icon }: StatCardProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-rose-400';
    return 'text-slate-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, translateY: -6 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 p-6 sm:p-7 shadow-2xl hover:shadow-[0_12px_40px_rgba(var(--accent-rgb),0.2)] hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 group"
    >
      {/* Animated gradient background */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] transition-opacity duration-300 group-hover:opacity-20" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-3">
            <div className="text-xs sm:text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
              {title}
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent leading-tight">
              {value}
            </div>
            {subtitle && (
              <div className="text-sm text-slate-500 font-semibold">
                {subtitle}
              </div>
            )}
          </div>
          {icon && (
            <div className="text-5xl sm:text-6xl opacity-25 filter drop-shadow-2xl flex-shrink-0 group-hover:opacity-35 transition-opacity">
              {icon}
            </div>
          )}
        </div>
        
        {/* Trend Indicator */}
        {trend && trendValue && (
          <div className={`text-sm font-bold flex items-center gap-2 ${getTrendColor()}`}>
            <span className="text-lg font-extrabold">{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
