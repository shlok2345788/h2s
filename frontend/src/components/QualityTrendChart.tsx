import { motion } from 'framer-motion';

export interface QualityTrendData {
  date: string;
  avgQuality: number;
  count: number;
}

interface QualityTrendChartProps {
  data: QualityTrendData[];
  title?: string;
}

export const QualityTrendChart = ({ data, title = 'Quality Score Trend' }: QualityTrendChartProps) => {
  const maxQuality = 100;
  const height = 200;
  const width = 600;
  const padding = 40;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (item.avgQuality / maxQuality) * (height - 2 * padding);
    return { x, y, ...item };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{title}</div>
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible filter drop-shadow-xl">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = height - padding - (value / maxQuality) * (height - 2 * padding);
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text x={padding - 10} y={y + 4} fill="#64748b" fontSize="12" textAnchor="end">
                  {value}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <motion.path
            d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
            fill="url(#gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="var(--accent)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="filter drop-shadow-lg"
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#0f172a"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={height - padding + 20}
              fill="#64748b"
              fontSize="10"
              textAnchor="middle"
            >
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--gradient-from)" />
              <stop offset="50%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--gradient-to)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shadow-lg"
            style={{
              backgroundColor: 'var(--accent)',
              boxShadow: '0 4px 6px rgba(var(--accent-rgb), 0.5)',
            }}
          />
          <span className="text-slate-300">Average Quality Score</span>
        </div>
      </div>
    </div>
  );
};
