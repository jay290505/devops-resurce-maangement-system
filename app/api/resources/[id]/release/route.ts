import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';

/**
 * POST /api/resources/[id]/release
 * Release and terminate/deprovision an allocated infrastructure resource (Workflow Step 5).
 * Accessible by: admin, devops_engineer.
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer'],
    async (req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        await dbConnect();

        const resource = await Resource.findById(id);
        if (!resource) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        const resourceName = resource.name;
        const resourceType = resource.type;

        // Delete the active resource (Workflow Step 5: Terminate/deprovision)
        await Resource.findByIdAndDelete(id);

        // Log compliance audit log (Workflow Step 5: Archive records for audit)
        await AuditLog.create({
          action: 'RESOURCE_RELEASE',
          details: `Released and terminated ${resourceType.toUpperCase()} resource "${resourceName}" (Namespace: ${resource.environment.toUpperCase()})`,
          userId: user.userId,
        });

        return NextResponse.json({
          message: 'Resource deprovisioned and released successfully',
          id,
        });
      } catch (error) {
        console.error('Release Resource Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
