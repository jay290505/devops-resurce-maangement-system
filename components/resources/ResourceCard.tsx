import { Server, Database, Container, Terminal } from 'lucide-react';
import ResourceStatusBadge from './ResourceStatusBadge';
import type { Resource } from '@/types';

const typeIcons = {
  server: Server,
  database: Database,
  container: Container,
  service: Terminal,
} as const;

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || Server;

  return (
    <div
      className="rounded-xl border p-5 shadow-sm transition-colors duration-200"
      style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 border border-blue-500/20">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3
              className="font-semibold"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {resource.name}
            </h3>
            <p
              className="text-xs capitalize"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {resource.type}
            </p>
          </div>
        </div>
        <ResourceStatusBadge status={resource.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: 'var(--theme-bg-elevated)', border: '1px solid var(--theme-border)' }}
        >
          <span style={{ color: 'var(--theme-text-muted)' }}>CPU</span>
          <p className="font-semibold mt-0.5" style={{ color: 'var(--theme-text-primary)' }}>
            {resource.specs.cpu} cores
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: 'var(--theme-bg-elevated)', border: '1px solid var(--theme-border)' }}
        >
          <span style={{ color: 'var(--theme-text-muted)' }}>RAM</span>
          <p className="font-semibold mt-0.5" style={{ color: 'var(--theme-text-primary)' }}>
            {resource.specs.ram} GB
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: 'var(--theme-bg-elevated)', border: '1px solid var(--theme-border)' }}
        >
          <span style={{ color: 'var(--theme-text-muted)' }}>Region</span>
          <p className="font-semibold mt-0.5" style={{ color: 'var(--theme-text-primary)' }}>
            {resource.specs.region}
          </p>
        </div>
      </div>
    </div>
  );
}
