import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Deployment from '@/models/Deployment';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/deployments
 * Fetch recent deployments, sorted by deployment date.
 * Accessible by all authenticated users.
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer'], async (_req: NextRequest) => {
    try {
      await dbConnect();

      // Fetch deployments, populating references to Resource and User
      const deployments = await Deployment.find({})
        .populate('resourceId', 'name environment status')
        .populate('deployedBy', 'name email')
        .sort({ deployedAt: -1 });

      return NextResponse.json(deployments);
    } catch (error) {
      console.error('Fetch Deployments Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  })(req);
}

/**
 * POST /api/deployments
 * Log a new code deployment run.
 * Accessible by: admin, devops_engineer.
 */
export async function POST(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer'], async (req: NextRequest, user: { userId: string; role: string }) => {
    try {
      const { resourceId, version, commitHash, status, previousVersion } = await req.json();

      // 1. Validation
      if (!resourceId || !version) {
        return NextResponse.json(
          { error: 'Resource ID and version are required' },
          { status: 400 }
        );
      }

      await dbConnect();

      // 2. Verify target resource exists
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return NextResponse.json(
          { error: 'Target resource does not exist' },
          { status: 404 }
        );
      }

      // 3. Create new deployment record
      const newDeployment = await Deployment.create({
        resourceId,
        version,
        commitHash: commitHash || '',
        deployedBy: user.userId,
        status: status || 'success',
        previousVersion: previousVersion || '',
      });

      // Populate reference details for the client
      await newDeployment.populate('resourceId', 'name environment status');
      await newDeployment.populate('deployedBy', 'name email');

      return NextResponse.json(newDeployment, { status: 201 });
    } catch (error) {
      console.error('Create Deployment Error:', error);

      const err = error as { name?: string };
      if (err.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid Resource ID format' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  })(req);
}
