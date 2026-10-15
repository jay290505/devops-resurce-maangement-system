'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Terminal, Loader2, ShieldCheck, Wrench, Briefcase, Eye } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@devopsplatform.local');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
      }

      // Successful login - navigate to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    await executeLogin(demoEmail, demoPass);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-12 selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-bg-base)', color: 'var(--theme-text-primary)' }}
    >
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="w-full max-w-lg space-y-6 rounded-2xl border p-8 shadow-2xl backdrop-blur-md"
        style={{
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-bg-surface)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome to DevOps Platform</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            Resource Management, Telemetry & Auto-Provisioning
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{
            borderColor: 'var(--theme-border-soft)',
            backgroundColor: 'var(--theme-bg-card)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              ⚡ 1-Click Demo Login (No DB Required)
            </span>
            <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
              Password: <code className="font-mono text-amber-400">admin</code>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Admin */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@devopsplatform.local', 'admin')}
              className="flex items-center gap-2 p-2.5 rounded-lg border text-left transition hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
            >
              <div className="p-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">Administrator</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--theme-text-muted)' }}>
                  admin (Full Access)
                </div>
              </div>
            </button>

            {/* DevOps Engineer */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('devops-eng@devopsplatform.local', 'admin')}
              className="flex items-center gap-2 p-2.5 rounded-lg border text-left transition hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
            >
              <div className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">DevOps Engineer</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--theme-text-muted)' }}>
                  devops (Pipelines)
                </div>
              </div>
            </button>

            {/* Project Manager */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('pm-lead@devopsplatform.local', 'admin')}
              className="flex items-center gap-2 p-2.5 rounded-lg border text-left transition hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
            >
              <div className="p-1 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">Project Manager</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--theme-text-muted)' }}>
                  pm (Approvals)
                </div>
              </div>
            </button>

            {/* Viewer */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('viewer@devopsplatform.local', 'admin')}
              className="flex items-center gap-2 p-2.5 rounded-lg border text-left transition hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-input)' }}
            >
              <div className="p-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Eye className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">Viewer / Auditor</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--theme-text-muted)' }}>
                  viewer (Read Only)
                </div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              htmlFor="email"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Email Address or Username
            </label>
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin or admin@devopsplatform.local"
                className="block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                htmlFor="password"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                className="block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-zinc-950 transition duration-200 hover:bg-amber-500 active:bg-amber-700 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in to Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-amber-500 hover:text-amber-400 transition-colors">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
