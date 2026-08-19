'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Server, Users, Shield, Zap, BarChart3, Clock } from 'lucide-react';

const stats = [
  { icon: Server, value: 10000, suffix: 'K+', label: 'Resources Managed', color: '#7c3aed' },
  { icon: Users, value: 500, suffix: '+', label: 'Active Teams', color: '#3b82f6' },
  { icon: Shield, value: 99.9, suffix: '%', label: 'Uptime Achieved', decimals: 1, color: '#10b981' },
  { icon: Zap, value: 50000, suffix: 'K+', label: 'Deployments Monthly', color: '#f59e0b' },
  { icon: BarChart3, value: 98.6, suffix: '%', label: 'Success Rate', decimals: 1, color: '#ec4899' },
  { icon: Clock, value: 24, suffix: '/7', label: 'Support Available', color: '#06b6d4' },
];

function AnimatedCounter({
  value, suffix, decimals = 0, color, started,
}: { value: number; suffix: string; decimals?: number; color: string; started: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const duration = 1800;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((ease * value).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, value, decimals]);

  const formatted = value >= 1000
    ? (display / 1000).toFixed(0)
    : display.toFixed(decimals);

  return (
    <span className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color }}>
      {formatted}{suffix}
    </span>
  );
}

export default function MetricsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section data-motion-section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" id="metrics">
      {/* Full-width dark background strip */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(3,3,8,0) 0%, rgba(15,10,30,0.8) 20%, rgba(15,10,30,0.8) 80%, rgba(3,3,8,0) 100%)',
          borderTop: '1px solid rgba(139,92,246,0.1)',
          borderBottom: '1px solid rgba(139,92,246,0.1)',
        }}
      />

      <div ref={ref} className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  color={stat.color}
                  started={isInView}
                />
                <span className="text-sm text-zinc-400 leading-tight">{stat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
