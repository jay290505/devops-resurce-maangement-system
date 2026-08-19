export const APP_NAME = 'DevOps Resource Management Platform';
export const APP_DESCRIPTION = 'Manage server specs, log deployments, and handle role-based permissions in a single DevOps console.';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DASHBOARD_RESOURCES: '/dashboard/resources',
  DASHBOARD_DEPLOYMENTS: '/dashboard/deployments',
} as const;

export const RESOURCE_TYPES = ['server', 'database', 'service', 'container'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const ENVIRONMENTS = ['dev', 'staging', 'prod'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const RESOURCE_STATUSES = ['healthy', 'degraded', 'down'] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export const DEPLOYMENT_STATUSES = ['success', 'failed', 'rolled_back'] as const;
export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const USER_ROLES = ['admin', 'devops_engineer', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  devops_engineer: 'DevOps Engineer',
  viewer: 'Viewer',
};

export const ENV_LABELS: Record<Environment, string> = {
  dev: 'Development',
  staging: 'Staging',
  prod: 'Production',
};

export const STATUS_COLORS: Record<string, string> = {
  healthy: 'emerald',
  degraded: 'amber',
  down: 'red',
  success: 'emerald',
  failed: 'red',
  rolled_back: 'amber',
};
