'use client';

import React, { useState } from 'react';
import { Check, X, ShieldAlert, Zap, Layers, RefreshCw, Lock, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VengeFeatureComparison() {
  const [activeTab, setActiveTab] = useState<'platform' | 'legacy'>('platform');

  const comparisons = [
    {
      feature: 'Deployment Speeds',
      platform: 'Automated 1-click blue/green rollouts in under 3 seconds',
      legacy: 'Manual SSH scripting with high risk of human error (20+ mins)',
      icon: Zap,
    },
    {
      feature: 'Resource & Spec Monitoring',
      platform: 'Real-time CPU/RAM telemetry & replica set management',
      legacy: 'Static spreadsheets & outdated server inventory documents',
      icon: Layers,
    },
    {
      feature: 'Role-Based Access (RBAC)',
      platform: 'Strict Admin / DevOps / Viewer policy enforcement',
      legacy: 'Shared root credentials stored in unencrypted text files',
      icon: Lock,
    },
    {
      feature: 'Audit Log & History',
      platform: 'Immutable MongoDB transaction audit trail for every action',
      legacy: 'Fragmented syslog files across disparate virtual machines',
      icon: Terminal,
    },
    {
      feature: 'Incident Response & Recovery',
      platform: 'Instant state rollbacks with automated health probes',
      legacy: 'Delayed manual triage & midnight emergency hotfixes',
      icon: RefreshCw,
    },
  ];

  return (
    <div className="w-full max-w-5xl rounded-3xl border p-6 sm:p-10 transition-all duration-300 backdrop-blur-xl shadow-2xl"
         style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <ShieldAlert className="h-3.5 w-3.5" /> VENGEANCE UI ARCHITECTURE MATRIX
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
          Why Switch To Vengeance UI Platform?
        </h2>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          Compare modern cloud-native resource management against outdated legacy server workflows.
        </p>
      </div>

      {/* Switch Toggle */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl border"
             style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          <button
            onClick={() => setActiveTab('platform')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2",
              activeTab === 'platform'
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            )}
          >
            <Zap className="h-4 w-4" /> Vengeance UI Platform
          </button>
          <button
            onClick={() => setActiveTab('legacy')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2",
              activeTab === 'legacy'
                ? "bg-slate-800 text-white dark:bg-zinc-800 font-bold shadow-lg"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            )}
          >
            <X className="h-4 w-4" /> Traditional Manual Setup
          </button>
        </div>
      </div>

      {/* Feature Items Rows */}
      <div className="mt-8 space-y-4">
        {comparisons.map((item, idx) => {
          const Icon = item.icon;
          const isPlatform = activeTab === 'platform';

          return (
            <div
              key={idx}
              className={cn(
                "p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                isPlatform
                  ? "border-amber-500/30 bg-amber-500/[0.03]"
                  : "border-rose-500/20 bg-rose-500/[0.02]"
              )}
              style={{
                borderColor: isPlatform ? undefined : 'var(--theme-border)',
                backgroundColor: isPlatform ? undefined : 'var(--theme-bg-card)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-center shrink-0",
                  isPlatform
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
                    {item.feature}
                  </h4>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                    {isPlatform ? item.platform : item.legacy}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 font-mono text-xs font-bold px-3 py-1.5 rounded-lg self-end sm:self-center"
                   style={{
                     backgroundColor: isPlatform ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)',
                     color: isPlatform ? '#f59e0b' : '#f43f5e',
                   }}>
                {isPlatform ? (
                  <>
                    <Check className="h-4 w-4" /> OPTIMIZED
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" /> HIGH RISK
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VengeFeatureComparison;
