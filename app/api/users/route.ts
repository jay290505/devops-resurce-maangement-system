import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/users
 * Fetch all users (profiles, email, roles).
 * Admin only.
 */
export async function GET(req: NextRequest) {
  return requireRole(['admin'], async (_req: NextRequest) => {
    try {
      await dbConnect();
      const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
      return NextResponse.json(users);
    } catch (error) {
      console.error('Fetch Users Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(req);
}
