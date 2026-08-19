'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useEnvironmentStore } from '@/store/environmentStore';

interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEnvironmentModal({ isOpen, onClose }: CreateEnvironmentModalProps) {
  const { createEnvironment, loading, error, clearError } = useEnvironmentStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      clearError();
      setFormError('');
      setName('');
      setDescription('');
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Environment name is required');
      return;
    }

    const success = await createEnvironment({
      name: name.trim().toLowerCase(), // normalize to lowercase (e.g., prod, dev)
      description: description.trim() || undefined,
      status: 'active',
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
          <h2 className="text-xl font-semibold">New DevOps Environment</h2>
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
              Environment Key / Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., preprod or devops-test"
              className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-input)',
                color: 'var(--theme-text-primary)',
              }}
            />
            <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
              Avoid spaces or special characters. E.g. 'preprod' instead of 'Pre Prod'.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add scope details or tags (e.g., AWS EKS namespace targets)..."
              className="block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-500 resize-none"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-input)',
                color: 'var(--theme-text-primary)',
              }}
            />
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
                'Create Environment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
