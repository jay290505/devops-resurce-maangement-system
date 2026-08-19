interface ResourceStatusBadgeProps {
  status: 'healthy' | 'degraded' | 'down';
}

/**
 * Uses stronger color variants (-600 instead of -400) so badges are
 * readable on BOTH white (light mode) and near-black (dark mode) backgrounds.
 */
const statusConfig = {
  healthy: {
    label: 'Healthy',
    dot: 'bg-emerald-500',
    className: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
  },
  degraded: {
    label: 'Degraded',
    dot: 'bg-amber-500',
    className: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400',
  },
  down: {
    label: 'Down',
    dot: 'bg-red-500',
    className: 'bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400',
  },
} as const;

export default function ResourceStatusBadge({ status }: ResourceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold border ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
