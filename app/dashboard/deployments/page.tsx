'use client';

import React, { useEffect, useState } from 'react';
import { Rocket, Plus } from 'lucide-react';
import { useDeployments } from '@/hooks';
import { DeploymentStatusBadge, CreateDeploymentModal } from '@/components/deployments';
import { useAuth } from '@/hooks/useAuth';

export default function DeploymentsPage() {
  const { deployments, loading, fetchAll } = useDeployments();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const canDeploy = user?.role === 'admin' || user?.role === 'devops_engineer';

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Deployments</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            Track deployment history and pipeline status
          </p>
        </div>
        {canDeploy && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Deployment
          </button>
        )}
      </div>

      <div
        className="overflow-x-auto rounded-xl border"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr
              className="border-b font-semibold"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
            >
              <th className="p-4">Resource</th>
              <th className="p-4">Version</th>
              <th className="p-4">Commit</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--theme-text-secondary)' }}>
            {deployments.map((dep) => {
              const resourceInfo = dep.resourceId as { name: string } | null;
              return (
                <tr
                  key={dep._id}
                  className="border-b transition-colors"
                  style={{ borderColor: 'var(--theme-border-soft)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--theme-nav-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  }}
                >
                  <td className="p-4 font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                    {resourceInfo?.name || 'Unknown'}
                  </td>
                  <td className="p-4">{dep.version}</td>
                  <td className="p-4 font-mono text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    {dep.commitHash ? dep.commitHash.slice(0, 8) : '—'}
                  </td>
                  <td className="p-4">
                    <DeploymentStatusBadge status={dep.status} />
                  </td>
                  <td className="p-4" style={{ color: 'var(--theme-text-muted)' }}>
                    {new Date(dep.deployedAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && deployments.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <Rocket className="h-12 w-12 mb-4" style={{ color: 'var(--theme-border)' }} />
          <p className="text-lg font-medium">No deployments yet</p>
          <p className="text-sm">Deploy a version to see it here.</p>
        </div>
      )}

      <CreateDeploymentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchAll(); }} />
    </div>
  );
}
