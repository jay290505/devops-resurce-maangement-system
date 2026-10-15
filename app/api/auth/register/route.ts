import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { error: 'Password must be at least 5 characters long' },
        { status: 400 }
      );
    }

    // 2. Try DB if connected
    try {
      const db = await dbConnect();
      if (db) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email is already registered' },
            { status: 400 }
          );
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'viewer',
        });

        return NextResponse.json(
          {
            message: 'User registered successfully',
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
            },
          },
          { status: 201 }
        );
      }
    } catch (e) {
      console.warn('DB registration failed, creating user in mock store:', e);
    }

    // 3. Fallback to mock store
    const existingMock = mockStore.getUserByEmail(email);
    if (existingMock) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    const newMockUser = mockStore.registerUser(name, email, password);
    return NextResponse.json(
      {
        message: 'User registered successfully (Demo Mode)',
        user: {
          id: newMockUser._id,
          name: newMockUser.name,
          email: newMockUser.email,
          role: newMockUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
