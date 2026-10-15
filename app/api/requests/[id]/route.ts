import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import Resource from '@/models/Resource';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import mongoose from 'mongoose';

/**
 * PUT /api/requests/[id]
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'project_manager'],
    async (req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const { status, comments } = await req.json();

        if (!status || !['approved', 'rejected'].includes(status)) {
          return NextResponse.json({ error: 'Valid status (approved or rejected) is required' }, { status: 400 });
        }

        try {
          const db = await dbConnect();
          if (db) {
            const resourceRequest = await Request.findById(id);
            if (resourceRequest) {
              if (resourceRequest.status !== 'pending') {
                return NextResponse.json({ error: 'Request has already been resolved' }, { status: 400 });
              }

              resourceRequest.status = status;
              resourceRequest.comments = comments || '';
              resourceRequest.resolvedBy = mongoose.Types.ObjectId.isValid(user.userId)
                ? new mongoose.Types.ObjectId(user.userId)
                : undefined;

              let createdResource = null;

              if (status === 'approved') {
                createdResource = await Resource.create({
                  name: resourceRequest.name,
                  type: resourceRequest.type,
                  environment: resourceRequest.environment,
                  status: 'healthy',
                  owner: resourceRequest.requestedBy,
                  specs: {
                    cpu: resourceRequest.specs.cpu,
                    ram: resourceRequest.specs.ram,
                    region: resourceRequest.specs.region,
                  },
                });

                resourceRequest.status = 'provisioned';

                await AuditLog.create({
                  action: 'RESOURCE_APPROVED',
                  details: `Approved resource request for "${resourceRequest.name}" (Namespace: ${resourceRequest.environment.toUpperCase()})`,
                  userId: resourceRequest.resolvedBy,
                });

                await AuditLog.create({
                  action: 'PROVISION_SUCCESS',
                  details: `Automatically provisioned ${resourceRequest.type.toUpperCase()} resource "${resourceRequest.name}" successfully via Terraform mock automation script`,
                  userId: resourceRequest.resolvedBy,
                  resourceId: createdResource._id,
                });
              } else {
                await AuditLog.create({
                  action: 'RESOURCE_REJECTED',
                  details: `Rejected resource request for "${resourceRequest.name}". Reason: ${comments || 'No comment provided'}`,
                  userId: resourceRequest.resolvedBy,
                });
              }

              await resourceRequest.save();
              await resourceRequest.populate('requestedBy', 'name email role');
              await resourceRequest.populate('resolvedBy', 'name email role');

              return NextResponse.json({
                request: resourceRequest,
                resource: createdResource,
              });
            }
          }
        } catch (dbErr) {
          console.warn('DB resolve request failed, updating in mock store:', dbErr);
        }

        const result = mockStore.resolveRequest(id, status, comments, user.userId);
        if (!result.request) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (status === 'approved') {
          mockStore.createAuditLog(
            'RESOURCE_APPROVED',
            `Approved resource request for "${result.request.name}" (Namespace: ${result.request.environment.toUpperCase()})`,
            user.userId
          );
          if (result.resource) {
            mockStore.createAuditLog(
              'PROVISION_SUCCESS',
              `Automatically provisioned ${result.request.type.toUpperCase()} resource "${result.request.name}" successfully via Terraform mock automation script`,
              user.userId,
              result.resource._id
            );
          }
        } else {
          mockStore.createAuditLog(
            'RESOURCE_REJECTED',
            `Rejected resource request for "${result.request.name}". Reason: ${comments || 'No comment provided'}`,
            user.userId
          );
        }

        return NextResponse.json(result);
      } catch (error) {
        console.error('Resolve Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
