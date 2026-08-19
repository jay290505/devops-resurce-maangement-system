'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, CheckCircle, Clock, Loader2, Link as LinkIcon, Calendar, User } from 'lucide-react';
import { useIncidentStore } from '@/store/incidentStore';
import { useAuth } from '@/hooks/useAuth';
import { useEnvironmentStore } from '@/store/environmentStore';
import CreateIncidentModal from '@/components/incidents/CreateIncidentModal';

export default function IncidentsPage() {
  const { incidents, loading, fetchIncidents, updateIncident, error } = useIncidentStore();
  const { environments, fetchEnvironments } = useEnvironmentStore();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEnv, setFilterEnv] = useState('all');

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
    fetchEnvironments();
  }, [fetchIncidents, fetchEnvironments]);

  const canLogOrResolve = user?.role === 'admin' || user?.role === 'devops_engineer';

  const handleResolve = async (id: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    setUpdatingId(id);
    await updateIncident(id, { status: newStatus });
    setUpdatingId(null);
  };

  // Triage lists based on active filters (FR-5.4)
  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterEnv !== 'all') {
      const res = inc.resourceId as { environment?: string } | null;
      if (res?.environment?.toLowerCase() !== filterEnv.toLowerCase()) return false;
    }
    return true;
  });

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
  };

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Incidents & Alerts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            Track server warnings, degradation logs, and incident responses
          </p>
        </div>
        {canLogOrResolve && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Report Incident
          </button>
        )}
      </div>

      {/* Filter Toolbar (FR-5.4) */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-xl border p-4 shadow-sm"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
      >
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Severity
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-amber-500"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Incident Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-amber-500"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Environment
          </label>
          <select
            value={filterEnv}
            onChange={(e) => setFilterEnv(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-amber-500"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
          >
            <option value="all">All Environments</option>
            {environments.map((env) => (
              <option key={env._id} value={env.name}>
                {env.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents Table / Timeline */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr
                className="border-b font-semibold"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
              >
                <th className="p-4">Incident Details</th>
                <th className="p-4">Resource Info</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Triage Status</th>
                <th className="p-4">Trigger & Logs</th>
                <th className="p-4">Timeline / Auditing</th>
                {canLogOrResolve && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--theme-text-secondary)' }}>
              {filteredIncidents.map((inc) => {
                const res = inc.resourceId as { name: string; environment: string } | null;
                const dep = inc.deploymentId as { version: string } | null;
                const creator = inc.createdBy as { name: string } | null;
                const resolver = inc.resolvedBy as { name: string } | null;

                const isUpdating = updatingId === inc._id;

                return (
                  <tr
                    key={inc._id}
                    className="border-b transition-colors"
                    style={{ borderColor: 'var(--theme-border-soft)' }}
                  >
                    {/* Details */}
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                        {inc.title}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        {inc.description}
                      </p>
                    </td>

                    {/* Affected Resource */}
                    <td className="p-4">
                      <span className="font-semibold text-xs" style={{ color: 'var(--theme-text-primary)' }}>
                        {res?.name || 'Unknown'}
                      </span>
                      <div className="text-[10px] uppercase font-bold text-amber-500 mt-0.5">
                        {res?.environment || 'dev'}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(inc.status)}`}>
                        {inc.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Deployment linkage */}
                    <td className="p-4 text-xs">
                      {dep ? (
                        <div className="flex items-center gap-1 text-blue-500">
                          <LinkIcon className="h-3 w-3" />
                          <span>Build {dep.version}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--theme-text-muted)' }}>No code build linked</span>
                      )}
                    </td>

                    {/* Timeline Auditing */}
                    <td className="p-4 text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Opened: {new Date(inc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        <span>By: {creator?.name || 'System'}</span>
                      </div>

                      {inc.resolvedAt && (
                        <div className="border-t mt-1.5 pt-1" style={{ borderColor: 'var(--theme-border-soft)' }}>
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Resolved: {new Date(inc.resolvedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>By: {resolver?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Actions dropdown/buttons (Admin & DevOps) */}
                    {canLogOrResolve && (
                      <td className="p-4 text-right">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin inline-block" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {['open', 'in_progress'].includes(inc.status) && (
                              <>
                                {inc.status === 'open' && (
                                  <button
                                    onClick={() => handleResolve(inc._id, 'in_progress')}
                                    className="rounded border px-2 py-1 text-[10px] font-semibold hover:bg-zinc-800/10 dark:hover:bg-zinc-850"
                                    style={{ borderColor: 'var(--theme-border)' }}
                                  >
                                    Investigate
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolve(inc._id, 'resolved')}
                                  className="rounded bg-emerald-600 text-zinc-950 px-2 py-1 text-[10px] font-semibold hover:bg-emerald-500"
                                >
                                  Resolve
                                </button>
                              </>
                            )}
                            {inc.status === 'resolved' && (
                              <button
                                onClick={() => handleResolve(inc._id, 'closed')}
                                className="rounded bg-blue-600 text-white px-2 py-1 text-[10px] font-semibold hover:bg-blue-500"
                              >
                                Close Ticket
                              </button>
                            )}
                            {inc.status === 'closed' && (
                              <button
                                onClick={() => handleResolve(inc._id, 'open')}
                                className="rounded border px-2 py-1 text-[10px] font-semibold hover:bg-zinc-800/10 dark:hover:bg-zinc-850"
                                style={{ borderColor: 'var(--theme-border)' }}
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredIncidents.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--theme-text-muted)' }}>
          <AlertTriangle className="h-12 w-12 mb-4" style={{ color: 'var(--theme-border)' }} />
          <p className="text-lg font-medium">No incidents logged</p>
          <p className="text-sm">Everything looks normal. Active telemetry reports healthy indicators.</p>
        </div>
      )}

      {/* Creation Modal */}
      <CreateIncidentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
