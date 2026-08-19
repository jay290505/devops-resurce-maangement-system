// User types
export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'devops_engineer' | 'project_manager' | 'viewer';
}

// Resource types
export interface ResourceSpec {
  cpu: number;
  ram: number;
  region: string;
}

export interface Resource {
  _id: string;
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  environment: string;
  status: 'healthy' | 'degraded' | 'down';
  owner: string | UserSummary;
  specs: ResourceSpec;
  createdAt: string;
  updatedAt: string;
}

// Deployment types
export interface Deployment {
  _id: string;
  resourceId: string | {
    _id: string;
    name: string;
    environment: string;
    status: 'healthy' | 'degraded' | 'down';
  };
  version: string;
  commitHash?: string;
  deployedBy?: string | UserSummary;
  status: 'success' | 'failed' | 'rolled_back';
  deployedAt: string;
  previousVersion?: string;
}

// Environment types
export interface Environment {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdBy: string | UserSummary;
  createdAt: string;
  updatedAt: string;
}

// Incident types
export interface Incident {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resourceId: string | {
    _id: string;
    name: string;
    environment: string;
  };
  deploymentId?: string | Deployment;
  resolvedAt?: string;
  resolvedBy?: string | UserSummary;
  createdBy: string | UserSummary;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface ResourceRequest {
  _id: string;
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  specs: ResourceSpec;
  environment: string;
  purpose: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'provisioned';
  comments?: string;
  requestedBy: string | UserSummary;
  resolvedBy?: string | UserSummary;
  createdAt: string;
  updatedAt: string;
}

// AuditLog types
export interface AuditLog {
  _id: string;
  action: string;
  details: string;
  userId: string | UserSummary;
  resourceId?: string | Resource;
  createdAt: string;
}

