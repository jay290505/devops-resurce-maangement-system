'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-lg
        border transition-all duration-200 ease-in-out
        ${isDark
          ? 'border-zinc-700 bg-zinc-800 text-amber-400 hover:bg-zinc-700 hover:text-amber-300'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
        }
        ${className}
      `}
    >
      <span
        className={`absolute transition-all duration-300 ${
          isDark ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'
        }`}
      >
        <Sun className="h-4 w-4" />
      </span>
      <span
        className={`absolute transition-all duration-300 ${
          isDark ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
        }`}
      >
        <Moon className="h-4 w-4" />
      </span>
    </button>
  );
}
