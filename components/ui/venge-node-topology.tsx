'use client';

import React, { useState } from 'react';
import { Server, Database, Shield, Cpu, Activity, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeItem {
  id: string;
  title: string;
  role: string;
  status: 'healthy' | 'warning' | 'deploying';
  cpu: string;
  ram: string;
  latency: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function VengeNodeTopology() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');

  const nodes: NodeItem[] = [
    {
      id: 'node-1',
      title: 'api-gateway-v2',
      role: 'Ingress Controller & Rate Limiter',
      status: 'healthy',
      cpu: '18%',
      ram: '2.4 GB / 8.0 GB',
      latency: '2.8ms',
      icon: Zap,
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'node-2',
      title: 'k8s-pod-cluster',
      role: 'Microservices Fleet (12 Replicas)',
      status: 'healthy',
      cpu: '42%',
      ram: '14.2 GB / 32.0 GB',
      latency: '6.4ms',
      icon: Cpu,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'node-3',
      title: 'mongodb-primary',
      role: 'Database Replica Set',
      status: 'healthy',
      cpu: '24%',
      ram: '18.6 GB / 64.0 GB',
      latency: '1.2ms',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'node-4',
      title: 'waf-firewall-guard',
      role: 'Security & DDOS Prevention',
      status: 'healthy',
      cpu: '11%',
      ram: '1.8 GB / 4.0 GB',
      latency: '0.9ms',
      icon: Shield,
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="w-full rounded-2xl border p-6 sm:p-8 transition-all duration-300 backdrop-blur-xl shadow-xl"
         style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b"
           style={{ borderColor: 'var(--theme-border)' }}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Live Cloud Infrastructure Topology
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
            Real-Time Node Architecture
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-card)' }}>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Cluster Active
          </span>
        </div>
      </div>

      {/* Interactive Node Map & Details */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Node Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={cn(
                  "cursor-pointer p-5 rounded-xl border transition-all duration-300 relative group overflow-hidden",
                  isSelected
                    ? "border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.2)] bg-amber-500/5"
                    : "hover:border-amber-500/40"
                )}
                style={{
                  borderColor: isSelected ? undefined : 'var(--theme-border)',
                  backgroundColor: isSelected ? undefined : 'var(--theme-bg-card)',
                }}
              >
                {/* Glowing subtle edge indicator */}
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full bg-gradient-to-b",
                  node.color
                )} />

                <div className="flex items-start justify-between">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-md",
                    node.color
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Healthy
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-sm tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
                    {node.title}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    {node.role}
                  </p>
                </div>

                {/* Node mini stats */}
                <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-[11px] font-mono"
                     style={{ borderColor: 'var(--theme-border)' }}>
                  <div>
                    <span style={{ color: 'var(--theme-text-muted)' }}>CPU: </span>
                    <span className="font-bold text-amber-500">{node.cpu}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--theme-text-muted)' }}>Latency: </span>
                    <span className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>{node.latency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Deep Inspection Panel */}
        <div className="lg:col-span-5 rounded-xl border p-6 flex flex-col justify-between h-full"
             style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b"
                 style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-amber-500" />
                <h4 className="font-bold text-base" style={{ color: 'var(--theme-text-primary)' }}>
                  {selectedNode.title}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-500">
                ACTIVE INSPECTOR
              </span>
            </div>

            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              {selectedNode.role}. Auto-scaled across active availability zones with zero single-point-of-failure redundancy.
            </p>

            {/* Metrics Breakdown */}
            <div className="mt-6 space-y-4">
              {/* CPU Meter */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>CPU Core Utilization</span>
                  <span className="font-bold text-amber-500">{selectedNode.cpu}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: selectedNode.cpu }}
                  />
                </div>
              </div>

              {/* Memory Meter */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>RAM Allocation</span>
                  <span className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>{selectedNode.ram}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[45%]" />
                </div>
              </div>

              {/* Network Latency */}
              <div className="p-3 rounded-lg border text-xs font-mono flex items-center justify-between"
                   style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}>
                <span style={{ color: 'var(--theme-text-secondary)' }}>Response Latency</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> {selectedNode.latency}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono"
               style={{ borderColor: 'var(--theme-border)' }}>
            <span style={{ color: 'var(--theme-text-muted)' }}>Probes: 100% Passing</span>
            <span className="text-amber-500 font-semibold flex items-center gap-1">
              Live Sync <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default VengeNodeTopology;
