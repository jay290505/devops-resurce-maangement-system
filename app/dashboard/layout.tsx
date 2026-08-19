import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
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

  try {
    await dbConnect();
    const userDoc = await User.findById(decoded.userId);

    if (!userDoc) {
      redirect('/login');
    }

    const serializableUser = {
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
    };

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
  } catch (error) {
    console.error('Error loading dashboard user:', error);
    redirect('/login');
  }
}
