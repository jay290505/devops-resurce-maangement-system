'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Server, Database, Container, Terminal, ArrowLeft, Trash2, Cpu, Database as RamIcon, Globe, User, Edit, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Rocket, History, AlertCircle, Loader2 } from 'lucide-react';
import { useResourceStore } from '@/store/resourceStore';
import { useDeploymentStore } from '@/store/deploymentStore';
import { useIncidentStore } from '@/store/incidentStore';
import { useAuth } from '@/hooks/useAuth';
import { ResourceStatusBadge } from '@/components/resources';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '@/components/providers';

const typeIcons = {
  server: Server,
  database: Database,
  container: Container,
  service: Terminal,
} as const;

// Helper to generate simulated metrics graph
const generateTelemetry = (status: string) => {
  const baseCpu = status === 'down' ? 0 : status === 'degraded' ? 82 : 45;
  const variance = status === 'down' ? 0 : 15;
  return Array.from({ length: 12 }, (_, i) => {
    const time = `${i + 8}:00 AM`;
    const cpu = status === 'down' ? 0 : Math.min(100, Math.max(5, baseCpu + Math.floor(Math.random() * variance * 2 - variance)));
    const ram = status === 'down' ? 0 : Math.min(100, Math.max(10, 60 + Math.floor(Math.random() * 10 - 5)));
    return { time, CPU: cpu, RAM: ram };
  });
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentResource, fetchResourceById, updateResource, deleteResource, loading, error } = useResourceStore();
  const { deployments, fetchDeployments } = useDeploymentStore();
  const { incidents, fetchIncidents } = useIncidentStore();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [simulatedMetrics, setSimulatedMetrics] = useState<Array<{ time: string; CPU: number; RAM: number }>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [editCpu, setEditCpu] = useState('2');
  const [editRam, setEditRam] = useState('8');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResourceById(id);
      fetchDeployments();
      fetchIncidents();
    }
  }, [id, fetchResourceById, fetchDeployments, fetchIncidents]);

  // Load telemetry metrics when resource loads
  useEffect(() => {
    if (currentResource) {
      setSimulatedMetrics(generateTelemetry(currentResource.status));
      setEditName(currentResource.name);
      setEditStatus(currentResource.status);
      setEditCpu(String(currentResource.specs.cpu));
      setEditRam(String(currentResource.specs.ram));
    }
  }, [currentResource]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !currentResource) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500" />
        <h2 className="text-xl font-bold">Resource Not Found</h2>
        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          {error || 'The requested resource ID is invalid or does not exist.'}
        </p>
        <button
          onClick={() => router.push('/dashboard/resources')}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-800/10 dark:hover:bg-zinc-850"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Resources
        </button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isDevOpsOrAdmin = user?.role === 'admin' || user?.role === 'devops_engineer';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateResource(id, {
      name: editName,
      status: editStatus,
      specs: {
        cpu: Number(editCpu),
        ram: Number(editRam),
        region: currentResource.specs.region,
      },
    });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/resources/${id}/release`, {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/dashboard/resources');
      }
    } catch (err) {
      console.error('Deprovision error:', err);
    }
  };

  // Filter linked deployments (FR-2.3)
  const linkedDeployments = deployments.filter((d) => {
    const rId = typeof d.resourceId === 'object' && d.resourceId !== null ? d.resourceId._id : d.resourceId;
    return rId === id;
  });

  // Filter linked incidents (FR-1.5)
  const linkedIncidents = incidents.filter((i) => {
    const rId = typeof i.resourceId === 'object' && i.resourceId !== null ? i.resourceId._id : i.resourceId;
    return rId === id;
  });

  const Icon = typeIcons[currentResource.type] || Server;
  const ownerInfo = currentResource.owner as { name: string; email: string } | null;

  // Chart styling
  const tooltipStyle = isDark
    ? { backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' };
  const chartGrid = isDark ? '#1f1f2e' : '#e2e8f0';
  const chartAxis = isDark ? '#52525b' : '#94a3b8';

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/resources')}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Resources
      </button>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/25">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight">{currentResource.name}</h1>
              <ResourceStatusBadge status={currentResource.status} />
            </div>
            <p className="text-sm mt-1 capitalize" style={{ color: 'var(--theme-text-muted)' }}>
              Type: {currentResource.type} · Namespace: <span className="font-bold text-amber-500 uppercase">{currentResource.environment}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isDevOpsOrAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-800/10 dark:hover:bg-zinc-850 transition-colors"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <Edit className="h-4 w-4" />
              Configure
            </button>
          )}

          {isAdmin && (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
                >
                  Confirm Release
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Release Resource
              </button>
            )
          )}
        </div>
      </div>

      {/* Configuration Form (if active) */}
      {isEditing && (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border p-6 space-y-4"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <h3 className="font-semibold text-lg">Update Specifications</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Resource Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                CPU Cores
              </label>
              <input
                type="number"
                required
                min="1"
                value={editCpu}
                onChange={(e) => setEditCpu(e.target.value)}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                RAM (GB)
              </label>
              <input
                type="number"
                required
                min="1"
                value={editRam}
                onChange={(e) => setEditRam(e.target.value)}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Current Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'healthy' | 'degraded' | 'down')}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
              >
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="down">Offline / Down</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-800/10 dark:hover:bg-zinc-850"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 text-zinc-950 px-4 py-2 text-sm font-semibold hover:bg-amber-500"
            >
              Apply Changes
            </button>
          </div>
        </form>
      )}

      {/* Dashboard Specs Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            <span>CPU ALLOCATION</span>
            <Cpu className="h-4 w-4 text-blue-500" />
          </div>
          <h4 className="text-2xl font-bold mt-2">{currentResource.specs.cpu} Cores</h4>
          <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Virtual processing threads</p>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            <span>MEMORY SIZE</span>
            <RamIcon className="h-4 w-4 text-purple-500" />
          </div>
          <h4 className="text-2xl font-bold mt-2">{currentResource.specs.ram} GB RAM</h4>
          <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Dynamic swap heap allocated</p>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            <span>AWS / CLOUD REGION</span>
            <Globe className="h-4 w-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-bold mt-2 capitalize">{currentResource.specs.region}</h4>
          <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>Deploy target datacenter location</p>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            <span>RESOURCE OWNER</span>
            <User className="h-4 w-4 text-emerald-500" />
          </div>
          <h4 className="text-lg font-bold mt-2 truncate">{ownerInfo?.name || 'System Auto'}</h4>
          <p className="text-[10px] truncate" style={{ color: 'var(--theme-text-muted)' }}>{ownerInfo?.email || 'devops@internal.net'}</p>
        </div>
      </div>

      {/* Metrics Trend Line (FR-4.3) */}
      <div
        className="rounded-xl border p-6 shadow-sm"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--theme-text-muted)' }}>
          Resource load trends (Real-time telemetry indicators)
        </h3>
        {simulatedMetrics.length > 0 && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        )}
      </div>

      {/* Deployments & Incidents lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Linked Deployments history timeline (FR-2.3) */}
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-4.5 w-4.5 text-amber-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Deployment pipeline logs</h3>
          </div>
          <div className="space-y-4">
            {linkedDeployments.slice(0, 5).map((dep) => (
              <div
                key={dep._id}
                className="flex items-start justify-between border-b pb-3 text-sm last:border-b-0 last:pb-0"
                style={{ borderColor: 'var(--theme-border-soft)' }}
              >
                <div>
                  <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    Version {dep.version}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Commit: <span className="font-mono">{dep.commitHash?.slice(0, 8) || '—'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    dep.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    dep.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {dep.status.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    {new Date(dep.deployedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {linkedDeployments.length === 0 && (
              <div className="text-center py-10" style={{ color: 'var(--theme-text-muted)' }}>
                <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No deployments registered yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Linked Incidents list (FR-1.5) */}
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Active Resource Incidents</h3>
          </div>
          <div className="space-y-4">
            {linkedIncidents.map((inc) => (
              <div
                key={inc._id}
                className="flex items-start justify-between border-b pb-3 text-sm last:border-b-0 last:pb-0"
                style={{ borderColor: 'var(--theme-border-soft)' }}
              >
                <div>
                  <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    {inc.title}
                  </p>
                  <p className="text-xs truncate max-w-[200px] sm:max-w-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    {inc.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    ['resolved', 'closed'].includes(inc.status)
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {inc.status}
                  </span>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    {new Date(inc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {linkedIncidents.length === 0 && (
              <div className="text-center py-10" style={{ color: 'var(--theme-text-muted)' }}>
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-40" />
                <p className="text-xs font-semibold text-emerald-500">Zero active incidents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
