import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../components/StatCard';
import { DemoModeToggle, useDemoMode } from '../components/DemoModeToggle';
import { ThemeToggle, useTheme } from '../components/ThemeToggle';
import { DistributionChart } from '../components/DistributionChart';
import type { DifficultyDistribution } from '../components/DistributionChart';
import { QualityTrendChart } from '../components/QualityTrendChart';
import type { QualityTrendData } from '../components/QualityTrendChart';

interface OverviewStats {
  totalQuestions: number;
  avgQuality: number;
  difficultyDistribution: DifficultyDistribution;
  flagsDetected: number;
  qualityTrend: QualityTrendData[];
}

const DEMO_DATA: OverviewStats = {
  totalQuestions: 1247,
  avgQuality: 78.3,
  difficultyDistribution: {
    Easy: 312,
    Medium: 678,
    Hard: 257,
  },
  flagsDetected: 89,
  qualityTrend: [
    { date: '2026-01-01', avgQuality: 72.5, count: 45 },
    { date: '2026-01-02', avgQuality: 75.2, count: 52 },
    { date: '2026-01-03', avgQuality: 76.8, count: 61 },
    { date: '2026-01-04', avgQuality: 78.1, count: 48 },
    { date: '2026-01-05', avgQuality: 79.4, count: 55 },
    { date: '2026-01-06', avgQuality: 78.9, count: 50 },
    { date: '2026-01-07', avgQuality: 80.2, count: 58 },
  ],
};

export const OverviewDashboard = () => {
  const { demoMode, setDemoMode } = useDemoMode();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState<OverviewStats>(DEMO_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!demoMode) {
      loadLiveData();
    } else {
      setStats(DEMO_DATA);
    }
  }, [demoMode]);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from BigQuery analytics endpoint
      // const response = await fetch('/api/analytics/overview');
      // const data = await response.json();
      // setStats(data);
      
      // For now, use demo data
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(DEMO_DATA);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Overview Dashboard
            </h1>
            <p className="text-lg text-slate-400">Real-time insights into exam assessment quality</p>
          </div>
          <div className="flex gap-4">
            <ThemeToggle theme={theme} onToggle={setTheme} />
            <DemoModeToggle enabled={demoMode} onToggle={setDemoMode} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
              <p className="mt-4 text-gray-400">Loading analytics...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Questions Analyzed"
                  value={stats.totalQuestions.toLocaleString()}
                  subtitle="All time"
                  trend="up"
                  trendValue="+12.5% this month"
                  icon="📊"
                />
                <StatCard
                  title="Average Quality Score"
                  value={stats.avgQuality.toFixed(1)}
                  subtitle="Out of 100"
                  trend="up"
                  trendValue="+2.3 pts"
                  icon="⭐"
                />
                <StatCard
                  title="Flags Detected Today"
                  value={stats.flagsDetected}
                  subtitle="Requiring attention"
                  trend="down"
                  trendValue="-8 from yesterday"
                  icon="🚩"
                />
                <StatCard
                  title="Exam Health Score"
                  value="A+"
                  subtitle="Excellent distribution"
                  trend="neutral"
                  icon="✅"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <DistributionChart data={stats.difficultyDistribution} />
                <QualityTrendChart data={stats.qualityTrend} />
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Recent Analysis Activity</div>
                  <button 
                    className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg text-sm"
                    style={{
                      background: `linear-gradient(to right, var(--gradient-from), var(--gradient-to))`,
                      boxShadow: `0 4px 12px rgba(var(--accent-rgb), 0.3)`,
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateY(-2px)';
                      target.style.boxShadow = `0 8px 20px rgba(var(--accent-rgb), 0.4)`;
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = `0 4px 12px rgba(var(--accent-rgb), 0.3)`;
                    }}
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { question: 'Explain the concept of machine learning...', difficulty: 'Medium', quality: 85, subject: 'Computer Science' },
                    { question: 'What are the key principles of...', difficulty: 'Easy', quality: 92, subject: 'Physics' },
                    { question: 'Analyze the impact of globalization...', difficulty: 'Hard', quality: 78, subject: 'Economics' },
                    { question: 'Describe the process of photosynthesis...', difficulty: 'Medium', quality: 88, subject: 'Biology' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="relative group flex items-center justify-between p-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/40 transition-all duration-300 shadow-lg"
                      style={{
                        borderColor: 'rgba(51, 65, 85, 0.4)',
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.borderColor = 'rgba(var(--accent-rgb), 0.4)';
                        target.style.boxShadow = `0 4px 20px rgba(var(--accent-rgb), 0.2)`;
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.borderColor = 'rgba(51, 65, 85, 0.4)';
                        target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
                      }}
                    >
                      {/* Glow effect on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(to right, transparent, rgba(var(--accent-rgb), 0.05), transparent)`,
                        }}
                      />
                      
                      <div className="relative z-10 flex-1">
                        <div className="font-medium text-white mb-2">{item.question}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span 
                            className="px-3 py-1 rounded-full border"
                            style={{
                              backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                              borderColor: 'rgba(var(--accent-rgb), 0.3)',
                              color: 'var(--accent)',
                            }}
                          >
                            {item.subject}
                          </span>
                          <span>•</span>
                          <span className="font-medium">{item.difficulty}</span>
                          <span>•</span>
                          <span>Quality: <span style={{ color: 'var(--accent)' }} className="font-bold">{item.quality}/100</span></span>
                        </div>
                      </div>
                      <button 
                        className="relative z-10 ml-4 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-md"
                        style={{
                          background: `linear-gradient(to right, var(--gradient-from), var(--gradient-to))`,
                        }}
                        onMouseEnter={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.boxShadow = `0 8px 16px rgba(var(--accent-rgb), 0.3)`;
                        }}
                        onMouseLeave={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                        }}
                      >
                        Details
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
