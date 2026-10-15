import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import Request from '@/models/Request';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * GET /api/reports
 * Fetch consolidated utilization and allocation metrics.
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
            const resources = await Resource.find({});
            const typeCounts: Record<string, number> = { server: 0, database: 0, service: 0, container: 0 };
            let totalCpus = 0;
            let totalRam = 0;
            let healthy = 0;

            resources.forEach((r) => {
              if (typeCounts[r.type] !== undefined) {
                typeCounts[r.type]++;
              }
              totalCpus += r.specs?.cpu || 0;
              totalRam += r.specs?.ram || 0;
              if (r.status === 'healthy') healthy++;
            });

            const requests = await Request.find({});
            const requestCounts: Record<string, number> = { pending: 0, approved: 0, rejected: 0, provisioned: 0 };
            requests.forEach((req) => {
              if (requestCounts[req.status] !== undefined) {
                requestCounts[req.status]++;
              }
            });

            const availabilityRate = resources.length > 0 ? Math.round((healthy / resources.length) * 100) : 100;

            return NextResponse.json({
              resourceStats: typeCounts,
              footprint: { cpu: totalCpus, ram: totalRam },
              requestStats: requestCounts,
              availabilityRate,
              totalResources: resources.length,
              totalRequests: requests.length,
            });
          }
        } catch (dbErr) {
          console.warn('DB fetch reports error, using mock store:', dbErr);
        }

        return NextResponse.json(mockStore.getReports());
      } catch (error) {
        console.error('Fetch Reports Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}
