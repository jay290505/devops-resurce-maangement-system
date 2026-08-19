'use client';

// Pure CSS aurora background + neon light beams — zero JS animation overhead, 100% GPU composited
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030308]" aria-hidden="true">

      {/* Sweeping Neon Wave / Arc 1 (Violet/Blue gradient beam sweeping across top-left to mid-right) */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[900px] pointer-events-none opacity-40">
        <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g filter="url(#glow-wave)">
            <path
              d="M-100 450 C 300 200, 700 650, 1540 300"
              stroke="url(#gradient-beam-1)"
              strokeWidth="24"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d="M-50 520 C 350 280, 750 720, 1590 380"
              stroke="url(#gradient-beam-2)"
              strokeWidth="8"
              strokeLinecap="round"
              className="opacity-90 animate-pulse"
            />
          </g>
          <defs>
            <filter id="glow-wave" x="-200" y="-100" width="1900" height="1200" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="35" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gradient-beam-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="gradient-beam-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Aurora blob 1 — top-left purple — GPU only */}
      <div
        className="absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full aurora-blob-1 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(59,130,246,0.12) 45%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />

      {/* Aurora blob 2 — top-right blue */}
      <div
        className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full aurora-blob-2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(16,185,129,0.08) 45%, transparent 70%)',
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />

      {/* Aurora blob 3 — center glow pulse */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full aurora-blob-3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Aurora blob 4 — bottom-center teal */}
      <div
        className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full aurora-blob-4 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />

      {/* Static dot grid — CSS background-image */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.6) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #030308, transparent)' }}
      />
    </div>
  );
}
