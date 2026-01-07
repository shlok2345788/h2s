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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 shadow-2xl hover:shadow-[var(--accent)]/10 transition-all duration-300"
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
        style={{
          background: `linear-gradient(to bottom right, var(--gradient-from), var(--gradient-to))`,
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-400 mb-2">{title}</div>
          <div className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{value}</div>
          {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
          {trend && trendValue && (
            <div className={`text-sm mt-3 font-semibold flex items-center gap-1 ${getTrendColor()}`}>
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-5xl opacity-30 filter drop-shadow-lg">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};
