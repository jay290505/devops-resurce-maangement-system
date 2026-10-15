import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import { ensureDatabaseSeeded } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = body.email;
    const rawPassword = body.password;
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    const password = typeof rawPassword === 'string' ? rawPassword : '';

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let lookupEmail = email;
    if (email === 'admin') lookupEmail = 'admin@devopsplatform.local';
    else if (email === 'devops') lookupEmail = 'devops-eng@devopsplatform.local';
    else if (email === 'pm') lookupEmail = 'pm-lead@devopsplatform.local';
    else if (email === 'viewer') lookupEmail = 'viewer@devopsplatform.local';

    let authenticatedUser: { id: string; name: string; email: string; role: string } | null = null;

    // 2. Try Database if connected
    try {
      const db = await dbConnect();
      if (db) {
        // Guarantee database is populated with sample users & collections
        await ensureDatabaseSeeded().catch((e) => console.warn('Login auto-seed warning:', e));

        let user = await User.findOne({ email: lookupEmail }).select('+password');
        if (!user && email !== lookupEmail) {
          user = await User.findOne({ email }).select('+password');
        }

        if (user) {
          const isMatch = user.password ? await comparePassword(password, user.password) : false;
          // Accept correct password or default 'admin' fallback
          if (isMatch || password === 'admin') {
            authenticatedUser = {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
      }
    } catch (dbErr) {
      console.warn('Database query failed during login, checking in-memory store:', dbErr);
    }

    // 3. Fallback to in-memory mock store if DB is unavailable or user was not in DB
    if (!authenticatedUser) {
      const mockUser = mockStore.authenticate(email, password);
      if (mockUser) {
        authenticatedUser = {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Invalid email or password. Use email: admin / password: admin' },
        { status: 401 }
      );
    }

    // 4. Generate signed JWT token
    const token = generateToken(authenticatedUser.id, authenticatedUser.role);

    // 5. Set token cookie and return response
    const response = NextResponse.json({
      message: 'Login successful',
      user: authenticatedUser,
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
