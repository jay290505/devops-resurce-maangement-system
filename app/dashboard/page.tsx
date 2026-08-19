'use client';

import React, { useEffect, useState } from 'react';
import { useResourceStore } from '@/store/resourceStore';
import { useDeploymentStore } from '@/store/deploymentStore';
import { 
  Server, 
  Rocket, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  History
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useTheme } from '@/components/providers';

// Mock telemetry loading charts representing historical resource metrics
const telemetryData = [
  { time: '10:00 AM', CPU: 34, RAM: 42 },
  { time: '11:00 AM', CPU: 45, RAM: 44 },
  { time: '12:00 PM', CPU: 68, RAM: 56 },
  { time: '01:00 PM', CPU: 72, RAM: 60 },
  { time: '02:00 PM', CPU: 58, RAM: 54 },
  { time: '03:00 PM', CPU: 42, RAM: 48 },
  { time: '04:00 PM', CPU: 38, RAM: 46 },
];

import { useIncidentStore } from '@/store/incidentStore';

export default function DashboardPage() {
  const { resources, fetchResources, loading: resourcesLoading } = useResourceStore();
  const { deployments, fetchDeployments, loading: deploymentsLoading } = useDeploymentStore();
  const { incidents, fetchIncidents, loading: incidentsLoading } = useIncidentStore();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Load store states on mount
  useEffect(() => {
    fetchResources();
    fetchDeployments();
    fetchIncidents();
    setMounted(true);
  }, [fetchResources, fetchDeployments, fetchIncidents]);

  // Safe mount guard for Recharts SSR compilation compatibility
  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
        Loading system telemetry...
      </div>
    );
  }

  // Calculate telemetry counts
  const totalResources = resources.length;
  const healthyCount = resources.filter(r => r.status === 'healthy').length;
  const degradedCount = resources.filter(r => r.status === 'degraded').length;
  const downCount = resources.filter(r => r.status === 'down').length;

  const totalDeployments = deployments.length;
  const successDeployments = deployments.filter(d => d.status === 'success').length;
  const failedDeployments = deployments.filter(d => d.status === 'failed').length;
  const rolledBackDeployments = deployments.filter(d => d.status === 'rolled_back').length;

  // Calculate spec footprints
  const totalCpus = resources.reduce((acc, curr) => acc + (curr.specs?.cpu || 0), 0);
  const totalRam = resources.reduce((acc, curr) => acc + (curr.specs?.ram || 0), 0);

  // Deployments status counts for BarChart
  const deploymentChartData = [
    { name: 'Success', count: successDeployments, color: '#10b981' },
    { name: 'Failed', count: failedDeployments, color: '#ef4444' },
    { name: 'Rolled Back', count: rolledBackDeployments, color: '#f59e0b' },
  ];

  // Chart tooltip style based on theme
  const tooltipStyle = isDark
    ? { backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' };

  const chartGrid = isDark ? '#1f1f2e' : '#e2e8f0';
  const chartAxis = isDark ? '#52525b' : '#94a3b8';

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">System Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
          Real-time health indicators and telemetry statistics
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Resources */}
        <div
          className="rounded-xl border p-5 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Total Resources
            </span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500 border border-blue-500/15">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">{resourcesLoading ? '...' : totalResources}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
              <span className="text-emerald-500 font-medium">{healthyCount} Healthy</span> · {degradedCount + downCount} Issues
            </p>
          </div>
        </div>

        {/* Card 2: Deployments */}
        <div
          className="rounded-xl border p-5 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Deployments
            </span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500 border border-purple-500/15">
              <Rocket className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">{deploymentsLoading ? '...' : totalDeployments}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
              <span className="text-emerald-500 font-medium">{successDeployments} Success</span> · {failedDeployments} Failures
            </p>
          </div>
        </div>

        {/* Card 3: Specs Allocated */}
        <div
          className="rounded-xl border p-5 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Allocated Footprint
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500 border border-amber-500/15">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">
              {resourcesLoading ? '...' : `${totalCpus} Cores`}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
              <span style={{ color: 'var(--theme-text-secondary)' }}>{totalRam} GB RAM</span> total allocation
            </p>
          </div>
        </div>

        {/* Card 4: Incidents */}
        {(() => {
          const activeIncidents = incidents.filter(i => ['open', 'in_progress'].includes(i.status));
          const criticalCount = activeIncidents.filter(i => i.severity === 'critical').length;
          const warningCount = activeIncidents.length - criticalCount;
          const hasIncidents = activeIncidents.length > 0;

          return (
            <div
              className="rounded-xl border p-5 shadow-sm"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                  Active Incidents
                </span>
                <div className={`rounded-lg p-2 border ${hasIncidents ? 'bg-red-500/10 text-red-500 border-red-500/15' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className={`text-2xl font-bold tracking-tight ${hasIncidents ? 'text-red-500' : 'text-emerald-500'}`}>
                  {incidentsLoading ? '...' : activeIncidents.length}
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                  {criticalCount} critical outage · {warningCount} warnings
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Load Telemetry Chart */}
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--theme-text-muted)' }}>
            Resource load trends
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="time" stroke={chartAxis} fontSize={11} />
                <YAxis stroke={chartAxis} fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="CPU" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU Load (%)" />
                <Area type="monotone" dataKey="RAM" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" name="RAM Usage (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deployments Status Bar Chart */}
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--theme-text-muted)' }}>
            Deployments run summary
          </h3>
          <div className="h-72 w-full">
            {totalDeployments === 0 ? (
              <div
                className="flex h-full items-center justify-center border border-dashed rounded-lg text-sm"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
              >
                No deployment records logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deploymentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="name" stroke={chartAxis} fontSize={11} />
                  <YAxis stroke={chartAxis} fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Runs count">
                    {deploymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div
        className="rounded-xl border p-6 shadow-sm"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Recent Pipeline Actions
          </h3>
        </div>
        <div className="overflow-x-auto">
          {deployments.length === 0 ? (
            <div
              className="flex h-24 items-center justify-center border border-dashed rounded-lg text-sm"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
            >
              No recent pipeline activity found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b font-semibold" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                  <th className="pb-3 pr-4">Environment</th>
                  <th className="pb-3 pr-4">Resource</th>
                  <th className="pb-3 pr-4">Version</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Deployed At</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--theme-text-secondary)' }}>
                {deployments.slice(0, 5).map((dep) => {
                  const resourceInfo = dep.resourceId as { name: string; environment: string } | null;
                  return (
                    <tr key={dep._id} className="border-b" style={{ borderColor: 'var(--theme-border-soft)' }}>
                      <td className="py-3.5 pr-4 capitalize">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold border ${
                          resourceInfo?.environment === 'prod' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                          resourceInfo?.environment === 'staging' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {resourceInfo?.environment || 'dev'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                        {resourceInfo?.name || 'Unknown Resource'}
                      </td>
                      <td className="py-3.5 pr-4 font-mono">{dep.version}</td>
                      <td className="py-3.5 pr-4">
                        <span className="flex items-center gap-1.5">
                          {dep.status === 'success' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="text-emerald-500">Success</span>
                            </>
                          ) : dep.status === 'failed' ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">Failed</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-amber-500">Rolled Back</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5" style={{ color: 'var(--theme-text-muted)' }}>
                        {new Date(dep.deployedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
