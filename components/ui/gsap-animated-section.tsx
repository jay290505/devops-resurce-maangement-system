'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Zap, Activity, Clock } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function GsapAnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);
  const stat3Ref = useRef<HTMLSpanElement>(null);
  const stat4Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Entrance animation for title & cards
      gsap.fromTo(
        '.gsap-fade-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        }
      );

      // 2. Animated Counter 1: 99.99%
      const counter1 = { val: 0 };
      gsap.to(counter1, {
        val: 99.99,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
        onUpdate: () => {
          if (stat1Ref.current) {
            stat1Ref.current.textContent = counter1.val.toFixed(2) + '%';
          }
        },
      });

      // 3. Animated Counter 2: 15,000+
      const counter2 = { val: 0 };
      gsap.to(counter2, {
        val: 15000,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
        onUpdate: () => {
          if (stat2Ref.current) {
            stat2Ref.current.textContent = Math.floor(counter2.val).toLocaleString() + '+';
          }
        },
      });

      // 4. Animated Counter 3: 2.4 ms
      const counter3 = { val: 20 };
      gsap.to(counter3, {
        val: 2.4,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
        onUpdate: () => {
          if (stat3Ref.current) {
            stat3Ref.current.textContent = counter3.val.toFixed(1) + 'ms';
          }
        },
      });

      // 5. Animated Counter 4: 100%
      const counter4 = { val: 0 };
      gsap.to(counter4, {
        val: 100,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
        onUpdate: () => {
          if (stat4Ref.current) {
            stat4Ref.current.textContent = Math.floor(counter4.val) + '%';
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    {
      ref: stat1Ref,
      initial: '0.00%',
      label: 'SLA Uptime Guarantee',
      desc: 'High availability multi-region deployment redundancy',
      icon: ShieldCheck,
      color: 'text-amber-500',
    },
    {
      ref: stat2Ref,
      initial: '0+',
      label: 'Automated Deployments',
      desc: 'CI/CD pipeline executions without manual intervention',
      icon: Zap,
      color: 'text-blue-500',
    },
    {
      ref: stat3Ref,
      initial: '20.0ms',
      label: 'Avg Response Latency',
      desc: 'Ultra-low response times via global edge caching',
      icon: Activity,
      color: 'text-emerald-500',
    },
    {
      ref: stat4Ref,
      initial: '0%',
      label: 'Audit Trail Coverage',
      desc: 'Immutable telemetry logs for compliance & RBAC',
      icon: Clock,
      color: 'text-purple-500',
    },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-5xl py-12">
      {/* Section Header */}
      <div className="text-center mb-12 gsap-fade-item">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
          Engineered For Enterprise Scale
        </h2>
        <p className="mt-3 text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
          Powered by real-time GSAP performance telemetry metrics and automated microservices orchestration.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="gsap-fade-item p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-surface)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800"
                      style={{ color: 'var(--theme-text-secondary)' }}>
                  GSAP TELEMETRY
                </span>
              </div>

              <div className="space-y-1">
                <span
                  ref={stat.ref}
                  className="text-3xl font-black tracking-tight font-mono block"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {stat.initial}
                </span>
                <h4 className="text-sm font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
                  {stat.label}
                </h4>
                <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  {stat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GsapAnimatedSection;
