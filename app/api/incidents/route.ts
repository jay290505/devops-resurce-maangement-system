import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/incidents
 * Fetch incidents list, sorting by newest first.
 * Filterable by severity, status, and environment (handled by query parameters).
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer'], async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const severity = url.searchParams.get('severity');
      const status = url.searchParams.get('status');
      const environment = url.searchParams.get('environment');

      await dbConnect();

      // Build mongoose filter object
      const filter: Record<string, unknown> = {};
      if (severity) filter.severity = severity;
      if (status) filter.status = status;

      let incidents = await Incident.find(filter)
        .populate('resourceId', 'name environment status')
        .populate('deploymentId', 'version status')
        .populate('createdBy', 'name email')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 });

      // Client-side environment filter if populated
      if (environment) {
        incidents = incidents.filter((inc) => {
          const res = inc.resourceId as { environment?: string } | null;
          return res?.environment === environment;
        });
      }

      return NextResponse.json(incidents);
    } catch (error) {
      console.error('Fetch Incidents Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}

/**
 * POST /api/incidents
 * Log a new incident.
 * DevOps / Admin only.
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

      await dbConnect();

      // Verify resource exists
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      const newIncident = await Incident.create({
        title: title.trim(),
        description: description.trim(),
        severity,
        resourceId,
        deploymentId: deploymentId || undefined,
        createdBy: new mongoose.Types.ObjectId(user.userId),
        status: 'open',
      });

      // Auto-escalate resource health based on incident severity
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
    } catch (error) {
      console.error('Create Incident Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}
