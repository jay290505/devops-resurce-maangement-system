'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Terminal, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Successful login - redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-bg-base)', color: 'var(--theme-text-primary)' }}
    >
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-2xl backdrop-blur-md"
        style={{
          borderColor: 'var(--theme-border)',
          backgroundColor: 'var(--theme-bg-surface)',
        }}
      >
        
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            Sign in to DevOps Resource Management Platform
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              htmlFor="email"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Email Address
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
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-input)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
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
                placeholder="••••••••"
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
            className="flex w-full items-center justify-center rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-zinc-950 transition duration-200 hover:bg-amber-500 active:bg-amber-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
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
