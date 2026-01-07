import { useState } from 'react';
import { motion } from 'framer-motion';
import { analyzeQuestion } from '../api/analyzer';
import type { AnalysisResponse } from '../types';

interface BulkQuestion {
  id: string;
  question: string;
  subject: string;
  bloom_level: number;
  result?: AnalysisResponse;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

export const BulkAnalyzerPage = () => {
  const [questions, setQuestions] = useState<BulkQuestion[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      const parsedQuestions: BulkQuestion[] = dataLines.map((line, index) => {
        const [question, subject, bloomLevel] = line.split(',').map(s => s.trim());
        return {
          id: `q-${index}`,
          question: question.replace(/^"|"$/g, ''), // Remove quotes
          subject: subject || 'General',
          bloom_level: parseInt(bloomLevel) || 1,
          status: 'pending' as const,
        };
      });

      setQuestions(parsedQuestions);
    };

    reader.readAsText(file);
  };

  const analyzeAll = async () => {
    setAnalyzing(true);
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Update status to processing
      setQuestions(prev => prev.map((q, idx) => 
        idx === i ? { ...q, status: 'processing' } : q
      ));

      try {
        const result = await analyzeQuestion({
          question: question.question,
          subject: question.subject,
          bloom_level: question.bloom_level,
        });

        setQuestions(prev => prev.map((q, idx) =>
          idx === i ? { ...q, result, status: 'complete' } : q
        ));
      } catch (error) {
        setQuestions(prev => prev.map((q, idx) =>
          idx === i ? { ...q, status: 'error' } : q
        ));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setAnalyzing(false);
  };

  const exportResults = () => {
    const csv = [
      ['Question', 'Subject', 'Bloom Level', 'Difficulty', 'Confidence', 'Quality', 'Flags'].join(','),
      ...questions
        .filter(q => q.result)
        .map(q => [
          `"${q.question}"`,
          q.subject,
          q.bloom_level,
          q.result?.difficulty.level,
          q.result?.difficulty.confidence,
          q.result?.quality.score,
          q.result?.flags.length || 0,
        ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const completedCount = questions.filter(q => q.status === 'complete').length;
  const errorCount = questions.filter(q => q.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Bulk Question Analyzer</h1>
          <p className="text-gray-400 mb-8">Upload and analyze multiple questions at once</p>

          {/* Upload Section */}
          <div className="panel mb-8">
            <div className="panel__title mb-4">Upload Questions</div>
            <p className="text-sm text-gray-400 mb-4">
              Upload a CSV file with columns: question, subject, bloom_level
            </p>
            
            <div className="flex gap-4">
              <label className="btn btn-primary cursor-pointer">
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {questions.length > 0 && (
                <>
                  <button
                    onClick={analyzeAll}
                    disabled={analyzing}
                    className="btn btn-primary"
                  >
                    {analyzing ? 'Analyzing...' : `Analyze ${questions.length} Questions`}
                  </button>
                  
                  {completedCount > 0 && (
                    <button
                      onClick={exportResults}
                      className="btn btn-secondary"
                    >
                      Export Results
                    </button>
                  )}
                </>
              )}
            </div>

            {questions.length > 0 && (
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-gray-400">Total: {questions.length}</span>
                <span className="text-green-400">Completed: {completedCount}</span>
                <span className="text-red-400">Errors: {errorCount}</span>
                <span className="text-yellow-400">
                  Pending: {questions.length - completedCount - errorCount}
                </span>
              </div>
            )}
          </div>

          {/* Results Table */}
          {questions.length > 0 && (
            <div className="panel">
              <div className="panel__title mb-4">Analysis Results</div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Question</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subject</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Difficulty</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Quality</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Flags</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, index) => (
                      <motion.tr
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-800 hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4 text-sm max-w-md truncate">
                          {q.question}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="pill">{q.subject}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {q.result && (
                            <span className={`pill ${
                              q.result.difficulty.level === 'Easy' ? 'bg-green-500/20 text-green-400' :
                              q.result.difficulty.level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {q.result.difficulty.level}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {q.result && (
                            <span className="text-sm">{q.result.quality.score.toFixed(0)}/100</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {q.result && (
                            <span className={`text-sm ${q.result.flags.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                              {q.result.flags.length}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={q.status} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: BulkQuestion['status'] }) => {
  const config = {
    pending: { label: 'Pending', color: 'text-gray-400' },
    processing: { label: 'Processing...', color: 'text-blue-400' },
    complete: { label: 'Complete', color: 'text-green-400' },
    error: { label: 'Error', color: 'text-red-400' },
  };

  const { label, color } = config[status];

  return <span className={`text-xs ${color}`}>{label}</span>;
};
