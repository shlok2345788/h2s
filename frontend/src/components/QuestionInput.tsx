import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuestionInputProps {
  onAnalyze: (questions: string[]) => void;
  loading: boolean;
}

const QuestionInput = ({ onAnalyze, loading }: QuestionInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    // Split by double newlines or numbered questions
    const questions = input
      .split(/\n\n+|\n\d+\.|^\d+\./)
      .map(q => q.trim())
      .filter(q => q.length > 0);
    
    onAnalyze(questions);
  };

  const exampleQuestion = `What is the time complexity of quicksort algorithm in the worst case?

Explain the concept of virtual DOM in React and how it improves performance.

Write a function to reverse a linked list.`;

  const loadExample = () => {
    setInput(exampleQuestion);
  };

  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">Enter Your Questions</h2>
      
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your questions here... (one per line or separated by blank lines)"
        className="w-full h-64 bg-gray-900/50 border border-white/10 rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
      />

      <div className="mt-6 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Analyzing...
            </span>
          ) : (
            '🚀 Analyze Questions'
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadExample}
          className="px-6 py-4 glass rounded-lg font-semibold hover:bg-white/10 transition-all"
        >
          Load Example
        </motion.button>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>💡 Tip:</strong> Separate multiple questions with blank lines or use numbered format (1., 2., 3.)
        </p>
      </div>
    </div>
  );
};

export default QuestionInput;
