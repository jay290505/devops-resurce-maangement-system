'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ArrowUpRight, Play, Activity } from 'lucide-react';
import { MorphText } from '@/components/ui/morph-text';

// ── Word-by-word split reveal ────────────────────────────────────
function SplitReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span data-motion="hero-word"
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ── Video Mockup — hero-demo.mp4 ─────────────────────────────────
function VideoMockup({ mouseX, mouseY }: { mouseX: ReturnType<typeof useMotionValue<number>>; mouseY: ReturnType<typeof useMotionValue<number>> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });
  const rotateX = useTransform(springY, [0, 1], [6, -6]);
  const rotateY = useTransform(springX, [0, 1], [-6, 6]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <motion.div data-motion="dashboard"
      className="relative w-full max-w-xl"
      style={{ perspective: 1200, transformStyle: 'preserve-3d', rotateX, rotateY }}
    >
      {/* Outer glow aura */}
      <div
        className="absolute inset-0 rounded-[28px] blur-3xl opacity-70 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.45) 0%, rgba(59,130,246,0.2) 55%, transparent 80%)' }}
      />

      {/* Glass card frame */}
      <motion.div
        className="relative rounded-[22px] overflow-hidden border"
        style={{
          borderColor: 'rgba(139,92,246,0.30)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
          backdropFilter: 'blur(2px)',
        }}
        initial={{ opacity: 0, y: 70, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.0, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}      >
        {/* Fake browser title bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ background: 'rgba(6,6,14,0.95)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono tracking-wider">DRMS — Live Infrastructure Preview</span>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
          </div>
        </div>

        {/* Video */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
          >
            <source src="/hero-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Subtle vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </div>

        {/* Bottom status bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t"
          style={{ background: 'rgba(6,6,14,0.95)', borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span className="text-[9px] text-zinc-500 font-mono">128 resources</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-zinc-500 font-mono">24 deployments</span>
            </div>
          </div>
          <span className="text-[9px] text-zinc-600 font-mono">99.9% uptime</span>
        </div>
      </motion.div>

      {/* Floating badge — left */}
      <motion.div
        data-motion="floating" className="absolute -left-8 top-1/3 rounded-xl px-3 py-2 border backdrop-blur-xl hidden lg:flex items-center gap-1.5"
        style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.35)' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap">All Systems Operational</span>
      </motion.div>

      {/* Floating badge — right */}
      <motion.div
        data-motion="floating" className="absolute -right-8 bottom-1/4 rounded-xl px-3 py-2 border backdrop-blur-xl hidden lg:flex items-center gap-1.5"
        style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.35)' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.7 }}
      >
        <Activity className="h-3 w-3 text-blue-400" />
        <span className="text-[11px] text-blue-400 font-semibold whitespace-nowrap">24 active deployments</span>
      </motion.div>
    </motion.div>
  );
}


// ── Hero Section ─────────────────────────────────────────────────
export default function HeroSection() {
  // useMotionValue: NO React re-renders on mousemove — direct DOM updates
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  useEffect(() => {
    let rafId: number;
    const onMove = (e: MouseEvent) => {
      // Use rAF to throttle to display refresh rate
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX / window.innerWidth);
        mouseY.set(e.clientY / window.innerHeight);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  return (
    <section data-motion="hero" className="relative min-h-screen flex items-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ contain: 'layout' }}>
      {/* Intense Violet/Blue Hero Ambient Glow Beam (matching reference image) */}
      <div
        className="absolute top-1/3 left-[-10%] w-[600px] h-[500px] rounded-full pointer-events-none -z-10 opacity-70"
        style={{
          background: 'radial-gradient(circle at center, rgba(124,58,237,0.35) 0%, rgba(59,130,246,0.15) 50%, transparent 75%)',
          filter: 'blur(90px)',
        }}
      />

      <div className="mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text content */}
          <div className="text-left space-y-6">
            {/* AI Badge */}
            <motion.div
              data-motion="hero-badge" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))',
                borderColor: 'rgba(139,92,246,0.3)',
                color: '#a78bfa',
              }}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>✦ AI-Powered • Intelligent • Automated</span>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              data-motion="hero-eyebrow" className="text-sm font-medium text-zinc-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              DevOps Resource Management System
            </motion.p>

            {/* Hero title — word-by-word */}
            <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-black tracking-tighter leading-[1.05] text-white">
              <SplitReveal text="Manage. Automate." />
              <br />
              <SplitReveal text="Deploy." />
              {' '}
              <motion.span
                data-motion="hero-word" className="bg-clip-text text-transparent animate-gradient-shift"
                style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)' }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                Scale.
              </motion.span>
            </h1>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              <span>Built for</span>
              <MorphText
                words={['AUTOMATION', 'OBSERVABILITY', 'DELIVERY']}
                interval={2400}
                fontSize="0.75rem"
                textClassName="!min-w-[19ch] !text-left !tracking-[0.04em] !text-violet-300"
              />
            </div>

            {/* Paragraph */}
            <motion.p
              data-motion="hero-description" className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              The all-in-one DevOps Resource Management System to streamline your infrastructure, automate workflows, and optimize every resource.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              data-motion="hero-actions" className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/register"
                  data-magnetic data-ripple className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                >
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowUpRight className="relative z-10 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  {/* Pulse ring */}
                  <span className="absolute inset-0 rounded-xl animate-ping opacity-20"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', animationDuration: '2s' }} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <button data-magnetic data-ripple className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <Play className="h-3 w-3 fill-white ml-0.5" />
                  </div>
                  View Live Demo
                </button>
              </motion.div>
            </motion.div>

            {/* Trust line */}
            <motion.p
              className="text-xs text-zinc-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              No credit card required • 14-day free trial
            </motion.p>
          </div>

          {/* Right: Video mockup */}
          <div className="flex justify-center lg:justify-end">
            <VideoMockup mouseX={mouseX} mouseY={mouseY} />
          </div>
        </div>
      </div>
    </section>
  );
}
