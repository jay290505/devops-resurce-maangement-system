'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useIncidentStore } from '@/store/incidentStore';
import { useResourceStore } from '@/store/resourceStore';
import { useDeploymentStore } from '@/store/deploymentStore';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateIncidentModal({ isOpen, onClose }: CreateIncidentModalProps) {
  const { createIncident, loading, error, clearError } = useIncidentStore();
  const { resources, fetchResources } = useResourceStore();
  const { deployments, fetchDeployments } = useDeploymentStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [resourceId, setResourceId] = useState('');
  const [deploymentId, setDeploymentId] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchResources();
      fetchDeployments();
      clearError();
      setFormError('');
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setDeploymentId('');
    }
  }, [isOpen, fetchResources, fetchDeployments, clearError]);

  useEffect(() => {
    if (resources.length > 0) {
      setResourceId(resources[0]._id);
    }
  }, [resources]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Incident title is required');
      return;
    }
    if (!description.trim()) {
      setFormError('Incident description is required');
      return;
    }
    if (!resourceId) {
      setFormError('Please select an affected resource');
      return;
    }

    const success = await createIncident({
      title: title.trim(),
      description: description.trim(),
      severity,
      resourceId,
      deploymentId: deploymentId || undefined,
    });

    if (success) {
      onClose();
    }
  };

  // Filter deployments that belong to the selected resource
  const filteredDeployments = deployments.filter((d) => {
    const rId = typeof d.resourceId === 'object' && d.resourceId !== null ? d.resourceId._id : d.resourceId;
    return rId === resourceId;
  });

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
          <h2 className="text-xl font-semibold">Log System Incident</h2>
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
              Incident Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., API server heap memory leak"
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
              Description / Logs
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide trace logs, errors, or descriptive steps..."
              className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500 resize-none"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-input)',
                color: 'var(--theme-text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <option value="low">Low (Minor anomaly)</option>
                <option value="medium">Medium (Degraded latency)</option>
                <option value="high">High (Loss of replication)</option>
                <option value="critical">Critical (System Outage)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Affected Resource
              </label>
              <select
                value={resourceId}
                onChange={(e) => {
                  setResourceId(e.target.value);
                  setDeploymentId(''); // Reset linked deployment on resource change
                }}
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
                      {res.name}
                    </option>
                  ))
                ) : (
                  <option value="">No resources available</option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Linked Deployment Run (Optional)
            </label>
            <select
              value={deploymentId}
              onChange={(e) => setDeploymentId(e.target.value)}
              className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-input)',
                color: 'var(--theme-text-primary)',
              }}
            >
              <option value="">None / Unknown</option>
              {filteredDeployments.map((dep) => (
                <option key={dep._id} value={dep._id}>
                  {dep.version} ({dep.status.replace('_', ' ')}) - {new Date(dep.deployedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
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
                'Log Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
