'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { animate } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
}

export interface SpotlightNavbarProps {
  items?: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem, index: number) => void;
  defaultActiveIndex?: number;
}

export function SpotlightNavbar({
  items = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Events', href: '#events' },
  ],
  className,
  onItemClick,
  defaultActiveIndex = 0,
}: SpotlightNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Refs for the "light" positions so we can animate them imperatively
  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      // Direct update for immediate feedback
      spotlightX.current = x;
      nav.style.setProperty('--spotlight-x', `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      // When mouse leaves, spring the spotlight back to the active item
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
      if (activeItem) {
        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + itemRect.width / 2;

        animate(spotlightX.current, targetX, {
          type: 'spring',
          stiffness: 200,
          damping: 20,
          onUpdate: (v) => {
            spotlightX.current = v;
            nav.style.setProperty('--spotlight-x', `${v}px`);
          },
        });
      }
    };

    nav.addEventListener('mousemove', handleMouseMove);
    nav.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      nav.removeEventListener('mousemove', handleMouseMove);
      nav.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeIndex]);

  // Handle the "Ambience" (Active Item) Movement
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;

      animate(ambienceX.current, targetX, {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty('--ambience-x', `${v}px`);
        },
      });
    }
  }, [activeIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    onItemClick?.(item, index);
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        'spotlight-nav-container relative flex h-10 items-center rounded-full bg-white/80 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 px-1.5 shadow-md overflow-hidden transition-all duration-300 backdrop-blur-md',
        className
      )}
    >
      {/* Content Link List */}
      <ul className="relative flex items-center h-full gap-1.5 z-10">
        {items.map((item, idx) => (
          <li key={idx} className="relative h-full flex items-center justify-center">
            <Link
              href={item.href}
              data-index={idx}
              onClick={() => {
                handleItemClick(item, idx);
              }}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors duration-250 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50',
                activeIndex === idx
                  ? 'text-violet-600 font-bold dark:text-violet-300'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 1. Moving Spotlight Trail (Follows Mouse) */}
      <div
        className="pointer-events-none absolute inset-0 z-1 transition-opacity duration-300"
        style={{
          opacity: hoverX !== null ? 1 : 0,
          background: `
            radial-gradient(
              90px circle at var(--spotlight-x) 100%, 
              var(--spotlight-color, rgba(245, 158, 11, 0.12)) 0%, 
              transparent 70%
            )
          `,
        }}
      />

      {/* 2. Active Indicator Light Line (On active index) */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] z-2"
        style={{
          background: `
            radial-gradient(
              45px circle at var(--ambience-x) 0%, 
              var(--ambience-color, #f59e0b) 0%, 
              transparent 100%
            )
          `,
        }}
      />

      {/* Styled variables for dynamic glow themes */}
      <style>{`
        .spotlight-nav-container {
          --spotlight-color: rgba(139, 92, 246, 0.20);
          --ambience-color: #8b5cf6;
        }
      `}</style>
    </nav>
  );
}

export default SpotlightNavbar;
