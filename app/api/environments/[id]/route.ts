import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Environment from '@/models/Environment';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';

/**
 * PUT /api/environments/[id]
 * Rename, update description, or change status (active/archived).
 * Admin only.
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const { name, description, status } = await req.json();

        await dbConnect();
        const env = await Environment.findById(id);
        if (!env) {
          return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
        }

        const oldName = env.name;

        if (name !== undefined) {
          const newName = name.trim();
          if (!newName) {
            return NextResponse.json({ error: 'Environment name cannot be empty' }, { status: 400 });
          }
          
          // If changing name, verify uniqueness
          if (newName !== oldName) {
            const existing = await Environment.findOne({ name: newName });
            if (existing) {
              return NextResponse.json({ error: 'Environment name already exists' }, { status: 400 });
            }

            // Cascade name update to linked resources
            await Resource.updateMany({ environment: oldName }, { environment: newName });
          }
          env.name = newName;
        }

        if (description !== undefined) env.description = description.trim();
        if (status !== undefined) env.status = status;

        await env.save();
        await env.populate('createdBy', 'name email');

        return NextResponse.json(env);
      } catch (error) {
        console.error('Update Environment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}

/**
 * DELETE /api/environments/[id]
 * Delete environment only if no resources are associated with it.
 * Admin only.
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (_req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        await dbConnect();
        const env = await Environment.findById(id);
        if (!env) {
          return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
        }

        // Check if resources are still associated with this environment
        const resourceCount = await Resource.countDocuments({ environment: env.name });
        if (resourceCount > 0) {
          return NextResponse.json(
            { error: `Cannot delete environment: ${resourceCount} resource(s) still associated with it.` },
            { status: 400 }
          );
        }

        await Environment.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Environment deleted successfully', id });
      } catch (error) {
        console.error('Delete Environment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
