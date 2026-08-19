'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Server, Rocket, LogOut, Terminal, Menu, X, User, Users, AlertTriangle, Layers, Settings, GitPullRequest, ClipboardList } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define nav links dynamically based on user role
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resources', href: '/dashboard/resources', icon: Server },
    { name: 'Deployments', href: '/dashboard/deployments', icon: Rocket },
    { name: 'Requests', href: '/dashboard/requests', icon: GitPullRequest },
    { name: 'Environments', href: '/dashboard/environments', icon: Layers },
    { name: 'Incidents', href: '/dashboard/incidents', icon: AlertTriangle },
  ];

  // Audit/Compliance logs are visible to Admins, PMs, and Auditors/Viewers
  if (['admin', 'project_manager', 'viewer'].includes(user.role)) {
    navLinks.push({ name: 'Audit Logs', href: '/dashboard/audit', icon: ClipboardList });
  }

  // Admin-only: User Management & Settings
  if (user.role === 'admin') {
    navLinks.push({ name: 'Users', href: '/dashboard/users', icon: Users });
    navLinks.push({ name: 'Settings', href: '/dashboard/settings', icon: Settings });
  }


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'devops_engineer':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'project_manager':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').toUpperCase();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header
        className="flex h-16 w-full items-center justify-between border-b px-4 lg:hidden"
        style={{
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-amber-500" />
          <span className="font-semibold tracking-tight">DevOps Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 transition-colors"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderColor: 'var(--theme-sidebar-border)',
          color: 'var(--theme-text-primary)',
        }}
      >
        {/* Logo / Header */}
        <div
          className="flex h-16 items-center justify-between border-b px-6"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">DevOps Platform</span>
          </div>
          {/* Theme toggle visible on desktop inside sidebar header */}
          <ThemeToggle className="hidden lg:flex" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-l-2 border-amber-500 text-amber-500'
                    : ''
                }`}
                style={
                  isActive
                    ? { backgroundColor: 'var(--theme-nav-active-bg)' }
                    : { color: 'var(--theme-text-secondary)' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--theme-nav-hover)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--theme-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    (e.currentTarget as HTMLElement).style.color = 'var(--theme-text-secondary)';
                  }
                }}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-amber-500' : ''}`}
                  style={isActive ? {} : { color: 'var(--theme-text-muted)' }}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Log out */}
        <div className="border-t p-4" style={{ borderColor: 'var(--theme-border)' }}>
          <div
            className="flex flex-col gap-4 rounded-xl border p-4"
            style={{
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-bg-card)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg border"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4
                  className="truncate text-sm font-semibold"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {user.name}
                </h4>
                <p
                  className="truncate text-xs"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span
                className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${getRoleColor(user.role)}`}
              >
                {formatRole(user.role)}
              </span>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-secondary)',
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
