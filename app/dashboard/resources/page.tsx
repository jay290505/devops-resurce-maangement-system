'use client';

import React, { useEffect, useState } from 'react';
import { Server, Plus } from 'lucide-react';
import { useResources } from '@/hooks';
import { ResourceCard, CreateResourceModal } from '@/components/resources';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ResourcesPage() {
  const { resources, loading, fetchAll } = useResources();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const canAddResource = user?.role === 'admin' || user?.role === 'devops_engineer';

  return (
    <div className="space-y-8 selection:bg-amber-500/30 selection:text-amber-200" style={{ color: 'var(--theme-text-primary)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
            Manage your infrastructure resources
          </p>
        </div>
        {canAddResource && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Link key={resource._id} href={`/dashboard/resources/${resource._id}`} className="block transition-transform hover:-translate-y-0.5">
            <ResourceCard resource={resource} />
          </Link>
        ))}
      </div>

      {!loading && resources.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <Server className="h-12 w-12 mb-4" style={{ color: 'var(--theme-border)' }} />
          <p className="text-lg font-medium">No resources found</p>
          <p className="text-sm">Create your first resource to get started.</p>
        </div>
      )}

      <CreateResourceModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchAll(); }} />
    </div>
  );
}
