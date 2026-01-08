import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/60 p-8 sm:p-12 lg:p-16 xl:p-20 shadow-2xl overflow-hidden"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--accent)]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[var(--accent)]/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Pill/Tagline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-slate-900 font-extrabold text-sm sm:text-base mb-8 shadow-xl shadow-[rgba(var(--accent-rgb),0.4)] hover:shadow-2xl hover:shadow-[rgba(var(--accent-rgb),0.5)] transition-all duration-300"
            >
              <span className="text-lg">✨</span>
              Education-grade quality control
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 bg-gradient-to-r from-white via-amber-50 to-yellow-50 bg-clip-text text-transparent leading-[1.1] tracking-tight"
            >
              AI Question Difficulty & Quality Analyzer
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl sm:text-2xl lg:text-3xl text-slate-300 mb-10 max-w-4xl leading-relaxed font-medium"
            >
              Assess clarity, difficulty, and quality before an exam goes live. Issue API keys to teams and plug the analyzer into your item bank.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
              <Link
                to="/analyze"
                className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white font-bold text-lg sm:text-xl shadow-2xl shadow-[rgba(var(--accent-rgb),0.4)] hover:shadow-[0_20px_60px_rgba(var(--accent-rgb),0.5)] transition-all duration-300 hover:-translate-y-2 active:translate-y-0 text-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>🚀</span>
                  Analyze a question
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Link>
              <Link
                to="/auth"
                className="px-10 py-5 rounded-2xl bg-slate-800/90 border-2 border-slate-700/60 text-white font-bold text-lg sm:text-xl hover:bg-slate-800 hover:border-[rgba(var(--accent-rgb),0.5)] transition-all duration-300 hover:-translate-y-2 active:translate-y-0 text-center backdrop-blur-sm shadow-xl"
              >
                Login / Register
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
        >
          {[
            { value: '95%', label: 'coverage on ambiguity flags', icon: '🎯' },
            { value: '30 req/min', label: 'per-key throttling by default', icon: '⚡' },
            { value: '5 min', label: 'to get your first API key', icon: '🚀' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.15, duration: 0.5, type: "spring" }}
              whileHover={{ scale: 1.08, translateY: -8, rotate: 1 }}
              className="group relative rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white p-8 sm:p-10 shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-all duration-500 border-2 border-slate-200/50 hover:border-[var(--accent)]/30 overflow-hidden"
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent)]/0 group-hover:from-[var(--accent)]/10 group-hover:to-[var(--accent)]/5 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-5xl sm:text-6xl font-black text-slate-900 mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-base sm:text-lg text-slate-600 font-bold leading-relaxed">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-400">Everything you need for quality assessment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {[
            {
              icon: '🏛️',
              title: 'Built for institutes',
              description: 'Role-based access, key rotation, and request logging keep your assessment pipeline safe.',
              gradient: 'from-blue-500/20 to-purple-500/20',
            },
            {
              icon: '🤖',
              title: 'Explainable AI',
              description: 'Difficulty, quality score, flags, and suggested fixes are returned with plain-language rationales.',
              gradient: 'from-purple-500/20 to-pink-500/20',
            },
            {
              icon: '⚡',
              title: 'Fast integration',
              description: 'REST endpoints for registration and question analysis with API key authentication.',
              gradient: 'from-amber-500/20 to-orange-500/20',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.15, duration: 0.5, type: "spring" }}
              whileHover={{ scale: 1.05, translateY: -10 }}
              className="group relative rounded-3xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border-2 border-slate-700/60 p-8 sm:p-10 shadow-2xl hover:shadow-[0_25px_60px_rgba(var(--accent-rgb),0.2)] hover:border-[rgba(var(--accent-rgb),0.5)] transition-all duration-500 overflow-hidden"
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.7 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="rounded-3xl bg-gradient-to-r from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 backdrop-blur-xl border-2 border-[rgba(var(--accent-rgb),0.3)] p-12 sm:p-16 text-center">
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to get started?
          </h3>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Join thousands of educators using AI to improve their assessment quality
          </p>
          <Link
            to="/auth"
            className="inline-block px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg sm:text-xl shadow-2xl hover:shadow-[0_25px_60px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-2 active:translate-y-0"
          >
            Get Started Free →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
