'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks';

export default function RegisterForm() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(name, email, password);
    if (ok) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          Registration successful! Redirecting to login page...
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400" htmlFor="name">
          Full Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <User className="h-4 w-4" />
          </div>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm placeholder-zinc-600 text-zinc-100 outline-none transition duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400" htmlFor="email">
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm placeholder-zinc-600 text-zinc-100 outline-none transition duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••• (Min 6 chars)"
            className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm placeholder-zinc-600 text-zinc-100 outline-none transition duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || success}
        className="flex w-full items-center justify-center rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-zinc-950 transition duration-200 hover:bg-amber-500 active:bg-amber-700 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          'Register'
        )}
      </button>

      <div className="text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-amber-500 hover:text-amber-400 transition-colors">
          Login here
        </Link>
      </div>
    </form>
  );
}
