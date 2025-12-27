import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  {
    icon: '📊',
    title: 'Inconsistent Difficulty',
    description: 'Questions vary wildly in complexity, making fair assessment impossible.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: '❓',
    title: 'Ambiguous Questions',
    description: 'Unclear wording leads to student confusion and unreliable results.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: '😫',
    title: 'Manual Review Fatigue',
    description: 'Hours spent reviewing questions that could be automated intelligently.',
    color: 'from-purple-500 to-pink-500',
  },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 gradient-text">
            Why It Matters
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Traditional question assessment is broken. Here's why we built this.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -100 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="glass rounded-2xl p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all group"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="text-6xl mb-4"
              >
                {problem.icon}
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {problem.description}
              </p>
              <div className={`mt-6 h-1 bg-gradient-to-r ${problem.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
