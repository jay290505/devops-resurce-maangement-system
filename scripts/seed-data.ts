import dbConnect from '../lib/db';
import User from '../models/User';
import Resource from '../models/Resource';
import Deployment from '../models/Deployment';
import Environment from '../models/Environment';
import Incident from '../models/Incident';
import { hashPassword } from '../lib/auth';
import mongoose from 'mongoose';
import Request from '../models/Request';
import AuditLog from '../models/AuditLog';

interface EnvironmentData {
  name: string;
  description: string;
  status: 'active' | 'archived';
}

interface ResourceData {
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  environment: string;
  status: 'healthy' | 'degraded' | 'down';
  specs: { cpu: number; ram: number; region: string };
}

interface DeploymentData {
  resourceId: mongoose.Types.ObjectId;
  version: string;
  commitHash?: string;
  status: 'success' | 'failed' | 'rolled_back';
  previousVersion?: string;
}

interface IncidentData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resourceId: mongoose.Types.ObjectId;
  deploymentId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
}

interface RequestData {
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  specs: { cpu: number; ram: number; region: string };
  environment: string;
  purpose: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'provisioned';
  requestedBy: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  comments?: string;
}

interface AuditLogData {
  action: string;
  details: string;
  userId: mongoose.Types.ObjectId;
  resourceId?: mongoose.Types.ObjectId;
}

async function main() {
  console.log('--- Seeding Platform Mock Data ---');
  try {
    await dbConnect();
    console.log('✓ Connected to MongoDB.');

    console.log('Cleaning old users, resources, deployments, incidents, requests, audit logs, and environments...');
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Deployment.deleteMany({});
    await Incident.deleteMany({});
    await Environment.deleteMany({});
    await Request.deleteMany({});
    await AuditLog.deleteMany({});

    const hashedPassword = await hashPassword('temporarypassword123');

    console.log('Creating users with hashed passwords...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'test-admin@devopsplatform.local',
      password: hashedPassword,
      role: 'admin',
    });

    const devops = await User.create({
      name: 'Jay Jobanputra (DevOps)',
      email: 'devops-eng@devopsplatform.local',
      password: hashedPassword,
      role: 'devops_engineer',
    });

    const pm = await User.create({
      name: 'Sarah Connor (Project Manager)',
      email: 'pm-lead@devopsplatform.local',
      password: hashedPassword,
      role: 'project_manager',
    });

    const viewer = await User.create({
      name: 'Management Viewer',
      email: 'viewer@devopsplatform.local',
      password: hashedPassword,
      role: 'viewer',
    });

    console.log('✓ Users checked/created.');

    console.log('Creating default environments...');
    const envs: EnvironmentData[] = [
      { name: 'dev', description: 'Local sandbox and branch testing', status: 'active' },
      { name: 'staging', description: 'Release preview and QA validation', status: 'active' },
      { name: 'prod', description: 'Live user-facing infrastructure cluster', status: 'active' },
      { name: 'preprod', description: 'Beta canary test namespace', status: 'archived' },
    ];

    const envDocs: mongoose.Document[] = [];
    for (const env of envs) {
      const doc = await Environment.create({
        ...env,
        createdBy: admin._id,
      });
      envDocs.push(doc);
    }
    console.log('✓ Environments created.');

    console.log('Creating sample resources...');
    const resourcesData: ResourceData[] = [
      {
        name: 'vm-prod-gateway',
        type: 'server',
        environment: 'prod',
        status: 'healthy',
        specs: { cpu: 8, ram: 32, region: 'us-east-1' },
      },
      {
        name: 'mongodb-cluster-main',
        type: 'database',
        environment: 'prod',
        status: 'degraded',
        specs: { cpu: 16, ram: 64, region: 'us-east-1' },
      },
      {
        name: 'redis-cache-staging',
        type: 'service',
        environment: 'staging',
        status: 'healthy',
        specs: { cpu: 4, ram: 16, region: 'us-west-2' },
      },
      {
        name: 'docker-worker-node',
        type: 'container',
        environment: 'dev',
        status: 'down',
        specs: { cpu: 2, ram: 8, region: 'ap-south-1' },
      },
    ];

    const resourceDocs: mongoose.Document[] = [];
    for (const res of resourcesData) {
      const doc = await Resource.create({
        ...res,
        owner: devops._id,
      });
      resourceDocs.push(doc);
    }
    console.log('✓ Resources created.');

    console.log('Creating sample deployments...');
    const deploymentsData: DeploymentData[] = [
      {
        resourceId: resourceDocs[0]._id as mongoose.Types.ObjectId,
        version: 'v2.10.4',
        commitHash: '72ea95c1c8a14b9',
        status: 'success',
        previousVersion: 'v2.10.3',
      },
      {
        resourceId: resourceDocs[1]._id as mongoose.Types.ObjectId,
        version: 'v5.0.12-rc1',
        commitHash: 'db925cf15fa8b30',
        status: 'failed',
        previousVersion: 'v5.0.11',
      },
      {
        resourceId: resourceDocs[2]._id as mongoose.Types.ObjectId,
        version: 'v1.4.0',
        commitHash: 'ab8836decf1899a',
        status: 'success',
        previousVersion: 'v1.3.9',
      },
      {
        resourceId: resourceDocs[3]._id as mongoose.Types.ObjectId,
        version: 'v0.9.1-beta',
        commitHash: '00f34c9c82b13e5',
        status: 'rolled_back',
        previousVersion: 'v0.9.0',
      },
    ];

    const deploymentDocs: mongoose.Document[] = [];
    for (const dep of deploymentsData) {
      const doc = await Deployment.create({
        ...dep,
        deployedBy: devops._id,
      });
      deploymentDocs.push(doc);
    }
    console.log('✓ Deployments created.');

    console.log('Creating sample incidents...');
    const incidentsData: IncidentData[] = [
      {
        title: 'Primary database replica out of sync',
        description: 'Mongoose primary cluster failed replication checks. Auto-failover triggered secondary read-only sync mode.',
        severity: 'high',
        status: 'in_progress',
        resourceId: resourceDocs[1]._id as mongoose.Types.ObjectId,
        deploymentId: deploymentDocs[1]._id as mongoose.Types.ObjectId,
      },
      {
        title: 'Container disk layout configuration issue',
        description: 'Docker agent reported zero capacity on dev cache mounting pools. Worker node suspended tasks.',
        severity: 'critical',
        status: 'open',
        resourceId: resourceDocs[3]._id as mongoose.Types.ObjectId,
        deploymentId: deploymentDocs[3]._id as mongoose.Types.ObjectId,
      },
      {
        title: 'API Gateway memory exhaustion warnings',
        description: 'Gateway container exceeded 90% memory threshold. Node gracefully restarted and freed heap allocation.',
        severity: 'low',
        status: 'resolved',
        resourceId: resourceDocs[0]._id as mongoose.Types.ObjectId,
        resolvedAt: new Date(),
        resolvedBy: admin._id,
      },
    ];

    for (const inc of incidentsData) {
      await Incident.create({
        ...inc,
        createdBy: admin._id,
      });
    }
    console.log('✓ Incidents created.');

    console.log('Creating sample requests...');
    const requestsData: RequestData[] = [
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

    const requestDocs: mongoose.Document[] = [];
    for (const req of requestsData) {
      const doc = await Request.create(req);
      requestDocs.push(doc);
    }
    console.log('✓ Requests created.');

    console.log('Creating sample audit logs...');
    const auditLogsData: AuditLogData[] = [
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
        resourceId: requestDocs[1]._id as mongoose.Types.ObjectId,
      },
      {
        action: 'RESOURCE_RELEASE',
        details: 'Released and terminated SERVER resource "docker-worker-node" (Namespace: DEV)',
        userId: devops._id,
        resourceId: resourceDocs[3]._id as mongoose.Types.ObjectId,
      },
    ];

    for (const log of auditLogsData) {
      await AuditLog.create(log);
    }
    console.log('✓ Audit logs created.');

    console.log('\n======================================================');
    console.log('SUCCESS: All collections seeded successfully!');
    console.log('You can now log in using:');
    console.log('  Admin User: test-admin@devopsplatform.local / temporarypassword123');
    console.log('  PM User: pm-lead@devopsplatform.local / temporarypassword123');
    console.log('  DevOps User: devops-eng@devopsplatform.local / temporarypassword123');
    console.log('  Viewer User: viewer@devopsplatform.local / temporarypassword123');
    console.log('======================================================');
  } catch (error) {
    console.error('❌ Seeding Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

main();
