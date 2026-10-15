import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * GET /api/audit-logs
 * Fetch compliance logs (security, provisioning, and releases).
 * Accessible by: admin, project_manager, viewer, devops_engineer.
 */
export async function GET(req: NextRequest) {
  return requireRole(
    ['admin', 'project_manager', 'viewer', 'devops_engineer'],
    async (_req: NextRequest) => {
      try {
        try {
          const db = await dbConnect();
          if (db) {
            const logs = await AuditLog.find({})
              .populate('userId', 'name email role')
              .populate('resourceId', 'name type environment status')
              .sort({ createdAt: -1 });

            return NextResponse.json(logs);
          }
        } catch (dbErr) {
          console.warn('DB fetch audit logs error, using mock store:', dbErr);
        }

        return NextResponse.json(mockStore.getAuditLogs());
      } catch (error) {
        console.error('Fetch Audit Logs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}
