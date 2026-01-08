import { motion } from 'framer-motion';

export interface DifficultyDistribution {
  Easy: number;
  Medium: number;
  Hard: number;
}

interface DistributionChartProps {
  data: DifficultyDistribution;
  title?: string;
}

export const DistributionChart = ({ data, title = 'Difficulty Distribution' }: DistributionChartProps) => {
  const total = data.Easy + data.Medium + data.Hard;
  const percentages = {
    Easy: total > 0 ? (data.Easy / total) * 100 : 0,
    Medium: total > 0 ? (data.Medium / total) * 100 : 0,
    Hard: total > 0 ? (data.Hard / total) * 100 : 0,
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl hover:shadow-[0_12px_40px_rgba(var(--accent-rgb),0.15)] transition-all duration-300 h-full flex flex-col">
      <div className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        {title}
      </div>
      
      {/* Bar Chart */}
      <div className="space-y-5 mb-8 flex-1">
        {Object.entries(data).map(([level, count]) => (
          <div key={level}>
            <div className="flex justify-between items-center text-sm sm:text-base mb-3">
              <span className="font-bold text-slate-200">{level}</span>
              <span className="text-slate-400 font-semibold">
                {count.toLocaleString()} ({percentages[level as keyof typeof percentages].toFixed(1)}%)
              </span>
            </div>
            <div className="h-4 sm:h-5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentages[level as keyof typeof percentages]}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full shadow-lg ${
                  level === 'Easy' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                  level === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-rose-500 to-rose-400'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart Visualization */}
      <div className="flex justify-center items-center pb-2">
        <svg width="220" height="220" viewBox="0 0 200 200" className="filter drop-shadow-2xl max-w-full h-auto">
          <PieSlice
            percentage={percentages.Easy}
            offset={0}
            color="#10b981"
          />
          <PieSlice
            percentage={percentages.Medium}
            offset={percentages.Easy}
            color="#f59e0b"
          />
          <PieSlice
            percentage={percentages.Hard}
            offset={percentages.Easy + percentages.Medium}
            color="#ef4444"
          />
          <circle cx="100" cy="100" r="55" fill="#0f172a" />
          <text x="100" y="95" textAnchor="middle" dy=".3em" fill="white" fontSize="32" fontWeight="bold">
            {total}
          </text>
          <text x="100" y="120" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="600">
            Total
          </text>
        </svg>
      </div>
    </div>
  );
};

interface PieSliceProps {
  percentage: number;
  offset: number;
  color: string;
}

const PieSlice = ({ percentage, offset, color }: PieSliceProps) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  const rotation = -90 + (offset / 100) * 360;

  return (
    <motion.circle
      cx="100"
      cy="100"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth="22"
      strokeDasharray={strokeDasharray}
      initial={{ strokeDasharray: `0 ${circumference}` }}
      animate={{ strokeDasharray }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
      transform={`rotate(${rotation} 100 100)`}
    />
  );
};
