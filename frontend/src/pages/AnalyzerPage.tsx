import { useState } from 'react';
import { motion } from 'framer-motion';
import QuestionInput from '../components/QuestionInput';
import ResultCard from '../components/ResultCard';
import { analyzeQuestion } from '../api/analyzer';
import type { AnalysisResult } from '../types';

const AnalyzerPage = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (questions: string[]) => {
    setLoading(true);
    try {
      const analysisResults = await analyzeQuestion(questions);
      setResults(analysisResults);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Question Analyzer
          </h1>
          <p className="text-xl text-gray-400">
            Paste your questions below and get instant AI-powered analysis
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <QuestionInput onAnalyze={handleAnalyze} loading={loading} />
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="glass rounded-2xl p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-400">Analyzing questions...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <ResultCard key={index} result={result} index={index} />
              ))
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-400">
                  Your analysis results will appear here
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzerPage;
