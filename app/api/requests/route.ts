import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/requests
 * Fetch resource allocation requests.
 * DevOps users see only their own requests.
 * Admins & Project Managers see all requests.
 */
export async function GET(req: NextRequest) {
  return requireRole(
    ['admin', 'project_manager', 'devops_engineer', 'viewer'],
    async (req: NextRequest, user: { userId: string; role: string }) => {
      try {
        await dbConnect();

        let query = {};
        // Filter for devops/viewer to only see their own requests
        if (user.role === 'devops_engineer' || user.role === 'viewer') {
          query = { requestedBy: user.userId };
        }

        const requests = await Request.find(query)
          .populate('requestedBy', 'name email role')
          .populate('resolvedBy', 'name email role')
          .sort({ createdAt: -1 });

        return NextResponse.json(requests);
      } catch (error) {
        console.error('Fetch Requests Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}

/**
 * POST /api/requests
 * DevOps / Team members request a new infrastructure resource.
 */
export async function POST(req: NextRequest) {
  return requireRole(
    ['admin', 'devops_engineer'],
    async (req: NextRequest, user: { userId: string; role: string }) => {
      try {
        const { name, type, specs, environment, purpose, duration } = await req.json();

        if (!name || !type || !specs || !environment || !purpose || !duration) {
          return NextResponse.json(
            { error: 'Name, type, specs, environment, purpose, and duration are required' },
            { status: 400 }
          );
        }

        await dbConnect();

        const newRequest = await Request.create({
          name: name.trim(),
          type,
          specs: {
            cpu: Number(specs.cpu),
            ram: Number(specs.ram),
            region: specs.region.trim(),
          },
          environment: environment.trim(),
          purpose: purpose.trim(),
          duration: Number(duration),
          status: 'pending',
          requestedBy: new mongoose.Types.ObjectId(user.userId),
        });

        // Log the compliance audit log
        await AuditLog.create({
          action: 'RESOURCE_REQUEST',
          details: `Requested ${type.toUpperCase()} resource "${name}" for "${environment.toUpperCase()}" (Specs: ${specs.cpu} cores, ${specs.ram}GB RAM)`,
          userId: new mongoose.Types.ObjectId(user.userId),
        });

        await newRequest.populate('requestedBy', 'name email role');
        return NextResponse.json(newRequest, { status: 201 });
      } catch (error) {
        console.error('Create Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}
