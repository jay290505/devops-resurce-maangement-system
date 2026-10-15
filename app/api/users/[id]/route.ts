import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

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

        try {
          const db = await dbConnect();
          if (db) {
            const userDoc = await User.findById(id);
            if (userDoc) {
              userDoc.role = role;
              await userDoc.save();

              return NextResponse.json({
                _id: userDoc._id,
                name: userDoc.name,
                email: userDoc.email,
                role: userDoc.role,
                createdAt: userDoc.createdAt,
              });
            }
          }
        } catch (dbErr) {
          console.warn('DB update user role failed, updating in mock store:', dbErr);
        }

        const updated = mockStore.updateUserRole(id, role);
        if (!updated) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          createdAt: updated.createdAt,
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

        if (user.userId === id) {
          return NextResponse.json({ error: 'Admins cannot delete their own accounts' }, { status: 400 });
        }

        try {
          const db = await dbConnect();
          if (db) {
            const deletedUser = await User.findByIdAndDelete(id);
            if (deletedUser) {
              return NextResponse.json({ message: 'User deleted successfully', id });
            }
          }
        } catch (dbErr) {
          console.warn('DB delete user failed, deleting from mock store:', dbErr);
        }

        const deleted = mockStore.deleteUser(id);
        if (!deleted) {
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
