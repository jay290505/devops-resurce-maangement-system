import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import mongoose from 'mongoose';

/**
 * GET /api/requests
 */
export async function GET(req: NextRequest) {
  return requireRole(
    ['admin', 'project_manager', 'devops_engineer', 'viewer'],
    async (_req: NextRequest, user: { userId: string; role: string }) => {
      try {
        try {
          const db = await dbConnect();
          if (db) {
            let query = {};
            if (user.role === 'devops_engineer' || user.role === 'viewer') {
              query = { requestedBy: user.userId };
            }

            const requests = await Request.find(query)
              .populate('requestedBy', 'name email role')
              .populate('resolvedBy', 'name email role')
              .sort({ createdAt: -1 });

            return NextResponse.json(requests);
          }
        } catch (dbErr) {
          console.warn('DB fetch requests failed, using mock store:', dbErr);
        }

        const mockRequests = mockStore.getRequests(user.userId, user.role);
        return NextResponse.json(mockRequests);
      } catch (error) {
        console.error('Fetch Requests Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}

/**
 * POST /api/requests
 */
export async function POST(req: NextRequest) {
  return requireRole(
    ['admin', 'devops_engineer', 'project_manager'],
    async (req: NextRequest, user: { userId: string; role: string }) => {
      try {
        const { name, type, specs, environment, purpose, duration } = await req.json();

        if (!name || !type || !specs || !environment || !purpose || !duration) {
          return NextResponse.json(
            { error: 'Name, type, specs, environment, purpose, and duration are required' },
            { status: 400 }
          );
        }

        try {
          const db = await dbConnect();
          if (db) {
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
              requestedBy: mongoose.Types.ObjectId.isValid(user.userId)
                ? new mongoose.Types.ObjectId(user.userId)
                : undefined,
            });

            await AuditLog.create({
              action: 'RESOURCE_REQUEST',
              details: `Requested ${type.toUpperCase()} resource "${name}" for "${environment.toUpperCase()}" (Specs: ${specs.cpu} cores, ${specs.ram}GB RAM)`,
              userId: mongoose.Types.ObjectId.isValid(user.userId)
                ? new mongoose.Types.ObjectId(user.userId)
                : undefined,
            });

            await newRequest.populate('requestedBy', 'name email role');
            return NextResponse.json(newRequest, { status: 201 });
          }
        } catch (dbErr) {
          console.warn('DB create request failed, creating in mock store:', dbErr);
        }

        const mockReq = mockStore.createRequest({
          name,
          type,
          specs: { cpu: Number(specs.cpu), ram: Number(specs.ram), region: specs.region },
          environment,
          purpose,
          duration: Number(duration),
          userId: user.userId,
        });

        mockStore.createAuditLog(
          'RESOURCE_REQUEST',
          `Requested ${type.toUpperCase()} resource "${name}" for "${environment.toUpperCase()}" (Specs: ${specs.cpu} cores, ${specs.ram}GB RAM)`,
          user.userId
        );

        return NextResponse.json(mockReq, { status: 201 });
      } catch (error) {
        console.error('Create Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req);
}
