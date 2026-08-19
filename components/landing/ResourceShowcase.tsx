'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Plus, Check, Cloud } from 'lucide-react';

const resources = [
  { name: 'Web Server 01', type: 'EC2 Instance', status: 'Running', usage: 68, location: 'us-east-1', color: '#10b981' },
  { name: 'Database Cluster', type: 'RDS Instance', status: 'Running', usage: 45, location: 'us-west-2', color: '#10b981' },
  { name: 'Redis Cache', type: 'ElastiCache', status: 'Running', usage: 22, location: 'eu-west-1', color: '#10b981' },
  { name: 'Storage Bucket', type: 'S3 Bucket', status: 'Healthy', usage: 38, location: 'us-east-2', color: '#10b981' },
  { name: 'Load Balancer', type: 'ALB', status: 'Running', usage: 55, location: 'us-east-1', color: '#10b981' },
];

const bullets = [
  'Multi-cloud resource management',
  'Real-time resource monitoring',
  'Automated resource discovery',
  'Resource grouping and tagging',
];

function UsageBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right text-xs font-mono font-bold" style={{ color: value > 75 ? '#f59e0b' : '#10b981' }}>
        {value}%
      </span>
      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: value > 75 ? '#f59e0b' : '#10b981' }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </div>
  );
}

export default function ResourceShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section data-motion-section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" id="resources">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Table Mockup Card */}
          <motion.div
            ref={ref}
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-[22px] border overflow-hidden backdrop-blur-xl"
              style={{
                background: 'rgba(8,8,18,0.75)',
                borderColor: 'rgba(139,92,246,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {/* Header bar */}
              <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-semibold text-zinc-300">Resource Overview</span>
              </div>

              {/* Table toolbar */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
              >
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    readOnly
                    placeholder="Search resources..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-zinc-400">All Types ▾</span>
                  <span className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-zinc-400">All Status ▾</span>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Resource
                  </button>
                </div>
              </div>

              {/* Table head */}
              <div className="px-5 pt-3">
                <div className="grid grid-cols-6 gap-2 pb-2 border-b text-xs font-semibold tracking-wider uppercase text-zinc-500"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="col-span-2">Resource Name</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span className="col-span-2">Utilization</span>
                </div>
              </div>

              {/* Table rows */}
              <div className="px-5 pb-4 divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {resources.map((r, i) => (
                  <motion.div
                    key={r.name}
                    className="grid grid-cols-6 gap-2 py-3 items-center group hover:bg-white/[0.02] transition-colors rounded"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <span className="col-span-2 flex items-center gap-2 text-sm font-medium text-white">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                      <span className="truncate">{r.name}</span>
                    </span>
                    <span className="text-xs text-zinc-400">{r.type}</span>
                    <span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          color: r.color,
                          background: `${r.color}18`,
                          border: `1px solid ${r.color}30`,
                        }}
                      >
                        ● {r.status}
                      </span>
                    </span>
                    <div className="col-span-2 flex items-center justify-between">
                      <UsageBar value={r.usage} color={r.color} />
                      <span className="text-xs font-mono text-zinc-500 hidden sm:inline">{r.location}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Feature text + Dot matrix pattern */}
          <motion.div
            className="lg:col-span-5 relative space-y-6"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Decorative Dot Matrix Grid (matches reference image) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 opacity-25 pointer-events-none -z-10 hidden sm:block">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(circle, #8b5cf6 2px, transparent 2px)',
                  backgroundSize: '18px 18px',
                }}
              />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-purple-400 border border-purple-500/20 bg-purple-500/10">
              RESOURCE MANAGEMENT
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Complete visibility and control over your resources
            </h2>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Get a unified view of all your infrastructure resources across multiple cloud providers with real-time updates.
            </p>

            <ul className="space-y-3 pt-2">
              {bullets.map((b, i) => (
                <motion.li
                  key={b}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/15 text-purple-400 flex-shrink-0 border border-purple-500/30">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="text-sm font-medium text-zinc-200">{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="pt-2">
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Features
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
