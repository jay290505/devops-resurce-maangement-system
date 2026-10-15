import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Deployment from '@/models/Deployment';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * GET /api/deployments
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer', 'project_manager'], async (_req: NextRequest) => {
    try {
      const db = await dbConnect();
      if (db) {
        const deployments = await Deployment.find({})
          .populate('resourceId', 'name environment status')
          .populate('deployedBy', 'name email')
          .sort({ deployedAt: -1 });

        return NextResponse.json(deployments);
      }
    } catch (error) {
      console.warn('DB deployments fetch error, using mock store:', error);
    }

    return NextResponse.json(mockStore.getDeployments());
  })(req);
}

/**
 * POST /api/deployments
 */
export async function POST(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer'], async (req: NextRequest, user: { userId: string; role: string }) => {
    try {
      const { resourceId, version, commitHash, status, previousVersion } = await req.json();

      if (!resourceId || !version) {
        return NextResponse.json(
          { error: 'Resource ID and version are required' },
          { status: 400 }
        );
      }

      try {
        const db = await dbConnect();
        if (db) {
          const resource = await Resource.findById(resourceId);
          if (resource) {
            const newDeployment = await Deployment.create({
              resourceId,
              version,
              commitHash: commitHash || '',
              deployedBy: user.userId,
              status: status || 'success',
              previousVersion: previousVersion || '',
            });

            await newDeployment.populate('resourceId', 'name environment status');
            await newDeployment.populate('deployedBy', 'name email');

            return NextResponse.json(newDeployment, { status: 201 });
          }
        }
      } catch (dbErr) {
        console.warn('DB create deployment error, creating in mock store:', dbErr);
      }

      const mockDep = mockStore.createDeployment({
        resourceId,
        version,
        commitHash,
        status,
        previousVersion,
        deployedById: user.userId,
      });

      if (!mockDep) {
        return NextResponse.json({ error: 'Target resource does not exist' }, { status: 404 });
      }

      return NextResponse.json(mockDep, { status: 201 });
    } catch (error) {
      console.error('Create Deployment Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  })(req);
}
