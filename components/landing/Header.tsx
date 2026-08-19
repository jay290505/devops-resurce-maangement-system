'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Infinity as InfinityIcon, LogIn, ArrowUpRight, Menu, X } from 'lucide-react';
import { SpotlightNavbar } from '@/components/ui/spotlight-navbar';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Resources', href: '#resources' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#' },
  { label: 'About', href: '#' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 20));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  return (
    <motion.header
      ref={headerRef}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,backdrop-filter,border-color] duration-500${scrolled ? ' header-scrolled' : ''}`}
      style={{
        background: scrolled ? undefined : 'transparent',
        backdropFilter: scrolled ? undefined : 'none',
        borderBottom: scrolled ? undefined : '1px solid transparent',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div variants={itemVariants} data-motion="logo">
            <Link href="/" className="flex items-center gap-2 group" data-magnetic>
              <motion.div
                className="relative flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <InfinityIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: '0 0 20px rgba(124,58,237,0.6)' }} />
              </motion.div>
              <span className="text-sm font-bold tracking-tight text-white">
                DRMS
                <span className="block text-[10px] font-normal text-purple-400 leading-none -mt-0.5 tracking-wider">
                  DevOps Resource Management
                </span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <motion.div variants={itemVariants} data-motion="nav" className="hidden md:block">
            <SpotlightNavbar
              items={navLinks}
              defaultActiveIndex={0}
              className="!border-violet-400/15 !bg-[#080812]/75 !shadow-[0_8px_30px_rgba(0,0,0,.3)] [&_a]:!text-zinc-400 [&_a:hover]:!text-white"
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="hidden md:flex items-center gap-3" data-motion="nav-cta">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              <LogIn className="h-3.5 w-3.5" />
              Log in
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link data-magnetic data-ripple
                href="/register"
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
              >
                Get Started
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Mobile menu toggle */}
          <motion.button
            variants={itemVariants}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10"
            style={{ background: 'rgba(3,3,8,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="block px-3 py-2.5 text-sm text-zinc-400 text-center border border-white/10 rounded-lg hover:border-white/20">
                  Log in
                </Link>
                <Link href="/register" className="block px-3 py-2.5 text-sm font-semibold text-white text-center rounded-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
