import User from '@/models/User';
import Resource from '@/models/Resource';
import Deployment from '@/models/Deployment';
import Environment from '@/models/Environment';
import Incident from '@/models/Incident';
import Request from '@/models/Request';
import AuditLog from '@/models/AuditLog';
import { hashPassword } from '@/lib/auth';

let isSeeding = false;
let isSeeded = false;

export interface SeedResult {
  users: number;
  environments: number;
  resources: number;
  deployments: number;
  incidents: number;
  requests: number;
  auditLogs: number;
}

export async function ensureDatabaseSeeded(force: boolean = false): Promise<SeedResult> {
  if (!force && isSeeded) {
    return {
      users: await User.countDocuments().catch(() => 0),
      environments: await Environment.countDocuments().catch(() => 0),
      resources: await Resource.countDocuments().catch(() => 0),
      deployments: await Deployment.countDocuments().catch(() => 0),
      incidents: await Incident.countDocuments().catch(() => 0),
      requests: await Request.countDocuments().catch(() => 0),
      auditLogs: await AuditLog.countDocuments().catch(() => 0),
    };
  }

  if (isSeeding) {
    // Wait briefly if another seed request is in flight
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      users: await User.countDocuments().catch(() => 0),
      environments: await Environment.countDocuments().catch(() => 0),
      resources: await Resource.countDocuments().catch(() => 0),
      deployments: await Deployment.countDocuments().catch(() => 0),
      incidents: await Incident.countDocuments().catch(() => 0),
      requests: await Request.countDocuments().catch(() => 0),
      auditLogs: await AuditLog.countDocuments().catch(() => 0),
    };
  }

  isSeeding = true;

  try {
    const defaultPassword = await hashPassword('admin');

    // 1. Ensure all 4 default users exist with known credentials
    let admin = await User.findOne({
      $or: [{ email: 'admin@devopsplatform.local' }, { role: 'admin' }],
    });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@devopsplatform.local',
        password: defaultPassword,
        role: 'admin',
      });
    } else {
      admin.password = defaultPassword;
      admin.role = 'admin';
      await admin.save();
    }

    let devops = await User.findOne({
      $or: [{ email: 'devops-eng@devopsplatform.local' }, { role: 'devops_engineer' }],
    });
    if (!devops) {
      devops = await User.create({
        name: 'Jay Jobanputra (DevOps)',
        email: 'devops-eng@devopsplatform.local',
        password: defaultPassword,
        role: 'devops_engineer',
      });
    } else {
      devops.password = defaultPassword;
      devops.role = 'devops_engineer';
      await devops.save();
    }

    let pm = await User.findOne({
      $or: [{ email: 'pm-lead@devopsplatform.local' }, { role: 'project_manager' }],
    });
    if (!pm) {
      pm = await User.create({
        name: 'Sarah Connor (PM)',
        email: 'pm-lead@devopsplatform.local',
        password: defaultPassword,
        role: 'project_manager',
      });
    } else {
      pm.password = defaultPassword;
      pm.role = 'project_manager';
      await pm.save();
    }

    let viewer = await User.findOne({
      $or: [{ email: 'viewer@devopsplatform.local' }, { role: 'viewer' }],
    });
    if (!viewer) {
      viewer = await User.create({
        name: 'Management Viewer',
        email: 'viewer@devopsplatform.local',
        password: defaultPassword,
        role: 'viewer',
      });
    } else {
      viewer.password = defaultPassword;
      viewer.role = 'viewer';
      await viewer.save();
    }

    // 2. Ensure environments exist
    const envCount = await Environment.countDocuments();
    if (envCount === 0) {
      const envs = [
        { name: 'dev', description: 'Local sandbox and branch testing', status: 'active', createdBy: admin._id },
        { name: 'staging', description: 'Release preview and QA validation', status: 'active', createdBy: admin._id },
        { name: 'prod', description: 'Live user-facing infrastructure cluster', status: 'active', createdBy: admin._id },
        { name: 'preprod', description: 'Beta canary test namespace', status: 'archived', createdBy: admin._id },
      ];
      for (const env of envs) {
        await Environment.create(env);
      }
    }

    // 3. Ensure resources exist
    let resourceDocs = await Resource.find({}).limit(10);
    if (resourceDocs.length === 0) {
      const resourcesData = [
        {
          name: 'vm-prod-gateway',
          type: 'server',
          environment: 'prod',
          status: 'healthy',
          specs: { cpu: 8, ram: 32, region: 'us-east-1' },
          owner: devops._id,
        },
        {
          name: 'mongodb-cluster-main',
          type: 'database',
          environment: 'prod',
          status: 'degraded',
          specs: { cpu: 16, ram: 64, region: 'us-east-1' },
          owner: devops._id,
        },
        {
          name: 'redis-cache-staging',
          type: 'service',
          environment: 'staging',
          status: 'healthy',
          specs: { cpu: 4, ram: 16, region: 'us-west-2' },
          owner: devops._id,
        },
        {
          name: 'docker-worker-node',
          type: 'container',
          environment: 'dev',
          status: 'down',
          specs: { cpu: 2, ram: 8, region: 'ap-south-1' },
          owner: devops._id,
        },
      ];

      for (const res of resourcesData) {
        const doc = await Resource.create(res);
        resourceDocs.push(doc);
      }
    }

    // 4. Ensure deployments exist
    const depCount = await Deployment.countDocuments();
    let deploymentDocs = [];
    if (depCount === 0 && resourceDocs.length > 0) {
      const deploymentsData = [
        {
          resourceId: resourceDocs[0]._id,
          version: 'v2.10.4',
          commitHash: '72ea95c1c8a14b9',
          status: 'success',
          previousVersion: 'v2.10.3',
          deployedBy: devops._id,
          deployedAt: new Date(Date.now() - 3600000 * 24),
        },
        {
          resourceId: resourceDocs[1]?._id || resourceDocs[0]._id,
          version: 'v5.0.12-rc1',
          commitHash: 'db925cf15fa8b30',
          status: 'failed',
          previousVersion: 'v5.0.11',
          deployedBy: devops._id,
          deployedAt: new Date(Date.now() - 3600000 * 18),
        },
        {
          resourceId: resourceDocs[2]?._id || resourceDocs[0]._id,
          version: 'v1.4.0',
          commitHash: 'ab8836decf1899a',
          status: 'success',
          previousVersion: 'v1.3.9',
          deployedBy: devops._id,
          deployedAt: new Date(Date.now() - 3600000 * 12),
        },
        {
          resourceId: resourceDocs[3]?._id || resourceDocs[0]._id,
          version: 'v0.9.1-beta',
          commitHash: '00f34c9c82b13e5',
          status: 'rolled_back',
          previousVersion: 'v0.9.0',
          deployedBy: devops._id,
          deployedAt: new Date(Date.now() - 3600000 * 4),
        },
      ];

      for (const dep of deploymentsData) {
        const doc = await Deployment.create(dep);
        deploymentDocs.push(doc);
      }
    } else {
      deploymentDocs = await Deployment.find({}).limit(4);
    }

    // 5. Ensure incidents exist
    const incCount = await Incident.countDocuments();
    if (incCount === 0 && resourceDocs.length > 0) {
      const incidentsData = [
        {
          title: 'Primary database replica out of sync',
          description: 'Mongoose primary cluster failed replication checks. Auto-failover triggered secondary read-only sync mode.',
          severity: 'high',
          status: 'in_progress',
          resourceId: resourceDocs[1]?._id || resourceDocs[0]._id,
          deploymentId: deploymentDocs[1]?._id || deploymentDocs[0]?._id,
          createdBy: admin._id,
        },
        {
          title: 'Container disk layout configuration issue',
          description: 'Docker agent reported zero capacity on dev cache mounting pools. Worker node suspended tasks.',
          severity: 'critical',
          status: 'open',
          resourceId: resourceDocs[3]?._id || resourceDocs[0]._id,
          deploymentId: deploymentDocs[3]?._id || deploymentDocs[0]?._id,
          createdBy: admin._id,
        },
        {
          title: 'API Gateway memory exhaustion warnings',
          description: 'Gateway container exceeded 90% memory threshold. Node gracefully restarted and freed heap allocation.',
          severity: 'low',
          status: 'resolved',
          resourceId: resourceDocs[0]._id,
          resolvedAt: new Date(),
          resolvedBy: admin._id,
          createdBy: admin._id,
        },
      ];

      for (const inc of incidentsData) {
        await Incident.create(inc);
      }
    }

    // 6. Ensure requests exist
    const reqCount = await Request.countDocuments();
    if (reqCount === 0) {
      const requestsData = [
        {
          name: 'vm-staging-redis',
          type: 'service',
          specs: { cpu: 2, ram: 8, region: 'us-west-2' },
          environment: 'staging',
          purpose: 'Required for QA performance testing cluster cache namespace',
          duration: 15,
          status: 'pending',
          requestedBy: devops._id,
        },
        {
          name: 'k8s-prod-cluster-02',
          type: 'container',
          specs: { cpu: 32, ram: 128, region: 'us-east-1' },
          environment: 'prod',
          purpose: 'Additional node pool to scale deployment loads during Q3 launch',
          duration: 90,
          status: 'provisioned',
          requestedBy: devops._id,
          resolvedBy: pm._id,
          comments: 'Approved to scale live load',
        },
        {
          name: 'db-dev-replica',
          type: 'database',
          specs: { cpu: 4, ram: 16, region: 'ap-south-1' },
          environment: 'dev',
          purpose: 'Duplicate dev replica for sandbox testing',
          duration: 7,
          status: 'rejected',
          requestedBy: devops._id,
          resolvedBy: pm._id,
          comments: 'Rejected. Please reuse existing shared dev database resources.',
        },
      ];

      for (const req of requestsData) {
        await Request.create(req);
      }
    }

    // 7. Ensure audit logs exist
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      const auditLogsData = [
        {
          action: 'RESOURCE_REQUEST',
          details: 'Requested SERVICE resource "vm-staging-redis" for "STAGING" (Specs: 2 cores, 8GB RAM)',
          userId: devops._id,
        },
        {
          action: 'RESOURCE_REQUEST',
          details: 'Requested CONTAINER resource "k8s-prod-cluster-02" for "PROD" (Specs: 32 cores, 128GB RAM)',
          userId: devops._id,
        },
        {
          action: 'RESOURCE_APPROVED',
          details: 'Approved resource request for "k8s-prod-cluster-02" (Namespace: PROD)',
          userId: pm._id,
        },
        {
          action: 'PROVISION_SUCCESS',
          details: 'Automatically provisioned CONTAINER resource "k8s-prod-cluster-02" successfully via Terraform mock automation script',
          userId: admin._id,
          resourceId: resourceDocs[0]?._id,
        },
        {
          action: 'RESOURCE_RELEASE',
          details: 'Released and terminated SERVER resource "docker-worker-node" (Namespace: DEV)',
          userId: devops._id,
          resourceId: resourceDocs[3]?._id,
        },
      ];

      for (const log of auditLogsData) {
        await AuditLog.create(log);
      }
    }

    isSeeded = true;
    console.log('✓ Database collections seeded successfully with sample platform data.');
  } catch (error) {
    console.warn('Auto-seed error:', error);
  } finally {
    isSeeding = false;
  }

  return {
    users: await User.countDocuments().catch(() => 0),
    environments: await Environment.countDocuments().catch(() => 0),
    resources: await Resource.countDocuments().catch(() => 0),
    deployments: await Deployment.countDocuments().catch(() => 0),
    incidents: await Incident.countDocuments().catch(() => 0),
    requests: await Request.countDocuments().catch(() => 0),
    auditLogs: await AuditLog.countDocuments().catch(() => 0),
  };
}
