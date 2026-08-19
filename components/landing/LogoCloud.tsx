'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
}

// Inline SVG logos with brand-accurate colors and shapes
const BrandLogos: Record<string, React.FC<LogoProps>> = {
  atlan: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,4 18,22 2,22" fill={color}/>
      <text x="24" y="19" fontFamily="sans-serif" fontWeight="800" fontSize="14" fill={color}>atlan</text>
    </svg>
  ),
  Cloudflare: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 155 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="17" rx="8" ry="5" fill="#F6821F" opacity="0.8"/>
      <path d="M16 12c3-1 7 1 8 5H14l2-5z" fill="#FAAD3F" opacity="0.9"/>
      <circle cx="8" cy="17" r="4" fill="#F6821F" opacity="0.7"/>
      <text x="30" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="11" fill={color} letterSpacing="0.5">CLOUDFLARE</text>
    </svg>
  ),
  Datadog: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 115 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="18" height="18" rx="4" fill="#774AA4" opacity="0.85"/>
      <path d="M7 13l3.5 3.5 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="26" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="12" fill={color} letterSpacing="0.3">DATADOG</text>
    </svg>
  ),
  HashiCorp: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2l7 4v8l-7 4-7-4V6l7-4z" fill="#1563FF" opacity="0.85"/>
      <path d="M14 2l7 4v8l-7 4V2z" fill="#000CEB" opacity="0.5"/>
      <text x="28" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="12" fill={color}>HashiCorp</text>
    </svg>
  ),
  AWS: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 75 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="18" fontFamily="sans-serif" fontWeight="900" fontSize="17" fill="#FF9900">aws</text>
      <path d="M3 23q11 5 20 0" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
      <path d="M25 20l3.5-2 1 2.5" fill="#FF9900"/>
    </svg>
  ),
  Docker: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="6" height="5" rx="1" fill="#2496ED" opacity="0.9"/>
      <rect x="9" y="7" width="6" height="5" rx="1" fill="#2496ED" opacity="0.9"/>
      <rect x="16" y="7" width="6" height="5" rx="1" fill="#2496ED" opacity="0.9"/>
      <rect x="9" y="2" width="6" height="5" rx="1" fill="#2496ED" opacity="0.7"/>
      <path d="M2 16c0-2.5 3.5-4 8-3.5C11 10 15 9 18 11c5.5 1 7.5 5 7.5 7H2v-2z" fill="#2496ED" opacity="0.85"/>
      <text x="30" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="13" fill={color}>docker</text>
    </svg>
  ),
  Kubernetes: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 135 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="10" fill="#326CE5" opacity="0.12"/>
      <circle cx="14" cy="14" r="5" fill="#326CE5" opacity="0.9"/>
      <g stroke="#326CE5" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        <line x1="14" y1="4" x2="14" y2="9"/>
        <line x1="14" y1="19" x2="14" y2="24"/>
        <line x1="4" y1="14" x2="9" y2="14"/>
        <line x1="19" y1="14" x2="24" y2="14"/>
        <line x1="7" y1="7" x2="10.5" y2="10.5"/>
        <line x1="17.5" y1="17.5" x2="21" y2="21"/>
        <line x1="21" y1="7" x2="17.5" y2="10.5"/>
        <line x1="10.5" y1="17.5" x2="7" y2="21"/>
      </g>
      <text x="30" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="12" fill={color} letterSpacing="0.2">kubernetes</text>
    </svg>
  ),
  Vercel: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13,3 24,25 2,25" fill={color}/>
      <text x="30" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill={color}>vercel</text>
    </svg>
  ),
  Grafana: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="14" r="9" fill="#F46800" opacity="0.15"/>
      <circle cx="13" cy="14" r="5.5" fill="#F46800" opacity="0.9"/>
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round">
        <line x1="13" y1="5" x2="13" y2="8"/>
        <line x1="13" y1="20" x2="13" y2="23"/>
        <line x1="4" y1="14" x2="7" y2="14"/>
        <line x1="19" y1="14" x2="22" y2="14"/>
      </g>
      <text x="28" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="13" fill={color}>Grafana</text>
    </svg>
  ),
  Terraform: ({ className, color = 'rgba(212,212,216,0.6)' }) => (
    <svg className={className} viewBox="0 0 115 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 4l7 4v8L9 20V4z" fill="#7B42BC" opacity="0.9"/>
      <path d="M17 8.5l7 4v8l-7-4v-8z" fill="#7B42BC" opacity="0.65"/>
      <path d="M9 4l7 4-7 4L2 8l7-4z" fill="#7B42BC" opacity="0.45"/>
      <text x="28" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="12" fill={color} letterSpacing="0.2">terraform</text>
    </svg>
  ),
};

const logos = [
  'atlan', 'Cloudflare', 'Datadog', 'HashiCorp',
  'AWS', 'Docker', 'Kubernetes', 'Vercel', 'Grafana', 'Terraform',
] as const;

type LogoName = typeof logos[number];

function LogoItem({ name }: { name: LogoName }) {
  const Logo = BrandLogos[name];
  return (
    <div className="flex items-center justify-center px-10 shrink-0 group cursor-default">
      <Logo
        className="h-8 w-auto opacity-40 group-hover:opacity-75 transition-opacity duration-300"
      />
    </div>
  );
}

export default function LogoCloud() {
  return (
    <section className="relative py-16 overflow-hidden" id="logos">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #030308, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #030308, transparent)' }} />

      <div className="text-center mb-10">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-zinc-500">
          Trusted by innovative engineering teams
        </p>
      </div>

      {/* Marquee — two duplicated rows for seamless loop */}
      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {logos.map((name, i) => <LogoItem key={`a-${i}`} name={name} />)}
          {logos.map((name, i) => <LogoItem key={`b-${i}`} name={name} />)}
        </div>
        <div className="flex animate-marquee whitespace-nowrap" aria-hidden="true">
          {logos.map((name, i) => <LogoItem key={`c-${i}`} name={name} />)}
          {logos.map((name, i) => <LogoItem key={`d-${i}`} name={name} />)}
        </div>
      </div>
    </section>
  );
}
