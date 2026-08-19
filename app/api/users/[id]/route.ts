import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

/**
 * PUT /api/users/[id]
 * Update a user's role.
 * Admin only.
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;
        const { role } = await req.json();

        if (!role || !['admin', 'devops_engineer', 'project_manager', 'viewer'].includes(role)) {
          return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
        }

        // Prevent self-demotion to avoid losing admin access
        if (user.userId === id && role !== 'admin') {
          return NextResponse.json({ error: 'Admins cannot demote themselves' }, { status: 400 });
        }

        await dbConnect();
        const userDoc = await User.findById(id);
        if (!userDoc) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        userDoc.role = role;
        await userDoc.save();

        return NextResponse.json({
          _id: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          createdAt: userDoc.createdAt,
        });
      } catch (error) {
        console.error('Update User Role Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}

/**
 * DELETE /api/users/[id]
 * Remove user account from database.
 * Admin only.
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return requireRole(
    ['admin'],
    async (_req: NextRequest, user: { userId: string; role: string }, ctx: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await ctx.params;

        // Prevent self-deletion
        if (user.userId === id) {
          return NextResponse.json({ error: 'Admins cannot delete their own accounts' }, { status: 400 });
        }

        await dbConnect();
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully', id });
      } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  )(req, context);
}
