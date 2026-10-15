import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import mongoose from 'mongoose';

/**
 * PUT /api/incidents/[id]
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer'],
    async (req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const { status, severity, description } = await req.json();

        try {
          const db = await dbConnect();
          if (db) {
            const incident = await Incident.findById(id);
            if (incident) {
              if (description !== undefined) incident.description = description.trim();
              if (severity !== undefined) incident.severity = severity;

              if (status !== undefined) {
                const oldStatus = incident.status;
                incident.status = status;

                if ((status === 'resolved' || status === 'closed') && (oldStatus !== 'resolved' && oldStatus !== 'closed')) {
                  incident.resolvedAt = new Date();
                  incident.resolvedBy = incident.resolvedBy || (mongoose.Types.ObjectId.isValid(user.userId) ? new mongoose.Types.ObjectId(user.userId) : undefined);

                  const activeIncidents = await Incident.countDocuments({
                    resourceId: incident.resourceId,
                    _id: { $ne: incident._id },
                    status: { $in: ['open', 'in_progress'] },
                  });

                  if (activeIncidents === 0) {
                    const resource = await Resource.findById(incident.resourceId);
                    if (resource) {
                      resource.status = 'healthy';
                      await resource.save();
                    }
                  }
                } else if (status === 'open' || status === 'in_progress') {
                  incident.resolvedAt = undefined;
                  incident.resolvedBy = undefined;

                  const resource = await Resource.findById(incident.resourceId);
                  if (resource) {
                    resource.status = incident.severity === 'critical' ? 'down' : 'degraded';
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
            }
          }
        } catch (dbErr) {
          console.warn('DB update incident failed, updating in mock store:', dbErr);
        }

        const updatedMock = mockStore.updateIncident(id, {
          status,
          severity,
          description,
          resolverId: user.userId,
        });

        if (!updatedMock) {
          return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        return NextResponse.json(updatedMock);
      } catch (error) {
        console.error('Update Incident Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
