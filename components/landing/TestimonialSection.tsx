'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';

// Isometric 3D glowing cube component
function IsometricCube({ x, y, delay, color = '#8b5cf6', scale = 1 }: { x: number; y: number; delay: number; color?: string; scale?: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: `scale(${scale})` }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{ opacity: { duration: 0.8, delay }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay } }}
    >
      <div className="relative w-20 h-20 pointer-events-none" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(-45deg)' }}>
        {/* Top face */}
        <div
          className="absolute inset-0 rounded-md border"
          style={{
            background: `linear-gradient(135deg, ${color}cc, ${color}40)`,
            borderColor: `${color}`,
            boxShadow: `0 0 25px ${color}aa, inset 0 0 15px ${color}66`,
          }}
        />
        {/* Left side face */}
        <div
          className="absolute w-20 h-10 -bottom-10 left-0 origin-top rounded-b-md"
          style={{
            background: `linear-gradient(180deg, ${color}66, rgba(10,10,20,0.8))`,
            transform: 'rotateX(-90deg)',
            borderLeft: `1px solid ${color}44`,
            borderBottom: `1px solid ${color}44`,
          }}
        />
        {/* Right side face */}
        <div
          className="absolute w-10 h-20 -right-10 top-0 origin-left rounded-r-md"
          style={{
            background: `linear-gradient(90deg, ${color}88, rgba(10,10,20,0.8))`,
            transform: 'rotateY(90deg)',
            borderRight: `1px solid ${color}44`,
            borderBottom: `1px solid ${color}44`,
          }}
        />
      </div>
    </motion.div>
  );
}

export default function TestimonialSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section data-motion-section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" id="testimonial">
      <div className="mx-auto max-w-7xl">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Testimonial glass card */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative p-8 sm:p-10 rounded-[24px] border backdrop-blur-xl"
              style={{
                background: 'rgba(8,8,18,0.75)',
                borderColor: 'rgba(139,92,246,0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Top reflection light */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-t-[24px]" />

              {/* Quote icon mark */}
              <div
                className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-purple-400 font-serif text-3xl font-bold"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                “
              </div>

              {/* Quote text */}
              <blockquote className="mb-8 text-base sm:text-lg leading-relaxed text-zinc-200 font-medium">
                DRMS has transformed how we manage our infrastructure. The automation and insights have helped us reduce deployment time by 80%.
              </blockquote>

              {/* Author info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="h-11 w-11 rounded-full overflow-hidden border border-purple-500/40 flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
                  >
                    SJ
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sarah Johnson</p>
                  <p className="text-xs text-zinc-400">DevOps Engineer at TechCo</p>
                </div>
              </div>

              {/* Pagination dots */}
              <div className="flex gap-2 mt-8">
                <div className="h-2 w-6 rounded-full bg-purple-500" />
                <div className="h-2 w-2 rounded-full bg-white/20" />
                <div className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>
          </motion.div>

          {/* Right: Isometric 3D glowing cube grid */}
          <motion.div
            className="lg:col-span-6 relative h-[360px] hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Perspective Grid Plane */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(600px) rotateX(60deg) rotateZ(-30deg) scale(1.4)',
                transformOrigin: 'center center',
              }}
            />

            {/* Glowing Cubes Matrix */}
            <IsometricCube x={20} y={15} delay={0.2} color="#a78bfa" scale={1.1} />
            <IsometricCube x={55} y={20} delay={0.4} color="#3b82f6" scale={0.95} />
            <IsometricCube x={35} y={48} delay={0.6} color="#8b5cf6" scale={1.25} />
            <IsometricCube x={70} y={55} delay={0.8} color="#06b6d4" scale={0.9} />
            <IsometricCube x={15} y={65} delay={1.0} color="#7c3aed" scale={0.85} />

            {/* Glowing Ambient Radial light */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(6,182,212,0.1) 50%, transparent 75%)',
                  filter: 'blur(50px)',
                }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
