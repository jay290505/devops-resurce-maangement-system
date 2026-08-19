'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Server, Workflow, BarChart3, Bell, Users, TrendingUp } from 'lucide-react';
import { GlowBorderCard } from '@/components/ui/glow-border-card';

const features = [
  {
    icon: Server,
    title: 'Resource Management',
    description: 'Centralise and manage all your infrastructure from and deployment plans resources in one place.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    glow: 'rgba(124,58,237,0.4)',
  },
  {
    icon: Workflow,
    title: 'CI/CD Automation',
    description: 'Automate build, test, and deployment plans seamlessly and reliably.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    glow: 'rgba(59,130,246,0.4)',
  },
  {
    icon: BarChart3,
    title: 'Real-time Monitoring',
    description: 'Monitor performance, usage, and alerts in real-time as they happen.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get intelligent alerts and notifications exactly where they impact your systems.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    glow: 'rgba(245,158,11,0.4)',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Collaborate with your team with seamless unified access control.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.2)',
    glow: 'rgba(236,72,153,0.4)',
  },
  {
    icon: TrendingUp,
    title: 'Cost Optimization',
    description: 'Optimize resource usage and reduce cloud costs with intelligent recommendations.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
    glow: 'rgba(6,182,212,0.4)',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlowBorderCard
        width="100%"
        height="100%"
        borderRadius="22px"
        borderWidth="2px"
        blurAmount="5px"
        inset="0"
        animationDuration={5 + index}
        paused
        gradientColors={[feature.color, '#3b82f6', '#8b5cf6', feature.color]}
        className="min-h-[218px] !bg-[#090914]"
      >
      <motion.div
        style={{
          background: feature.bg,
          borderColor: feature.border,
        }}
        className="relative group h-full p-6 rounded-[22px] border backdrop-blur-xl cursor-default
                   hover:scale-[1.02] transition-transform duration-300"
        whileHover={{ y: -4, boxShadow: `0 0 32px ${feature.glow}` }}
      >
        {/* Icon */}
        <div
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: feature.bg, border: `1px solid ${feature.border}` }}
        >
          <Icon className="h-5 w-5" style={{ color: feature.color }} />
        </div>

        <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>

        {/* Reflection shimmer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-[22px]" />
      </motion.div>
      </GlowBorderCard>
    </motion.div>
  );
}

export default function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section data-motion-section className="relative py-24 px-4 sm:px-6 lg:px-8" id="features">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          ref={ref}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-xs font-bold tracking-widest uppercase text-purple-400 border border-purple-500/20 bg-purple-500/10">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Everything you need to{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
            >
              manage
            </span>{' '}
            DevOps resources
          </h2>
        </motion.div>

        {/* 6-card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
