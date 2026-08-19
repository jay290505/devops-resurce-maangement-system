import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * PUT /api/incidents/[id]
 * Triage/resolve/close incident.
 * DevOps / Admin only.
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer'],
    async (req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const { status, severity, description } = await req.json();

        await dbConnect();
        const incident = await Incident.findById(id);
        if (!incident) {
          return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        if (description !== undefined) incident.description = description.trim();
        if (severity !== undefined) incident.severity = severity;

        // Handle status transitions
        if (status !== undefined) {
          const oldStatus = incident.status;
          incident.status = status;

          if ((status === 'resolved' || status === 'closed') && (oldStatus !== 'resolved' && oldStatus !== 'closed')) {
            incident.resolvedAt = new Date();
            incident.resolvedBy = incident.resolvedBy || new mongoose.Types.ObjectId(user.userId);

            // Check if there are other open/in_progress incidents for this resource
            const activeIncidents = await Incident.countDocuments({
              resourceId: incident.resourceId,
              _id: { $ne: incident._id },
              status: { $in: ['open', 'in_progress'] },
            });

            if (activeIncidents === 0) {
              // Auto-restore resource health to healthy if no other active incidents exist
              const resource = await Resource.findById(incident.resourceId);
              if (resource) {
                resource.status = 'healthy';
                await resource.save();
              }
            }
          } else if (status === 'open' || status === 'in_progress') {
            // If reopened, clear resolution metadata
            incident.resolvedAt = undefined;
            incident.resolvedBy = undefined;

            // Re-escalate resource health
            const resource = await Resource.findById(incident.resourceId);
            if (resource) {
              if (incident.severity === 'critical') {
                resource.status = 'down';
              } else {
                resource.status = 'degraded';
              }
              await resource.save();
            }
          }
        }

        await incident.save();
        await incident.populate('resourceId', 'name environment status');
        await incident.populate('deploymentId', 'version status');
        await incident.populate('createdBy', 'name email');
        await incident.populate('resolvedBy', 'name email');

        return NextResponse.json(incident);
      } catch (error) {
        console.error('Update Incident Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
