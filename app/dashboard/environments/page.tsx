'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Archive, Loader2 } from 'lucide-react';
import { useEnvironmentStore } from '@/store/environmentStore';
import { useResourceStore } from '@/store/resourceStore';
import { useDeploymentStore } from '@/store/deploymentStore';
import { useIncidentStore } from '@/store/incidentStore';
import { useAuth } from '@/hooks/useAuth';
import CreateEnvironmentModal from '@/components/environments/CreateEnvironmentModal';

export default function EnvironmentsPage() {
  const { environments, loading, fetchEnvironments, updateEnvironment, deleteEnvironment, error } = useEnvironmentStore();
  const { resources, fetchResources } = useResourceStore();
  const { deployments, fetchDeployments } = useDeploymentStore();
  const { incidents, fetchIncidents } = useIncidentStore();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchEnvironments();
    fetchResources();
    fetchDeployments();
    fetchIncidents();
  }, [fetchEnvironments, fetchResources, fetchDeployments, fetchIncidents]);

  const isAdmin = user?.role === 'admin';

  const handleEdit = (id: string, name: string, desc: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingDesc(desc || '');
    setActionError('');
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      setActionError('Environment name is required');
      return;
    }
    const success = await updateEnvironment(editingId!, {
      name: editingName.trim().toLowerCase(),
      description: editingDesc.trim(),
    });
    if (success) {
      setEditingId(null);
    } else {
      setActionError('Failed to update environment. Make sure the name is unique.');
    }
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    await updateEnvironment(id, {
      status: currentStatus === 'active' ? 'archived' : 'active',
    });
  };

  const handleDelete = async (id: string) => {
    setActionError('');
    const success = await deleteEnvironment(id);
    if (success) {
      setConfirmDeleteId(null);
    } else {
      // Fetch store error
      const storeErr = useEnvironmentStore.getState().error;
      setActionError(storeErr || 'Failed to delete environment.');
    }
  };

  // Compute metrics for each environment (FR-3.2)
  const getEnvStats = (envName: string) => {
    const envResources = resources.filter((r) => r.environment.toLowerCase() === envName.toLowerCase());
    const envResourceIds = envResources.map((r) => r._id);

    const activeDeploymentsCount = deployments.filter((d) => {
      const rId = typeof d.resourceId === 'object' && d.resourceId !== null ? d.resourceId._id : d.resourceId;
      return envResourceIds.includes(rId);
    }).length;

    const openIncidentsCount = incidents.filter((i) => {
      const rId = typeof i.resourceId === 'object' && i.resourceId !== null ? i.resourceId._id : i.resourceId;
      return envResourceIds.includes(rId) && ['open', 'in_progress'].includes(i.status);
    }).length;

    return {
      resourcesCount: envResources.length,
      deploymentsCount: activeDeploymentsCount,
      incidentsCount: openIncidentsCount,
    };
  };

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Environments</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            Configure and monitor logical environment deployments
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Environment
          </button>
        )}
      </div>

      {/* Errors */}
      {(error || actionError) && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
          {actionError || error}
        </div>
      )}

      {/* Environments Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {environments.map((env) => {
          const stats = getEnvStats(env.name);
          const isEditing = editingId === env._id;
          const isArchived = env.status === 'archived';

          return (
            <div
              key={env._id}
              className="rounded-xl border p-5 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-card)',
                opacity: isArchived ? 0.6 : 1,
              }}
            >
              <div>
                {/* Header (Title & Status) */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/15">
                      <Layers className="h-4.5 w-4.5" />
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="rounded border px-2 py-0.5 text-sm font-semibold outline-none w-28 focus:border-amber-500"
                        style={{
                          borderColor: 'var(--theme-border)',
                          backgroundColor: 'var(--theme-bg-input)',
                        }}
                      />
                    ) : (
                      <h3 className="font-semibold text-lg capitalize">{env.name}</h3>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      isArchived
                        ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}
                  >
                    {env.status}
                  </span>
                </div>

                {/* Description */}
                {isEditing ? (
                  <textarea
                    value={editingDesc}
                    onChange={(e) => setEditingDesc(e.target.value)}
                    className="block w-full rounded border p-2 text-xs outline-none focus:border-amber-500 resize-none mt-2"
                    style={{
                      borderColor: 'var(--theme-border)',
                      backgroundColor: 'var(--theme-bg-input)',
                    }}
                  />
                ) : (
                  <p className="text-xs mb-4 min-h-[32px]" style={{ color: 'var(--theme-text-secondary)' }}>
                    {env.description || 'No description provided.'}
                  </p>
                )}

                {/* Count Metrics (FR-3.2) */}
                <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center text-xs" style={{ borderColor: 'var(--theme-border-soft)' }}>
                  <div>
                    <span style={{ color: 'var(--theme-text-muted)' }}>Resources</span>
                    <p className="text-lg font-bold mt-0.5">{stats.resourcesCount}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--theme-text-muted)' }}>Deployments</span>
                    <p className="text-lg font-bold mt-0.5">{stats.deploymentsCount}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--theme-text-muted)' }}>Open Incidents</span>
                    <p className={`text-lg font-bold mt-0.5 ${stats.incidentsCount > 0 ? 'text-red-500 font-black animate-pulse' : ''}`}>
                      {stats.incidentsCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions footer (Admin only) */}
              {isAdmin && (
                <div className="flex items-center justify-end gap-2 mt-5 border-t pt-3" style={{ borderColor: 'var(--theme-border-soft)' }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded border px-2.5 py-1 text-xs transition-colors hover:bg-zinc-800/10 dark:hover:bg-zinc-850"
                        style={{ borderColor: 'var(--theme-border)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="rounded bg-emerald-600 text-zinc-950 px-2.5 py-1 text-xs font-semibold hover:bg-emerald-500 transition-colors"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(env._id, env.name, env.description || '')}
                        className="p-1.5 rounded border hover:bg-zinc-800/10 dark:hover:bg-zinc-850 transition-colors"
                        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                        title="Edit Environment"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(env._id, env.status)}
                        className="p-1.5 rounded border hover:bg-zinc-800/10 dark:hover:bg-zinc-850 transition-colors"
                        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                        title={isArchived ? 'Activate Environment' : 'Archive Environment'}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      {confirmDeleteId === env._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-2 py-0.5 text-[10px] border"
                            style={{ borderColor: 'var(--theme-border)' }}
                          >
                            No
                          </button>
                          <button
                            onClick={() => handleDelete(env._id)}
                            className="rounded bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(env._id)}
                          className="p-1.5 rounded border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors"
                          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                          title="Delete Environment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {environments.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--theme-text-muted)' }}>
          <Layers className="h-12 w-12 mb-4" style={{ color: 'var(--theme-border)' }} />
          <p className="text-lg font-medium">No environments found</p>
          <p className="text-sm">Create your first environment namespace to get started.</p>
        </div>
      )}

      {/* Dynamic Creation Modal */}
      <CreateEnvironmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
