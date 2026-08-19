import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface DeploymentStatusBadgeProps {
  status: 'success' | 'failed' | 'rolled_back';
}

/**
 * Uses stronger color variants so text is readable on both
 * white (light mode) and near-black (dark mode) backgrounds.
 */
const statusConfig = {
  success: {
    icon: CheckCircle2,
    text: 'Success',
    className: 'text-emerald-700 dark:text-emerald-400',
    iconClass: 'text-emerald-600 dark:text-emerald-500',
  },
  failed: {
    icon: XCircle,
    text: 'Failed',
    className: 'text-red-700 dark:text-red-400',
    iconClass: 'text-red-600 dark:text-red-500',
  },
  rolled_back: {
    icon: AlertTriangle,
    text: 'Rolled Back',
    className: 'text-amber-700 dark:text-amber-400',
    iconClass: 'text-amber-600 dark:text-amber-500',
  },
} as const;

export default function DeploymentStatusBadge({ status }: DeploymentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className="flex items-center gap-1.5">
      <Icon className={`h-4 w-4 ${config.iconClass}`} />
      <span className={`font-medium ${config.className}`}>{config.text}</span>
    </span>
  );
}
