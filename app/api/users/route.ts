import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import { ensureDatabaseSeeded } from '@/lib/seed';

/**
 * GET /api/users
 * Fetch all users (profiles, email, roles).
 * Admin only.
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin'], async (_req: NextRequest) => {
    try {
      try {
        const db = await dbConnect();
        if (db) {
          let users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
          if (users.length < 4) {
            await ensureDatabaseSeeded().catch(() => {});
            users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
          }
          if (users.length > 0) {
            return NextResponse.json(users);
          }
        }
      } catch (dbErr) {
        console.warn('DB fetch users error, using mock store:', dbErr);
      }

      return NextResponse.json(mockStore.getUsers());
    } catch (error) {
      console.error('Fetch Users Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}
