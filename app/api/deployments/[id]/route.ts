import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Deployment from '@/models/Deployment';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * GET /api/deployments/[id]
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer', 'viewer', 'project_manager'],
    async (_req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        try {
          const db = await dbConnect();
          if (db) {
            const deployment = await Deployment.findById(id)
              .populate('resourceId', 'name environment status')
              .populate('deployedBy', 'name email');

            if (deployment) return NextResponse.json(deployment);
          }
        } catch (dbErr) {
          console.warn('DB single deployment error, checking mock store:', dbErr);
        }

        const mockDep = mockStore.getDeploymentById(id);
        if (!mockDep) {
          return NextResponse.json({ error: 'Deployment log not found' }, { status: 404 });
        }

        return NextResponse.json(mockDep);
      } catch (error) {
        console.error('Fetch Single Deployment Error:', error);
        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    }
  )(req, context);
}
