import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/audit-logs
 * Fetch compliance logs (security, provisioning, and releases).
 * Accessible by: admin, project_manager, viewer.
 */
export async function GET(req: NextRequest) {
  return requireRole(
    ['admin', 'project_manager', 'viewer'],
    async (_req: NextRequest) => {
      try {
        await dbConnect();

        const logs = await AuditLog.find({})
          .populate('userId', 'name email role')
          .populate('resourceId', 'name type environment status')
          .sort({ createdAt: -1 });

        return NextResponse.json(logs);
      } catch (error) {
        console.error('Fetch Audit Logs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}
