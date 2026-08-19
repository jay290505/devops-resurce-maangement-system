import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import Resource from '@/models/Resource';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * PUT /api/requests/[id]
 * Approve or reject resource allocation requests.
 * Admin / Project Manager only.
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

        await dbConnect();

        const resourceRequest = await Request.findById(id);
        if (!resourceRequest) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (resourceRequest.status !== 'pending') {
          return NextResponse.json({ error: 'Request has already been resolved' }, { status: 400 });
        }

        resourceRequest.status = status;
        resourceRequest.comments = comments || '';
        resourceRequest.resolvedBy = new mongoose.Types.ObjectId(user.userId);

        let createdResource = null;

        if (status === 'approved') {
          // --- 3. AUTO-PROVISION RESOURCE (Workflow Step 3) ---
          // Dynamically insert resource into active inventory, owner is requestedBy user
          createdResource = await Resource.create({
            name: resourceRequest.name,
            type: resourceRequest.type,
            environment: resourceRequest.environment,
            status: 'healthy', // Default healthy on allocation success
            owner: resourceRequest.requestedBy,
            specs: {
              cpu: resourceRequest.specs.cpu,
              ram: resourceRequest.specs.ram,
              region: resourceRequest.specs.region,
            },
          });

          // Update status to 'provisioned' to signal execution complete
          resourceRequest.status = 'provisioned';

          // Log compliance audit log for approval
          await AuditLog.create({
            action: 'RESOURCE_APPROVED',
            details: `Approved resource request for "${resourceRequest.name}" (Namespace: ${resourceRequest.environment.toUpperCase()})`,
            userId: new mongoose.Types.ObjectId(user.userId),
          });

          // Log compliance audit log for auto-provision success
          await AuditLog.create({
            action: 'PROVISION_SUCCESS',
            details: `Automatically provisioned ${resourceRequest.type.toUpperCase()} resource "${resourceRequest.name}" successfully via Terraform mock automation script`,
            userId: new mongoose.Types.ObjectId(user.userId),
            resourceId: createdResource._id,
          });
        } else {
          // Log compliance audit log for rejection
          await AuditLog.create({
            action: 'RESOURCE_REJECTED',
            details: `Rejected resource request for "${resourceRequest.name}". Reason: ${comments || 'No comment provided'}`,
            userId: new mongoose.Types.ObjectId(user.userId),
          });
        }

        await resourceRequest.save();
        await resourceRequest.populate('requestedBy', 'name email role');
        await resourceRequest.populate('resolvedBy', 'name email role');

        return NextResponse.json({
          request: resourceRequest,
          resource: createdResource,
        });
      } catch (error) {
        console.error('Resolve Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
