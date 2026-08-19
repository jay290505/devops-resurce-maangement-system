import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/resources/[id]
 * Fetch details of a single infrastructure resource.
 * Accessible by: admin, devops_engineer, viewer.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer', 'viewer'],
    async (_req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        await dbConnect();
        const resource = await Resource.findById(id).populate('owner', 'name email');

        if (!resource) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json(resource);
      } catch (error) {
        console.error('Fetch Single Resource Error:', error);

        const err = error as { name?: string };
        if (err.name === 'CastError') {
          return NextResponse.json({ error: 'Invalid Resource ID format' }, { status: 400 });
        }

        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    }
  )(req, context);
}

/**
 * PUT /api/resources/[id]
 * Update specifications, status, environment, type, or name of a resource.
 * Accessible by: admin, devops_engineer.
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer'],
    async (req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const body = await req.json();

        await dbConnect();
        const resource = await Resource.findById(id);

        if (!resource) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // Update fields if provided in request body
        if (body.name !== undefined) resource.name = body.name.trim();
        if (body.type !== undefined) resource.type = body.type;
        if (body.environment !== undefined) resource.environment = body.environment;
        if (body.status !== undefined) resource.status = body.status;
        if (body.specs !== undefined) {
          resource.specs = {
            cpu: body.specs.cpu !== undefined ? Number(body.specs.cpu) : resource.specs.cpu,
            ram: body.specs.ram !== undefined ? Number(body.specs.ram) : resource.specs.ram,
            region: body.specs.region !== undefined ? body.specs.region.trim() : resource.specs.region,
          };
        }

        const updatedResource = await resource.save();
        await updatedResource.populate('owner', 'name email');

        return NextResponse.json(updatedResource);
      } catch (error) {
        console.error('Update Resource Error:', error);

        const err = error as { name?: string; errors?: Record<string, { message: string }> };
        if (err.name === 'CastError') {
          return NextResponse.json({ error: 'Invalid Resource ID format' }, { status: 400 });
        }

        if (err.name === 'ValidationError' && err.errors) {
          const messages = Object.values(err.errors).map((val) => val.message);
          return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    }
  )(req, context);
}

/**
 * DELETE /api/resources/[id]
 * Delete a resource from the system entirely.
 * Accessible by: admin only.
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (_req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        await dbConnect();
        const deletedResource = await Resource.findByIdAndDelete(id);

        if (!deletedResource) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({
          message: 'Resource deleted successfully',
          id,
        });
      } catch (error) {
        console.error('Delete Resource Error:', error);

        const err = error as { name?: string };
        if (err.name === 'CastError') {
          return NextResponse.json({ error: 'Invalid Resource ID format' }, { status: 400 });
        }

        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    }
  )(req, context);
}
