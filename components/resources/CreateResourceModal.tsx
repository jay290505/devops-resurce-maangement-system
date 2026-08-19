'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useResourceStore } from '@/store/resourceStore';
import { useEnvironmentStore } from '@/store/environmentStore';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateResourceModal({ isOpen, onClose }: CreateResourceModalProps) {
  const { createResource, loading, error, clearError } = useResourceStore();
  const { environments, fetchEnvironments } = useEnvironmentStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<'server' | 'database' | 'service' | 'container'>('server');
  const [environment, setEnvironment] = useState('');
  const [status, setStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [cpu, setCpu] = useState('2');
  const [ram, setRam] = useState('8');
  const [region, setRegion] = useState('us-east-1');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEnvironments();
      clearError();
      setFormError('');
    }
  }, [isOpen, fetchEnvironments, clearError]);

  // Set default environment when dynamic ones load
  useEffect(() => {
    if (environments.length > 0) {
      const active = environments.filter((e) => e.status === 'active');
      if (active.length > 0) setEnvironment(active[0].name);
    } else {
      setEnvironment('dev');
    }
  }, [environments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Resource name is required');
      return;
    }

    const cpuNum = Number(cpu);
    const ramNum = Number(ram);

    if (isNaN(cpuNum) || cpuNum <= 0) {
      setFormError('CPU must be a positive number');
      return;
    }
    if (isNaN(ramNum) || ramNum <= 0) {
      setFormError('RAM must be a positive number');
      return;
    }

    const success = await createResource({
      name: name.trim(),
      type,
      environment,
      status,
      specs: {
        cpu: cpuNum,
        ram: ramNum,
        region: region.trim(),
      },
    });

    if (success) {
      setName('');
      onClose();
    }
  };

  const activeEnvs = environments.filter((e) => e.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl backdrop-blur-md transition-colors"
        style={{
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-bg-surface)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
          <h2 className="text-xl font-semibold">Add Virtual Resource</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Resource Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="vm-prod-web-01"
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
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'server' | 'database' | 'service' | 'container')}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <option value="server">Server (VM)</option>
                <option value="database">Database</option>
                <option value="container">Container (Docker/K8s)</option>
                <option value="service">Microservice</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                {activeEnvs.length > 0 ? (
                  activeEnvs.map((env) => (
                    <option key={env._id} value={env.name}>
                      {env.name.toUpperCase()}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="dev">DEV</option>
                    <option value="staging">STAGING</option>
                    <option value="prod">PROD</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'healthy' | 'degraded' | 'down')}
                className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="down">Down / Offline</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--theme-border)' }}>
            <h3 className="text-sm font-semibold mb-3">Specifications (Specs)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                  CPU Cores
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  className="block w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'var(--theme-border)',
                    backgroundColor: 'var(--theme-bg-input)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                  RAM (GB)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  className="block w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'var(--theme-border)',
                    backgroundColor: 'var(--theme-bg-input)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                  Region
                </label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="us-west-2"
                  className="block w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'var(--theme-border)',
                    backgroundColor: 'var(--theme-bg-input)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>
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
                  Creating...
                </>
              ) : (
                'Create Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
