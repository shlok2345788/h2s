import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    icon: '📝',
    title: 'Input',
    description: 'Paste your questions or upload a file',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🤖',
    title: 'Analyze',
    description: 'AI processes difficulty, quality & clarity',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '📋',
    title: 'Review',
    description: 'Get detailed scores and improvement flags',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: '📤',
    title: 'Export',
    description: 'Download reports or integrate via API',
    color: 'from-orange-500 to-red-500',
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 gradient-text">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Four simple steps to transform your question assessment process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="glass rounded-2xl p-8 h-full relative overflow-hidden group cursor-pointer"
              >
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-white/5">
                  {index + 1}
                </div>

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-6"
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Glow Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
              </motion.div>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                    className="text-3xl text-purple-500"
                  >
                    →
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
