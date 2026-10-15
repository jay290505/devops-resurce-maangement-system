import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * GET /api/resources/[id]
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer', 'viewer', 'project_manager'],
    async (_req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        try {
          const db = await dbConnect();
          if (db) {
            const resource = await Resource.findById(id).populate('owner', 'name email');
            if (resource) return NextResponse.json(resource);
          }
        } catch (dbErr) {
          console.warn('DB single resource error, checking mock store:', dbErr);
        }

        const mockRes = mockStore.getResourceById(id);
        if (!mockRes) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }
        return NextResponse.json(mockRes);
      } catch (error) {
        console.error('Fetch Single Resource Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}

/**
 * PUT /api/resources/[id]
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin', 'devops_engineer'],
    async (req: NextRequest, _user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const body = await req.json();

        try {
          const db = await dbConnect();
          if (db) {
            const resource = await Resource.findById(id);
            if (resource) {
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
            }
          }
        } catch (dbErr) {
          console.warn('DB update resource error, updating mock store:', dbErr);
        }

        const updatedMock = mockStore.updateResource(id, body);
        if (!updatedMock) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }
        return NextResponse.json(updatedMock);
      } catch (error) {
        console.error('Update Resource Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}

/**
 * DELETE /api/resources/[id]
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
            const deleted = await Resource.findByIdAndDelete(id);
            if (deleted) {
              return NextResponse.json({ message: 'Resource deleted successfully', id });
            }
          }
        } catch (dbErr) {
          console.warn('DB delete resource error, deleting from mock store:', dbErr);
        }

        const deletedMock = mockStore.deleteResource(id);
        if (!deletedMock) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Resource deleted successfully', id });
      } catch (error) {
        console.error('Delete Resource Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
