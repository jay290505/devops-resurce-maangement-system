import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Environment from '@/models/Environment';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * PUT /api/environments/[id]
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const { name, description, status } = await req.json();

        try {
          const db = await dbConnect();
          if (db) {
            const env = await Environment.findById(id);
            if (env) {
              const oldName = env.name;

              if (name !== undefined) {
                const newName = name.trim();
                if (!newName) {
                  return NextResponse.json({ error: 'Environment name cannot be empty' }, { status: 400 });
                }

                if (newName !== oldName) {
                  const existing = await Environment.findOne({ name: newName });
                  if (existing) {
                    return NextResponse.json({ error: 'Environment name already exists' }, { status: 400 });
                  }
                  await Resource.updateMany({ environment: oldName }, { environment: newName });
                }
                env.name = newName;
              }

              if (description !== undefined) env.description = description.trim();
              if (status !== undefined) env.status = status;

              await env.save();
              await env.populate('createdBy', 'name email');
              return NextResponse.json(env);
            }
          }
        } catch (dbErr) {
          console.warn('DB update environment failed, updating mock store:', dbErr);
        }

        const updatedMock = mockStore.updateEnvironment(id, { name, description, status });
        if (!updatedMock) {
          return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
        }

        return NextResponse.json(updatedMock);
      } catch (error) {
        console.error('Update Environment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}

/**
 * DELETE /api/environments/[id]
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (_req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        try {
          const db = await dbConnect();
          if (db) {
            const env = await Environment.findById(id);
            if (env) {
              const resourceCount = await Resource.countDocuments({ environment: env.name });
              if (resourceCount > 0) {
                return NextResponse.json(
                  { error: `Cannot delete environment: ${resourceCount} resource(s) still associated with it.` },
                  { status: 400 }
                );
              }

              await Environment.findByIdAndDelete(id);
              return NextResponse.json({ message: 'Environment deleted successfully', id });
            }
          }
        } catch (dbErr) {
          console.warn('DB delete environment failed, deleting from mock store:', dbErr);
        }

        const res = mockStore.deleteEnvironment(id);
        if (!res.success) {
          return NextResponse.json({ error: res.error || 'Failed to delete environment' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Environment deleted successfully', id });
      } catch (error) {
        console.error('Delete Environment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
