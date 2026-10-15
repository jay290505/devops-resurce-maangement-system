import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import mongoose from 'mongoose';

/**
 * GET /api/resources
 * Fetch all infrastructure resources.
 * Accessible by all authenticated users (admin, devops_engineer, viewer).
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer', 'project_manager'], async (_req: NextRequest) => {
    try {
      const db = await dbConnect();
      if (db) {
        const resources = await Resource.find({})
          .populate('owner', 'name email')
          .sort({ createdAt: -1 });

        return NextResponse.json(resources);
      }
    } catch (error) {
      console.warn('DB fetch resources failed, using mock store:', error);
    }

    return NextResponse.json(mockStore.getResources());
  })(req);
}

/**
 * POST /api/resources
 * Create a new virtual resource (Server, DB, Container, Service).
 * Accessible by: admin, devops_engineer.
 */
export async function POST(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer'], async (req: NextRequest, user: { userId: string; role: string }) => {
    try {
      const { name, type, environment, status, specs } = await req.json();

      if (!name || !type || !environment || !specs) {
        return NextResponse.json(
          { error: 'Name, type, environment, and specs are required' },
          { status: 400 }
        );
      }

      const { cpu, ram, region } = specs;
      if (cpu === undefined || ram === undefined || !region) {
        return NextResponse.json(
          { error: 'Specs must contain cpu, ram, and region' },
          { status: 400 }
        );
      }

      try {
        const db = await dbConnect();
        if (db) {
          const newResource = await Resource.create({
            name: name.trim(),
            type,
            environment,
            status: status || 'healthy',
            owner: mongoose.Types.ObjectId.isValid(user.userId)
              ? new mongoose.Types.ObjectId(user.userId)
              : undefined,
            specs: {
              cpu: Number(cpu),
              ram: Number(ram),
              region: region.trim(),
            },
          });

          await newResource.populate('owner', 'name email');
          return NextResponse.json(newResource, { status: 201 });
        }
      } catch (dbErr) {
        console.warn('DB create resource failed, using mock store:', dbErr);
      }

      const mockRes = mockStore.createResource({
        name,
        type,
        environment,
        status,
        specs: { cpu: Number(cpu), ram: Number(ram), region },
        ownerId: user.userId,
      });

      return NextResponse.json(mockRes, { status: 201 });
    } catch (error) {
      console.error('Create Resource Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  })(req);
}
