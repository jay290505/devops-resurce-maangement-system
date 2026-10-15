import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  let serializableUser: { name: string; email: string; role: string } | null = null;

  try {
    const db = await dbConnect();
    if (db) {
      const userDoc = await User.findById(decoded.userId);
      if (userDoc) {
        serializableUser = {
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
        };
      }
    }
  } catch (error) {
    console.warn('Could not query user from database, falling back to mock user store:', error);
  }

  // Fallback to mockStore or decoded token info if MongoDB is not connected
  if (!serializableUser) {
    const mockUser = mockStore.getUserById(decoded.userId);
    if (mockUser) {
      serializableUser = {
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      };
    } else {
      serializableUser = {
        name: decoded.role === 'admin' ? 'System Administrator' : 'Platform User',
        email: decoded.role === 'admin' ? 'admin@devopsplatform.local' : `${decoded.role}@devopsplatform.local`,
        role: decoded.role || 'viewer',
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ backgroundColor: 'var(--theme-bg-surface)' }}>
      <Sidebar user={serializableUser} />
      <main
        className="flex-1 overflow-y-auto px-6 py-8 md:px-8 lg:px-10"
        style={{ backgroundColor: 'var(--theme-bg-surface)' }}
      >
        {children}
      </main>
    </div>
  );
}
