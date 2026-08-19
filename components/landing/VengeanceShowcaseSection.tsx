'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Network, ShieldCheck, Sparkles } from 'lucide-react';
import { VengeInteractiveTerminal } from '@/components/ui/venge-interactive-terminal';
import { VengeNodeTopology } from '@/components/ui/venge-node-topology';
import { VengeFeatureComparison } from '@/components/ui/venge-feature-comparison';
import { GlowBorderCard } from '@/components/ui/glow-border-card';

export default function VengeanceShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'topology' | 'terminal' | 'comparison'>('topology');

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/40 border-t border-b border-purple-900/20" id="vengeance-ui">
      {/* Glow background highlights */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(59,130,246,0.15) 60%, transparent 80%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border-purple-500/20"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>Vengeance UI • Interactive Components</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Experience Next-Gen DevOps Interactions
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-zinc-400 leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Explore interactive microservices node topology, real-time command execution, and feature matrices powered by Vengeance UI.
          </motion.p>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('topology')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'topology'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <Network className="h-4 w-4" />
              Infrastructure Topology
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'terminal'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <Terminal className="h-4 w-4" />
              DevOps CLI Terminal
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'comparison'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Feature Comparison
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          <GlowBorderCard width="100%" className="p-2 sm:p-6 rounded-[24px]">
            {activeTab === 'topology' && <VengeNodeTopology />}
            {activeTab === 'terminal' && <VengeInteractiveTerminal />}
            {activeTab === 'comparison' && <VengeFeatureComparison />}
          </GlowBorderCard>
        </motion.div>
      </div>
    </section>
  );
}
