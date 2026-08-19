'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useDeploymentStore } from '@/store/deploymentStore';
import { useResourceStore } from '@/store/resourceStore';

interface CreateDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDeploymentModal({ isOpen, onClose }: CreateDeploymentModalProps) {
  const { createDeployment, loading, error, clearError } = useDeploymentStore();
  const { resources, fetchResources } = useResourceStore();

  const [resourceId, setResourceId] = useState('');
  const [version, setVersion] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [status, setStatus] = useState<'success' | 'failed' | 'rolled_back'>('success');
  const [previousVersion, setPreviousVersion] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchResources();
      clearError();
      setFormError('');
      setVersion('');
      setCommitHash('');
      setPreviousVersion('');
    }
  }, [isOpen, fetchResources, clearError]);

  useEffect(() => {
    if (resources.length > 0) {
      setResourceId(resources[0]._id);
    }
  }, [resources]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!resourceId) {
      setFormError('Please select a target resource');
      return;
    }
    if (!version.trim()) {
      setFormError('Version identifier is required');
      return;
    }

    const success = await createDeployment({
      resourceId,
      version: version.trim(),
      commitHash: commitHash.trim() || undefined,
      status,
      previousVersion: previousVersion.trim() || undefined,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl backdrop-blur-md transition-colors"
        style={{
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-bg-surface)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
          <h2 className="text-xl font-semibold">New Code Deployment</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Errors */}
        {(formError || error) && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
            {formError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Target Resource
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-input)',
                color: 'var(--theme-text-primary)',
              }}
            >
              {resources.length > 0 ? (
                resources.map((res) => (
                  <option key={res._id} value={res._id}>
                    {res.name} ({res.environment.toUpperCase()})
                  </option>
                ))
              ) : (
                <option value="">No resources available</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Version
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Deployment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'success' | 'failed' | 'rolled_back')}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="rolled_back">Rolled Back</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Commit Hash (Optional)
              </label>
              <input
                type="text"
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
                placeholder="a8f3b2c"
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Previous Version (Optional)
              </label>
              <input
                type="text"
                value={previousVersion}
                onChange={(e) => setPreviousVersion(e.target.value)}
                placeholder="v0.9.9"
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4 mt-6" style={{ borderColor: 'var(--theme-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-zinc-800/10 dark:hover:bg-zinc-850 transition-colors"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 transition duration-200 hover:bg-amber-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                'Log Deployment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
