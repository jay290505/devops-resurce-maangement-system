'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Play, Shield, RefreshCw, Cpu, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandTab {
  id: string;
  label: string;
  command: string;
  output: string[];
}

export function VengeInteractiveTerminal() {
  const [activeTab, setActiveTab] = useState('cli');
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  const tabs: CommandTab[] = [
    {
      id: 'cli',
      label: 'DevOps CLI',
      command: 'devops-cli deploy --env=production --cluster=us-east-aws-01',
      output: [
        '✔ Authenticated session via OAuth2 key pair',
        '⚡ Initializing blue-green deployment sequence...',
        '📦 Container image v2.14.0 fetched from registry.private.io',
        '🔄 Applying rolling update strategy (0 downtime)',
        '🟢 8/8 pod replicas healthy in 1.42s',
        '✨ Deployment SUCCESS: Route live at https://app.devops-platform.io'
      ]
    },
    {
      id: 'k8s',
      label: 'Kubernetes Cluster',
      command: 'kubectl get pods -n infrastructure -o wide',
      output: [
        'NAME                         READY   STATUS    RESTARTS   AGE    IP',
        'ingress-waf-78d495-x92f      1/1     Running   0          14d    10.244.0.12',
        'api-gateway-554bc8-l2k4      1/1     Running   0          4d     10.244.1.88',
        'mongodb-cluster-replica-0    1/1     Running   0          30d    10.244.2.45',
        'redis-cache-master-98q1      1/1     Running   0          18d    10.244.2.99',
        'telemetry-agent-v2-4k9l      1/1     Running   0          2d     10.244.3.15'
      ]
    },
    {
      id: 'docker',
      label: 'Docker Compose',
      command: 'docker compose up -d --build --scale worker=4',
      output: [
        '[+] Building 4/4',
        ' ✔ Container devops-db          Started                                    0.4s',
        ' ✔ Container devops-redis       Started                                    0.3s',
        ' ✔ Container devops-backend     Started                                    0.8s',
        ' ✔ Container devops-worker-1..4 Scaled                                     0.2s',
        '🚀 Microservices stack running on localhost:3000 & 8080'
      ]
    },
    {
      id: 'telemetry',
      label: 'Telemetry Stream',
      command: 'telemetry-stream --follow --service=ingress-gateway',
      output: [
        '[LOG 10:45:01.002] INFO  [Ingress]: Request GET /api/v1/resources 200 OK (3.2ms)',
        '[LOG 10:45:01.450] INFO  [Auth]: JWT session verified for user: admin@org.io',
        '[LOG 10:45:02.110] WARN  [NodeMonitor]: Heap memory at 64% - garbage collector active',
        '[LOG 10:45:02.890] INFO  [WAF]: Rate limiter: 1,420 req/sec within nominal threshold',
        '[LOG 10:45:03.512] SUCCESS [HealthCheck]: All 12 node probes responding 200 OK'
      ]
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  useEffect(() => {
    setIsExecuting(true);
    setDisplayedLogs([]);
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < currentTab.output.length) {
        const lineToAppend = currentTab.output[currentLine];
        setDisplayedLogs(prev => [...prev, lineToAppend]);
        currentLine++;
      } else {
        setIsExecuting(false);
        clearInterval(interval);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl"
         style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}>
      {/* Terminal Topbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-900 dark:bg-zinc-950 text-white"
           style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-300">
            vengeance-ui-terminal ~ bash
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Copy command"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-1 border-b px-3 py-2 bg-slate-100/80 dark:bg-zinc-900/80 overflow-x-auto"
           style={{ borderColor: 'var(--theme-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            )}
          >
            {tab.id === 'cli' && <Terminal className="h-3.5 w-3.5" />}
            {tab.id === 'k8s' && <Cpu className="h-3.5 w-3.5" />}
            {tab.id === 'docker' && <Server className="h-3.5 w-3.5" />}
            {tab.id === 'telemetry' && <Shield className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Command prompt & Output window */}
      <div className="p-5 font-mono text-xs sm:text-sm min-h-[260px] max-h-[360px] overflow-y-auto bg-slate-950 text-slate-100 dark:bg-black dark:text-zinc-100">
        {/* Command line */}
        <div className="flex items-center gap-2 text-amber-400 pb-3 border-b border-zinc-800/80 mb-3">
          <span className="text-emerald-400 font-bold">$</span>
          <span className="text-zinc-100 font-medium">{currentTab.command}</span>
          {isExecuting && (
            <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin ml-auto" />
          )}
        </div>

        {/* Streamed Output lines */}
        <div className="space-y-1.5">
          {displayedLogs.map((log, index) => {
            const isSuccess = log.includes('SUCCESS') || log.includes('✔') || log.includes('Running') || log.includes('Started') || log.includes('200 OK');
            const isWarn = log.includes('WARN') || log.includes('Heap') || log.includes('Scaling');
            const isInfo = log.includes('INFO') || log.includes('⚡') || log.includes('📦');

            return (
              <div
                key={index}
                className={cn(
                  "leading-relaxed transition-all duration-200 flex items-start gap-2",
                  isSuccess ? "text-emerald-400 font-semibold" :
                  isWarn ? "text-amber-400" :
                  isInfo ? "text-cyan-400" :
                  "text-slate-300 dark:text-zinc-300"
                )}
              >
                <span className="text-zinc-600 select-none text-[11px] font-mono">[{index + 1}]</span>
                <span>{log}</span>
              </div>
            );
          })}
          
          {/* Active blinking cursor */}
          <div className="inline-flex items-center gap-1 text-amber-400 pt-1">
            <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Terminal Footer status */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono border-t bg-slate-900 dark:bg-zinc-950 text-zinc-400"
           style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status: Connected to cluster-us-east</span>
        </div>
        <div>
          <span>Lat: 1.2ms</span>
        </div>
      </div>
    </div>
  );
}

export default VengeInteractiveTerminal;
