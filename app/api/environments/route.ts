import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Environment from '@/models/Environment';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/environments
 * Fetch all environments (active & archived).
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer'], async (_req: NextRequest) => {
    try {
      await dbConnect();
      const environments = await Environment.find({})
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      return NextResponse.json(environments);
    } catch (error) {
      console.error('Fetch Environments Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}

/**
 * POST /api/environments
 * Create a new dynamic environment.
 * Admin only.
 */
export async function POST(req: NextRequest) {
  return requireRole(['admin'], async (req: NextRequest, user: { userId: string; role: string }) => {
    try {
      const { name, description } = await req.json();

      if (!name) {
        return NextResponse.json({ error: 'Environment name is required' }, { status: 400 });
      }

      await dbConnect();

      // Check if name is unique
      const existing = await Environment.findOne({ name: name.trim() });
      if (existing) {
        return NextResponse.json({ error: 'Environment name already exists' }, { status: 400 });
      }

      const newEnv = await Environment.create({
        name: name.trim(),
        description: description?.trim() || '',
        createdBy: new mongoose.Types.ObjectId(user.userId),
        status: 'active',
      });

      await newEnv.populate('createdBy', 'name email');
      return NextResponse.json(newEnv, { status: 201 });
    } catch (error) {
      console.error('Create Environment Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}
