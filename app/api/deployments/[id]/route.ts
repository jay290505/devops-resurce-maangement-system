import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Deployment from '@/models/Deployment';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/deployments/[id]
 * Fetch details of a single deployment run.
 * Accessible by all authenticated users.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer', 'viewer'],
    async (req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        await dbConnect();
        const deployment = await Deployment.findById(id)
          .populate('resourceId', 'name environment status')
          .populate('deployedBy', 'name email');

        if (!deployment) {
          return NextResponse.json({ error: 'Deployment log not found' }, { status: 404 });
        }

        return NextResponse.json(deployment);
      } catch (error) {
        console.error('Fetch Single Deployment Error:', error);

        const err = error as { name?: string };
        if (err.name === 'CastError') {
          return NextResponse.json({ error: 'Invalid Deployment ID format' }, { status: 400 });
        }

        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    }
  )(req, context);
}
