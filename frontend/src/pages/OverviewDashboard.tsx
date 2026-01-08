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
    if (theme === 'gold') {
      document.documentElement.classList.add('theme-gold');
      document.documentElement.classList.remove('theme-purple');
    } else {
      document.documentElement.classList.add('theme-purple');
      document.documentElement.classList.remove('theme-gold');
    }
  }, [theme]);

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
      <div className="w-full">
        {/* Header Section */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 pb-6">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
                Overview Dashboard
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 font-medium">
                Real-time insights into exam assessment quality
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 xl:flex-shrink-0">
              <ThemeToggle theme={theme} onToggle={setTheme} />
              <DemoModeToggle enabled={demoMode} onToggle={setDemoMode} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-12">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-slate-700 border-t-[var(--accent)]" />
                <p className="mt-6 text-slate-400 font-medium text-lg">Loading analytics...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Stats Grid - Force 4 columns on large screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <DistributionChart data={stats.difficultyDistribution} />
                  <QualityTrendChart data={stats.qualityTrend} />
                </div>

                {/* Recent Activity Section */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Recent Analysis Activity
                    </h2>
                    <button 
                      className="px-5 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg text-sm bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 whitespace-nowrap"
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
                        className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/40 hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 shadow-lg hover:shadow-[0_4px_20px_rgba(var(--accent-rgb),0.2)]"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 bg-gradient-to-r from-transparent via-[rgba(var(--accent-rgb),0.05)] to-transparent" />
                        
                        <div className="relative z-10 flex-1 min-w-0">
                          <div className="font-semibold text-white mb-2 text-sm sm:text-base line-clamp-2">
                            {item.question}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
                            <span className="px-2.5 sm:px-3 py-1 rounded-full border bg-[rgba(var(--accent-rgb),0.15)] border-[rgba(var(--accent-rgb),0.3)] text-[var(--accent)] font-semibold whitespace-nowrap">
                              {item.subject}
                            </span>
                            <span className="hidden sm:inline text-slate-500">•</span>
                            <span className="font-semibold whitespace-nowrap">{item.difficulty}</span>
                            <span className="hidden sm:inline text-slate-500">•</span>
                            <span className="whitespace-nowrap">
                              Quality: <span className="font-bold text-[var(--accent)]">{item.quality}/100</span>
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          className="relative z-10 w-full sm:w-auto px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-md bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:shadow-[0_8px_16px_rgba(var(--accent-rgb),0.3)] active:scale-95 whitespace-nowrap"
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
    </div>
  );
};
