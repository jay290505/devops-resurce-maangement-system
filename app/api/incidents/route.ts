import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import mongoose from 'mongoose';

/**
 * GET /api/incidents
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer', 'project_manager'], async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const severity = url.searchParams.get('severity');
      const status = url.searchParams.get('status');
      const environment = url.searchParams.get('environment');

      try {
        const db = await dbConnect();
        if (db) {
          const filter: Record<string, unknown> = {};
          if (severity) filter.severity = severity;
          if (status) filter.status = status;

          let incidents = await Incident.find(filter)
            .populate('resourceId', 'name environment status')
            .populate('deploymentId', 'version status')
            .populate('createdBy', 'name email')
            .populate('resolvedBy', 'name email')
            .sort({ createdAt: -1 });

          if (environment) {
            incidents = incidents.filter((inc) => {
              const res = inc.resourceId as { environment?: string } | null;
              return res?.environment === environment;
            });
          }

          return NextResponse.json(incidents);
        }
      } catch (dbErr) {
        console.warn('DB fetch incidents error, using mock store:', dbErr);
      }

      const mockIncidents = mockStore.getIncidents({ severity, status, environment });
      return NextResponse.json(mockIncidents);
    } catch (error) {
      console.error('Fetch Incidents Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}

/**
 * POST /api/incidents
 */
export async function POST(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer'], async (req: NextRequest, user: { userId: string; role: string }) => {
    try {
      const { title, description, severity, resourceId, deploymentId } = await req.json();

      if (!title || !description || !severity || !resourceId) {
        return NextResponse.json(
          { error: 'Title, description, severity, and resourceId are required' },
          { status: 400 }
        );
      }

      try {
        const db = await dbConnect();
        if (db) {
          const resource = await Resource.findById(resourceId);
          if (resource) {
            const newIncident = await Incident.create({
              title: title.trim(),
              description: description.trim(),
              severity,
              resourceId,
              deploymentId: deploymentId || undefined,
              createdBy: mongoose.Types.ObjectId.isValid(user.userId)
                ? new mongoose.Types.ObjectId(user.userId)
                : undefined,
              status: 'open',
            });

            if (severity === 'critical') {
              resource.status = 'down';
            } else if (severity === 'high' || severity === 'medium') {
              resource.status = 'degraded';
            }
            await resource.save();

            await newIncident.populate('resourceId', 'name environment status');
            await newIncident.populate('deploymentId', 'version status');
            await newIncident.populate('createdBy', 'name email');

            return NextResponse.json(newIncident, { status: 201 });
          }
        }
      } catch (dbErr) {
        console.warn('DB create incident error, creating in mock store:', dbErr);
      }

      const mockInc = mockStore.createIncident({
        title,
        description,
        severity,
        resourceId,
        deploymentId,
        creatorId: user.userId,
      });

      if (!mockInc) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      return NextResponse.json(mockInc, { status: 201 });
    } catch (error) {
      console.error('Create Incident Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}
