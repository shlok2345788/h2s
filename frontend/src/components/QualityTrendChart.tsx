import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

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
  const height = 220;
  const padding = 40;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsive width
  const [width, setWidth] = useState(600);
  
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setWidth(Math.max(containerWidth - 32, 400));
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (item.avgQuality / maxQuality) * (height - 2 * padding);
    return { x, y, ...item };
  });

  const pathData = points.length > 0 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') : '';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl hover:shadow-[0_12px_40px_rgba(var(--accent-rgb),0.15)] transition-all duration-300 h-full flex flex-col">
      <div className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        {title}
      </div>
      <div ref={containerRef} className="relative w-full overflow-x-auto flex-1">
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible filter drop-shadow-xl"
          preserveAspectRatio="none"
        >
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
                  strokeWidth="1.5"
                  strokeDasharray="4"
                />
                <text x={padding - 12} y={y + 4} fill="#64748b" fontSize="13" textAnchor="end" fontWeight="600">
                  {value}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          {pathData && (
            <motion.path
              d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
              fill="url(#gradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Line */}
          {pathData && (
            <motion.path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />
          )}

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="10"
                fill="var(--accent)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                className="filter drop-shadow-lg"
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#0f172a"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.6, duration: 0.4 }}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={height - padding + 22}
              fill="#64748b"
              fontSize="11"
              textAnchor="middle"
              fontWeight="600"
            >
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.7" />
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
            className="w-4 h-4 rounded-full shadow-lg bg-[var(--accent)] shadow-[rgba(var(--accent-rgb),0.5)]"
          />
          <span className="text-slate-300 font-semibold">Average Quality Score</span>
        </div>
      </div>
    </div>
  );
};
