import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/resources
 * Fetch all infrastructure resources.
 * Accessible by all authenticated users (admin, devops_engineer, viewer).
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin', 'devops_engineer', 'viewer'], async (_req: NextRequest) => {
    try {
      await dbConnect();
      
      // Fetch resources, sorting by newest first, and populating owner details
      const resources = await Resource.find({})
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });

      return NextResponse.json(resources);
    } catch (error) {
      console.error('Fetch Resources Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
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

      // 1. Validate fields
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

      await dbConnect();

      // 2. Insert resource to database (owner is injected from the JWT token context)
      const newResource = await Resource.create({
        name: name.trim(),
        type,
        environment,
        status: status || 'healthy',
        owner: new mongoose.Types.ObjectId(user.userId),
        specs: {
          cpu: Number(cpu),
          ram: Number(ram),
          region: region.trim(),
        },
      });

      // Populate owner info for user presentation
      await newResource.populate('owner', 'name email');

      return NextResponse.json(newResource, { status: 201 });
    } catch (error) {
      console.error('Create Resource Error:', error);

      const err = error as { name?: string; errors?: Record<string, { message: string }> };
      // Handle mongoose Validation Errors (e.g. invalid enums)
      if (err.name === 'ValidationError' && err.errors) {
        const messages = Object.values(err.errors).map((val) => val.message);
        return NextResponse.json(
          { error: messages.join(', ') },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  })(req);
}
