// In-memory mock database store for zero-database deployment (Vercel demo / fallback mode)

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'devops_engineer' | 'project_manager' | 'viewer';
  createdAt?: string;
}

export interface MockEnvironment {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdBy?: { _id: string; name: string; email: string };
  createdAt?: string;
}

export interface MockResource {
  _id: string;
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  environment: string;
  status: 'healthy' | 'degraded' | 'down';
  specs: { cpu: number; ram: number; region: string };
  owner?: { _id: string; name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface MockDeployment {
  _id: string;
  resourceId: { _id: string; name: string; environment: string; status: string } | string;
  version: string;
  commitHash?: string;
  status: 'success' | 'failed' | 'rolled_back';
  previousVersion?: string;
  deployedBy?: { _id: string; name: string; email: string };
  deployedAt: string;
  createdAt?: string;
}

export interface MockIncident {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resourceId: { _id: string; name: string; environment: string; status: string } | string;
  deploymentId?: { _id: string; version: string; status: string } | string;
  createdBy?: { _id: string; name: string; email: string };
  resolvedBy?: { _id: string; name: string; email: string };
  resolvedAt?: string;
  createdAt: string;
}

export interface MockRequest {
  _id: string;
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  specs: { cpu: number; ram: number; region: string };
  environment: string;
  purpose: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'provisioned';
  requestedBy: { _id: string; name: string; email: string; role: string } | string;
  resolvedBy?: { _id: string; name: string; email: string; role: string } | string;
  comments?: string;
  createdAt: string;
}

export interface MockAuditLog {
  _id: string;
  action: string;
  details: string;
  userId: { _id: string; name: string; email: string; role: string } | string;
  resourceId?: { _id: string; name: string; type: string; environment: string; status: string } | string;
  timestamp: string;
  createdAt: string;
}

interface MockDataState {
  users: MockUser[];
  environments: MockEnvironment[];
  resources: MockResource[];
  deployments: MockDeployment[];
  incidents: MockIncident[];
  requests: MockRequest[];
  auditLogs: MockAuditLog[];
}

function initializeDefaultData(): MockDataState {
  const users: MockUser[] = [
    {
      _id: '65f000000000000000000001',
      name: 'System Administrator',
      email: 'admin@devopsplatform.local',
      role: 'admin',
      password: 'admin',
      createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000002',
      name: 'Jay Jobanputra (DevOps)',
      email: 'devops-eng@devopsplatform.local',
      role: 'devops_engineer',
      password: 'admin',
      createdAt: new Date('2026-01-02T00:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000003',
      name: 'Sarah Connor (PM)',
      email: 'pm-lead@devopsplatform.local',
      role: 'project_manager',
      password: 'admin',
      createdAt: new Date('2026-01-03T00:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000004',
      name: 'Management Viewer',
      email: 'viewer@devopsplatform.local',
      role: 'viewer',
      password: 'admin',
      createdAt: new Date('2026-01-04T00:00:00Z').toISOString(),
    },
  ];

  const adminOwner = { _id: users[0]._id, name: users[0].name, email: users[0].email };
  const devopsOwner = { _id: users[1]._id, name: users[1].name, email: users[1].email };
  const pmOwner = { _id: users[2]._id, name: users[2].name, email: users[2].email };

  const environments: MockEnvironment[] = [
    {
      _id: '65f000000000000000000011',
      name: 'dev',
      description: 'Local sandbox and branch testing',
      status: 'active',
      createdBy: adminOwner,
      createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000012',
      name: 'staging',
      description: 'Release preview and QA validation',
      status: 'active',
      createdBy: adminOwner,
      createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000013',
      name: 'prod',
      description: 'Live user-facing infrastructure cluster',
      status: 'active',
      createdBy: adminOwner,
      createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000014',
      name: 'preprod',
      description: 'Beta canary test namespace',
      status: 'archived',
      createdBy: adminOwner,
      createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    },
  ];

  const resources: MockResource[] = [
    {
      _id: '65f000000000000000000021',
      name: 'vm-prod-gateway',
      type: 'server',
      environment: 'prod',
      status: 'healthy',
      specs: { cpu: 8, ram: 32, region: 'us-east-1' },
      owner: devopsOwner,
      createdAt: new Date('2026-01-10T10:00:00Z').toISOString(),
      updatedAt: new Date('2026-01-10T10:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000022',
      name: 'mongodb-cluster-main',
      type: 'database',
      environment: 'prod',
      status: 'degraded',
      specs: { cpu: 16, ram: 64, region: 'us-east-1' },
      owner: devopsOwner,
      createdAt: new Date('2026-01-11T11:00:00Z').toISOString(),
      updatedAt: new Date('2026-01-11T11:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000023',
      name: 'redis-cache-staging',
      type: 'service',
      environment: 'staging',
      status: 'healthy',
      specs: { cpu: 4, ram: 16, region: 'us-west-2' },
      owner: devopsOwner,
      createdAt: new Date('2026-01-12T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-01-12T12:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000024',
      name: 'docker-worker-node',
      type: 'container',
      environment: 'dev',
      status: 'down',
      specs: { cpu: 2, ram: 8, region: 'ap-south-1' },
      owner: devopsOwner,
      createdAt: new Date('2026-01-13T13:00:00Z').toISOString(),
      updatedAt: new Date('2026-01-13T13:00:00Z').toISOString(),
    },
  ];

  const deployments: MockDeployment[] = [
    {
      _id: '65f000000000000000000031',
      resourceId: { _id: resources[0]._id, name: resources[0].name, environment: resources[0].environment, status: resources[0].status },
      version: 'v2.10.4',
      commitHash: '72ea95c1c8a14b9',
      status: 'success',
      previousVersion: 'v2.10.3',
      deployedBy: devopsOwner,
      deployedAt: new Date('2026-02-01T14:30:00Z').toISOString(),
      createdAt: new Date('2026-02-01T14:30:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000032',
      resourceId: { _id: resources[1]._id, name: resources[1].name, environment: resources[1].environment, status: resources[1].status },
      version: 'v5.0.12-rc1',
      commitHash: 'db925cf15fa8b30',
      status: 'failed',
      previousVersion: 'v5.0.11',
      deployedBy: devopsOwner,
      deployedAt: new Date('2026-02-02T16:45:00Z').toISOString(),
      createdAt: new Date('2026-02-02T16:45:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000033',
      resourceId: { _id: resources[2]._id, name: resources[2].name, environment: resources[2].environment, status: resources[2].status },
      version: 'v1.4.0',
      commitHash: 'ab8836decf1899a',
      status: 'success',
      previousVersion: 'v1.3.9',
      deployedBy: devopsOwner,
      deployedAt: new Date('2026-02-03T09:15:00Z').toISOString(),
      createdAt: new Date('2026-02-03T09:15:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000034',
      resourceId: { _id: resources[3]._id, name: resources[3].name, environment: resources[3].environment, status: resources[3].status },
      version: 'v0.9.1-beta',
      commitHash: '00f34c9c82b13e5',
      status: 'rolled_back',
      previousVersion: 'v0.9.0',
      deployedBy: devopsOwner,
      deployedAt: new Date('2026-02-04T11:20:00Z').toISOString(),
      createdAt: new Date('2026-02-04T11:20:00Z').toISOString(),
    },
  ];

  const incidents: MockIncident[] = [
    {
      _id: '65f000000000000000000041',
      title: 'Primary database replica out of sync',
      description: 'Mongoose primary cluster failed replication checks. Auto-failover triggered secondary read-only sync mode.',
      severity: 'high',
      status: 'in_progress',
      resourceId: { _id: resources[1]._id, name: resources[1].name, environment: resources[1].environment, status: resources[1].status },
      deploymentId: { _id: deployments[1]._id, version: deployments[1].version, status: deployments[1].status },
      createdBy: adminOwner,
      createdAt: new Date('2026-02-05T08:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000042',
      title: 'Container disk layout configuration issue',
      description: 'Docker agent reported zero capacity on dev cache mounting pools. Worker node suspended tasks.',
      severity: 'critical',
      status: 'open',
      resourceId: { _id: resources[3]._id, name: resources[3].name, environment: resources[3].environment, status: resources[3].status },
      deploymentId: { _id: deployments[3]._id, version: deployments[3].version, status: deployments[3].status },
      createdBy: adminOwner,
      createdAt: new Date('2026-02-05T09:30:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000043',
      title: 'API Gateway memory exhaustion warnings',
      description: 'Gateway container exceeded 90% memory threshold. Node gracefully restarted and freed heap allocation.',
      severity: 'low',
      status: 'resolved',
      resourceId: { _id: resources[0]._id, name: resources[0].name, environment: resources[0].environment, status: resources[0].status },
      createdBy: adminOwner,
      resolvedBy: adminOwner,
      resolvedAt: new Date('2026-02-05T12:00:00Z').toISOString(),
      createdAt: new Date('2026-02-05T10:15:00Z').toISOString(),
    },
  ];

  const requests: MockRequest[] = [
    {
      _id: '65f000000000000000000051',
      name: 'vm-staging-redis',
      type: 'service',
      specs: { cpu: 2, ram: 8, region: 'us-west-2' },
      environment: 'staging',
      purpose: 'Required for QA performance testing cluster cache namespace',
      duration: 15,
      status: 'pending',
      requestedBy: { _id: users[1]._id, name: users[1].name, email: users[1].email, role: users[1].role },
      createdAt: new Date('2026-02-06T11:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000052',
      name: 'k8s-prod-cluster-02',
      type: 'container',
      specs: { cpu: 32, ram: 128, region: 'us-east-1' },
      environment: 'prod',
      purpose: 'Additional node pool to scale deployment loads during Q3 launch',
      duration: 90,
      status: 'provisioned',
      requestedBy: { _id: users[1]._id, name: users[1].name, email: users[1].email, role: users[1].role },
      resolvedBy: { _id: users[2]._id, name: users[2].name, email: users[2].email, role: users[2].role },
      comments: 'Approved to scale live load',
      createdAt: new Date('2026-02-06T12:30:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000053',
      name: 'db-dev-replica',
      type: 'database',
      specs: { cpu: 4, ram: 16, region: 'ap-south-1' },
      environment: 'dev',
      purpose: 'Duplicate dev replica for sandbox testing',
      duration: 7,
      status: 'rejected',
      requestedBy: { _id: users[1]._id, name: users[1].name, email: users[1].email, role: users[1].role },
      resolvedBy: { _id: users[2]._id, name: users[2].name, email: users[2].email, role: users[2].role },
      comments: 'Rejected. Please reuse existing shared dev database resources.',
      createdAt: new Date('2026-02-06T13:45:00Z').toISOString(),
    },
  ];

  const auditLogs: MockAuditLog[] = [
    {
      _id: '65f000000000000000000061',
      action: 'RESOURCE_REQUEST',
      details: 'Requested SERVICE resource "vm-staging-redis" for "STAGING" (Specs: 2 cores, 8GB RAM)',
      userId: { _id: users[1]._id, name: users[1].name, email: users[1].email, role: users[1].role },
      timestamp: new Date('2026-02-06T11:00:00Z').toISOString(),
      createdAt: new Date('2026-02-06T11:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000062',
      action: 'RESOURCE_REQUEST',
      details: 'Requested CONTAINER resource "k8s-prod-cluster-02" for "PROD" (Specs: 32 cores, 128GB RAM)',
      userId: { _id: users[1]._id, name: users[1].name, email: users[1].email, role: users[1].role },
      timestamp: new Date('2026-02-06T12:30:00Z').toISOString(),
      createdAt: new Date('2026-02-06T12:30:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000063',
      action: 'RESOURCE_APPROVED',
      details: 'Approved resource request for "k8s-prod-cluster-02" (Namespace: PROD)',
      userId: { _id: users[2]._id, name: users[2].name, email: users[2].email, role: users[2].role },
      timestamp: new Date('2026-02-06T13:00:00Z').toISOString(),
      createdAt: new Date('2026-02-06T13:00:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000064',
      action: 'PROVISION_SUCCESS',
      details: 'Automatically provisioned CONTAINER resource "k8s-prod-cluster-02" successfully via Terraform mock automation script',
      userId: { _id: users[0]._id, name: users[0].name, email: users[0].email, role: users[0].role },
      resourceId: { _id: resources[0]._id, name: resources[0].name, type: resources[0].type, environment: resources[0].environment, status: resources[0].status },
      timestamp: new Date('2026-02-06T13:05:00Z').toISOString(),
      createdAt: new Date('2026-02-06T13:05:00Z').toISOString(),
    },
    {
      _id: '65f000000000000000000065',
      action: 'RESOURCE_RELEASE',
      details: 'Released and terminated SERVER resource "docker-worker-node" (Namespace: DEV)',
      userId: { _id: users[1]._id, name: users[1].name, email: users[1].email, role: users[1].role },
      resourceId: { _id: resources[3]._id, name: resources[3].name, type: resources[3].type, environment: resources[3].environment, status: resources[3].status },
      timestamp: new Date('2026-02-06T14:10:00Z').toISOString(),
      createdAt: new Date('2026-02-06T14:10:00Z').toISOString(),
    },
  ];

  return { users, environments, resources, deployments, incidents, requests, auditLogs };
}

// Global caching for Next.js serverless runtimes
declare global {
  var __mockDb: MockDataState | undefined;
}

if (!globalThis.__mockDb) {
  globalThis.__mockDb = initializeDefaultData();
}

function getDb(): MockDataState {
  if (!globalThis.__mockDb) {
    globalThis.__mockDb = initializeDefaultData();
  }
  return globalThis.__mockDb;
}

function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 18).padEnd(16, '0');
  return (timestamp + random).substring(0, 24);
}

export const mockStore = {
  // Authentication & Users
  authenticate(emailOrUsername: string, passwordInput: string): MockUser | null {
    const db = getDb();
    const query = emailOrUsername.trim().toLowerCase();

    const user = db.users.find((u) => {
      const matchEmail = u.email.toLowerCase() === query;
      const matchShortUsername =
        (query === 'admin' && u.role === 'admin') ||
        (query === 'devops' && u.role === 'devops_engineer') ||
        (query === 'pm' && u.role === 'project_manager') ||
        (query === 'viewer' && u.role === 'viewer');
      return matchEmail || matchShortUsername;
    });

    if (!user) return null;

    // Accept default password 'admin', 'temporarypassword123', or user's stored password
    const validPassword =
      passwordInput === 'admin' ||
      passwordInput === 'temporarypassword123' ||
      user.password === passwordInput;

    return validPassword ? user : null;
  },

  getUsers(): MockUser[] {
    const db = getDb();
    return db.users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
  },

  getUserById(id: string): MockUser | null {
    const db = getDb();
    return db.users.find((u) => u._id === id) || null;
  },

  getUserByEmail(email: string): MockUser | null {
    const db = getDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  registerUser(name: string, email: string, password: string): MockUser {
    const db = getDb();
    const newUser: MockUser = {
      _id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'viewer',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    return newUser;
  },

  updateUserRole(id: string, role: MockUser['role']): MockUser | null {
    const db = getDb();
    const user = db.users.find((u) => u._id === id);
    if (!user) return null;
    user.role = role;
    return user;
  },

  deleteUser(id: string): boolean {
    const db = getDb();
    const index = db.users.findIndex((u) => u._id === id);
    if (index === -1) return false;
    db.users.splice(index, 1);
    return true;
  },

  // Environments
  getEnvironments(): MockEnvironment[] {
    const db = getDb();
    return [...db.environments].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  getEnvironmentById(id: string): MockEnvironment | null {
    const db = getDb();
    return db.environments.find((e) => e._id === id) || null;
  },

  createEnvironment(name: string, description: string, creatorId: string): MockEnvironment {
    const db = getDb();
    const creator = this.getUserById(creatorId);
    const newEnv: MockEnvironment = {
      _id: generateId(),
      name: name.trim(),
      description: description.trim(),
      status: 'active',
      createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email } : undefined,
      createdAt: new Date().toISOString(),
    };
    db.environments.unshift(newEnv);
    return newEnv;
  },

  updateEnvironment(id: string, updates: Partial<MockEnvironment>): MockEnvironment | null {
    const db = getDb();
    const env = db.environments.find((e) => e._id === id);
    if (!env) return null;
    if (updates.name !== undefined) {
      const oldName = env.name;
      env.name = updates.name.trim();
      // Cascade rename to resources
      db.resources.forEach((r) => {
        if (r.environment === oldName) r.environment = env.name;
      });
    }
    if (updates.description !== undefined) env.description = updates.description.trim();
    if (updates.status !== undefined) env.status = updates.status;
    return env;
  },

  deleteEnvironment(id: string): { success: boolean; error?: string } {
    const db = getDb();
    const env = db.environments.find((e) => e._id === id);
    if (!env) return { success: false, error: 'Environment not found' };
    const associatedResources = db.resources.filter((r) => r.environment === env.name);
    if (associatedResources.length > 0) {
      return { success: false, error: `Cannot delete environment: ${associatedResources.length} resource(s) associated with it.` };
    }
    db.environments = db.environments.filter((e) => e._id !== id);
    return { success: true };
  },

  // Resources
  getResources(): MockResource[] {
    const db = getDb();
    return [...db.resources].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  getResourceById(id: string): MockResource | null {
    const db = getDb();
    return db.resources.find((r) => r._id === id) || null;
  },

  createResource(data: {
    name: string;
    type: MockResource['type'];
    environment: string;
    status?: MockResource['status'];
    specs: { cpu: number; ram: number; region: string };
    ownerId: string;
  }): MockResource {
    const db = getDb();
    const owner = this.getUserById(data.ownerId);
    const newRes: MockResource = {
      _id: generateId(),
      name: data.name.trim(),
      type: data.type,
      environment: data.environment,
      status: data.status || 'healthy',
      specs: {
        cpu: Number(data.specs.cpu),
        ram: Number(data.specs.ram),
        region: data.specs.region.trim(),
      },
      owner: owner ? { _id: owner._id, name: owner.name, email: owner.email } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.resources.unshift(newRes);
    return newRes;
  },

  updateResource(id: string, updates: Partial<MockResource>): MockResource | null {
    const db = getDb();
    const res = db.resources.find((r) => r._id === id);
    if (!res) return null;
    if (updates.name !== undefined) res.name = updates.name.trim();
    if (updates.type !== undefined) res.type = updates.type;
    if (updates.environment !== undefined) res.environment = updates.environment;
    if (updates.status !== undefined) res.status = updates.status;
    if (updates.specs !== undefined) {
      res.specs = {
        cpu: updates.specs.cpu !== undefined ? Number(updates.specs.cpu) : res.specs.cpu,
        ram: updates.specs.ram !== undefined ? Number(updates.specs.ram) : res.specs.ram,
        region: updates.specs.region !== undefined ? updates.specs.region.trim() : res.specs.region,
      };
    }
    res.updatedAt = new Date().toISOString();
    return res;
  },

  deleteResource(id: string): boolean {
    const db = getDb();
    const index = db.resources.findIndex((r) => r._id === id);
    if (index === -1) return false;
    db.resources.splice(index, 1);
    return true;
  },

  // Deployments
  getDeployments(): MockDeployment[] {
    const db = getDb();
    return [...db.deployments].sort((a, b) => new Date(b.deployedAt || 0).getTime() - new Date(a.deployedAt || 0).getTime());
  },

  getDeploymentById(id: string): MockDeployment | null {
    const db = getDb();
    return db.deployments.find((d) => d._id === id) || null;
  },

  createDeployment(data: {
    resourceId: string;
    version: string;
    commitHash?: string;
    status?: MockDeployment['status'];
    previousVersion?: string;
    deployedById: string;
  }): MockDeployment | null {
    const db = getDb();
    const res = this.getResourceById(data.resourceId);
    if (!res) return null;
    const deployer = this.getUserById(data.deployedById);
    const newDep: MockDeployment = {
      _id: generateId(),
      resourceId: { _id: res._id, name: res.name, environment: res.environment, status: res.status },
      version: data.version.trim(),
      commitHash: data.commitHash || '',
      status: data.status || 'success',
      previousVersion: data.previousVersion || '',
      deployedBy: deployer ? { _id: deployer._id, name: deployer.name, email: deployer.email } : undefined,
      deployedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.deployments.unshift(newDep);
    return newDep;
  },

  // Incidents
  getIncidents(filter?: { severity?: string | null; status?: string | null; environment?: string | null }): MockIncident[] {
    const db = getDb();
    let result = [...db.incidents];
    if (filter?.severity) {
      result = result.filter((i) => i.severity === filter.severity);
    }
    if (filter?.status) {
      result = result.filter((i) => i.status === filter.status);
    }
    if (filter?.environment) {
      result = result.filter((i) => {
        const res = typeof i.resourceId === 'object' ? i.resourceId : this.getResourceById(i.resourceId);
        return res?.environment === filter.environment;
      });
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getIncidentById(id: string): MockIncident | null {
    const db = getDb();
    return db.incidents.find((i) => i._id === id) || null;
  },

  createIncident(data: {
    title: string;
    description: string;
    severity: MockIncident['severity'];
    resourceId: string;
    deploymentId?: string;
    creatorId: string;
  }): MockIncident | null {
    const db = getDb();
    const res = this.getResourceById(data.resourceId);
    if (!res) return null;
    const creator = this.getUserById(data.creatorId);
    const dep = data.deploymentId ? this.getDeploymentById(data.deploymentId) : null;

    // Escalate resource status
    if (data.severity === 'critical') {
      res.status = 'down';
    } else if (data.severity === 'high' || data.severity === 'medium') {
      res.status = 'degraded';
    }

    const newInc: MockIncident = {
      _id: generateId(),
      title: data.title.trim(),
      description: data.description.trim(),
      severity: data.severity,
      status: 'open',
      resourceId: { _id: res._id, name: res.name, environment: res.environment, status: res.status },
      deploymentId: dep ? { _id: dep._id, version: dep.version, status: dep.status } : undefined,
      createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email } : undefined,
      createdAt: new Date().toISOString(),
    };
    db.incidents.unshift(newInc);
    return newInc;
  },

  updateIncident(id: string, updates: { status?: MockIncident['status']; severity?: MockIncident['severity']; description?: string; resolverId?: string }): MockIncident | null {
    const db = getDb();
    const incident = db.incidents.find((i) => i._id === id);
    if (!incident) return null;

    if (updates.description !== undefined) incident.description = updates.description.trim();
    if (updates.severity !== undefined) incident.severity = updates.severity;

    if (updates.status !== undefined) {
      incident.status = updates.status;
      const resId = typeof incident.resourceId === 'object' ? incident.resourceId._id : incident.resourceId;
      const res = this.getResourceById(resId);

      if (updates.status === 'resolved' || updates.status === 'closed') {
        incident.resolvedAt = new Date().toISOString();
        if (updates.resolverId) {
          const resolver = this.getUserById(updates.resolverId);
          if (resolver) incident.resolvedBy = { _id: resolver._id, name: resolver.name, email: resolver.email };
        }
        // Auto-heal resource if no other open incident exists
        const remainingOpen = db.incidents.filter(
          (i) => i._id !== id && (typeof i.resourceId === 'object' ? i.resourceId._id : i.resourceId) === resId && ['open', 'in_progress'].includes(i.status)
        );
        if (remainingOpen.length === 0 && res) {
          res.status = 'healthy';
        }
      } else if (updates.status === 'open' || updates.status === 'in_progress') {
        incident.resolvedAt = undefined;
        incident.resolvedBy = undefined;
        if (res) {
          res.status = incident.severity === 'critical' ? 'down' : 'degraded';
        }
      }
    }

    return incident;
  },

  // Requests
  getRequests(userId?: string, role?: string): MockRequest[] {
    const db = getDb();
    let list = [...db.requests];
    if (role === 'devops_engineer' || role === 'viewer') {
      list = list.filter((r) => {
        const reqId = typeof r.requestedBy === 'object' ? r.requestedBy._id : r.requestedBy;
        return reqId === userId;
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRequestById(id: string): MockRequest | null {
    const db = getDb();
    return db.requests.find((r) => r._id === id) || null;
  },

  createRequest(data: {
    name: string;
    type: MockRequest['type'];
    specs: { cpu: number; ram: number; region: string };
    environment: string;
    purpose: string;
    duration: number;
    userId: string;
  }): MockRequest {
    const db = getDb();
    const requester = this.getUserById(data.userId);
    const newReq: MockRequest = {
      _id: generateId(),
      name: data.name.trim(),
      type: data.type,
      specs: {
        cpu: Number(data.specs.cpu),
        ram: Number(data.specs.ram),
        region: data.specs.region.trim(),
      },
      environment: data.environment.trim(),
      purpose: data.purpose.trim(),
      duration: Number(data.duration),
      status: 'pending',
      requestedBy: requester ? { _id: requester._id, name: requester.name, email: requester.email, role: requester.role } : data.userId,
      createdAt: new Date().toISOString(),
    };
    db.requests.unshift(newReq);
    return newReq;
  },

  resolveRequest(id: string, status: 'approved' | 'rejected', comments: string, resolverId: string): { request: MockRequest | null; resource: MockResource | null } {
    const db = getDb();
    const req = db.requests.find((r) => r._id === id);
    if (!req) return { request: null, resource: null };

    const resolver = this.getUserById(resolverId);
    req.status = status;
    req.comments = comments || '';
    req.resolvedBy = resolver ? { _id: resolver._id, name: resolver.name, email: resolver.email, role: resolver.role } : resolverId;

    let createdRes: MockResource | null = null;
    if (status === 'approved') {
      const requesterId = typeof req.requestedBy === 'object' ? req.requestedBy._id : req.requestedBy;
      createdRes = this.createResource({
        name: req.name,
        type: req.type,
        environment: req.environment,
        status: 'healthy',
        specs: req.specs,
        ownerId: requesterId,
      });
      req.status = 'provisioned';
    }

    return { request: req, resource: createdRes };
  },

  // Audit Logs
  getAuditLogs(): MockAuditLog[] {
    const db = getDb();
    return [...db.auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createAuditLog(action: string, details: string, userId: string, resourceId?: string): MockAuditLog {
    const db = getDb();
    const user = this.getUserById(userId);
    const res = resourceId ? this.getResourceById(resourceId) : undefined;
    const newLog: MockAuditLog = {
      _id: generateId(),
      action,
      details,
      userId: user ? { _id: user._id, name: user.name, email: user.email, role: user.role } : userId,
      resourceId: res ? { _id: res._id, name: res.name, type: res.type, environment: res.environment, status: res.status } : undefined,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(newLog);
    return newLog;
  },

  // Telemetry & Reports Aggregations
  getReports() {
    const db = getDb();
    const typeCounts: Record<string, number> = { server: 0, database: 0, service: 0, container: 0 };
    let totalCpus = 0;
    let totalRam = 0;
    let healthy = 0;

    db.resources.forEach((r) => {
      if (typeCounts[r.type] !== undefined) {
        typeCounts[r.type]++;
      }
      totalCpus += r.specs?.cpu || 0;
      totalRam += r.specs?.ram || 0;
      if (r.status === 'healthy') healthy++;
    });

    const requestCounts: Record<string, number> = { pending: 0, approved: 0, rejected: 0, provisioned: 0 };
    db.requests.forEach((req) => {
      if (requestCounts[req.status] !== undefined) {
        requestCounts[req.status]++;
      }
    });

    const availabilityRate = db.resources.length > 0 ? Math.round((healthy / db.resources.length) * 100) : 100;

    return {
      resourceStats: typeCounts,
      footprint: { cpu: totalCpus, ram: totalRam },
      requestStats: requestCounts,
      availabilityRate,
      totalResources: db.resources.length,
      totalRequests: db.requests.length,
    };
  },
};
