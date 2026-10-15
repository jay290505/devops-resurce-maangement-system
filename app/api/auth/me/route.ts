import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

/**
 * GET /api/auth/me
 * Fetch the currently logged-in user's profile and role.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Try DB first
    try {
      const db = await dbConnect();
      if (db) {
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          return NextResponse.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          });
        }
      }
    } catch (e) {
      console.warn('DB lookup failed in /api/auth/me, using fallback store:', e);
    }

    // Fallback to mockStore
    const mockUser = mockStore.getUserById(decoded.userId);
    if (mockUser) {
      return NextResponse.json({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    }

    // Default synthesis from token payload
    return NextResponse.json({
      id: decoded.userId,
      name: decoded.role === 'admin' ? 'System Administrator' : 'DevOps User',
      email: decoded.role === 'admin' ? 'admin@devopsplatform.local' : `${decoded.role}@devopsplatform.local`,
      role: decoded.role || 'viewer',
    });
  } catch (error) {
    console.error('Fetch Current User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
