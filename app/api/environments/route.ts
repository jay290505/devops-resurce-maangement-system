import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Environment from '@/models/Environment';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import { ensureDatabaseSeeded } from '@/lib/seed';
import mongoose from 'mongoose';

/**
 * GET /api/environments
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer', 'project_manager'], async (_req: NextRequest) => {
    try {
      const db = await dbConnect();
      if (db) {
        let environments = await Environment.find({})
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 });

        if (environments.length === 0) {
          await ensureDatabaseSeeded().catch(() => {});
          environments = await Environment.find({})
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        }

        if (environments.length > 0) {
          return NextResponse.json(environments);
        }
      }
    } catch (error) {
      console.warn('DB fetch environments failed, using mock store:', error);
    }

    return NextResponse.json(mockStore.getEnvironments());
  })(req);
}

/**
 * POST /api/environments
 */
export async function POST(req: NextRequest) {
  return requireRole(['admin'], async (req: NextRequest, user: { userId: string; role: string }) => {
    try {
      const { name, description } = await req.json();

      if (!name) {
        return NextResponse.json({ error: 'Environment name is required' }, { status: 400 });
      }

      try {
        const db = await dbConnect();
        if (db) {
          const existing = await Environment.findOne({ name: name.trim() });
          if (existing) {
            return NextResponse.json({ error: 'Environment name already exists' }, { status: 400 });
          }

          const newEnv = await Environment.create({
            name: name.trim(),
            description: description?.trim() || '',
            createdBy: mongoose.Types.ObjectId.isValid(user.userId)
              ? new mongoose.Types.ObjectId(user.userId)
              : undefined,
            status: 'active',
          });

          await newEnv.populate('createdBy', 'name email');
          return NextResponse.json(newEnv, { status: 201 });
        }
      } catch (dbErr) {
        console.warn('DB create environment failed, using mock store:', dbErr);
      }

      const existingMock = mockStore.getEnvironments().find((e) => e.name.toLowerCase() === name.trim().toLowerCase());
      if (existingMock) {
        return NextResponse.json({ error: 'Environment name already exists' }, { status: 400 });
      }

      const mockEnv = mockStore.createEnvironment(name, description || '', user.userId);
      return NextResponse.json(mockEnv, { status: 201 });
    } catch (error) {
      console.error('Create Environment Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}
