'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Cloud, Workflow, BarChart3 } from 'lucide-react';

const steps = [
  {
    num: 1,
    icon: Cloud,
    title: 'Connect Your Infrastructure',
    description: 'Connect all your cloud accounts and infrastructure in minutes with our guided setup wizard.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
  },
  {
    num: 2,
    icon: Workflow,
    title: 'Automate & Deploy',
    description: 'Build automation pipelines and deploy with confidence using intelligent CI/CD workflows.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    num: 3,
    icon: BarChart3,
    title: 'Monitor & Optimize',
    description: 'Monitor performance and optimize resources continuously with AI-powered insights.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section data-motion-section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" id="how-it-works">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-xs font-bold tracking-widest uppercase text-purple-400 border border-purple-500/20 bg-purple-500/10">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Get started in{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
            >
              3 simple steps
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-12 left-1/6 right-1/6 hidden lg:block h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), rgba(59,130,246,0.3), rgba(16,185,129,0.3), transparent)' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  className="flex flex-col items-center text-center group"
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <motion.div
                      className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: step.bg, border: `1px solid ${step.color}30` }}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: `0 0 40px ${step.color}50`,
                      }}
                    >
                      <Icon className="h-7 w-7" style={{ color: step.color }} />
                    </motion.div>
                    {/* Step number badge */}
                    <div
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}99)` }}
                    >
                      {step.num}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="w-full p-6 rounded-[22px] border backdrop-blur-md transition-all duration-300 group-hover:border-opacity-50"
                    style={{
                      background: 'rgba(10,10,20,0.4)',
                      borderColor: `${step.color}20`,
                    }}
                  >
                    <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
