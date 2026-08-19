'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Page-level GSAP motion director: master intro, scroll reveals, magnetic/ripple actions. */
export default function PremiumMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(document.body);
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro
        .fromTo(q('[data-motion="logo"]'), { autoAlpha: 0, scale: 0.8, rotate: -7 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1 })
        .fromTo(q('[data-motion="nav"]'), { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=.65')
        .fromTo(q('[data-motion="nav-cta"]'), { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, '-=.35')
        .fromTo(q('[data-motion="hero-badge"]'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.85 }, '-=.1')
        .fromTo(q('[data-motion="hero-eyebrow"]'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, '-=.45')
        .fromTo(q('[data-motion="hero-word"]'), { autoAlpha: 0, y: 54 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, '-=.4')
        .fromTo(q('[data-motion="hero-description"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8 }, '-=.55')
        .fromTo(q('[data-motion="hero-actions"]'), { autoAlpha: 0, y: 20, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }, '-=.5')
        .fromTo(q('[data-motion="dashboard"]'), { autoAlpha: 0, y: 48, scale: 0.92, rotateX: 7 }, { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: 1.1 }, '-=.9')
        .fromTo(q('[data-motion="floating"]'), { autoAlpha: 0, x: (i: number) => i % 2 ? 28 : -28 }, { autoAlpha: 1, x: 0, duration: 0.75, stagger: 0.12 }, '-=.65');

      const badge = q('[data-motion="hero-badge"]');
      const floating = q('[data-motion="floating"]');
      gsap.to(badge, { y: -5, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });
      gsap.to(floating, { y: (i: number) => i % 2 ? 8 : -8, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.18 });

      q('[data-motion-section]').forEach((section) => {
        const children = section.querySelectorAll('[data-motion-item]');
        gsap.fromTo(children.length ? children : section, { autoAlpha: 0, y: 34, scale: 0.985 }, {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: 'power4.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            once: true,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });
      });

      const hero = document.querySelector<HTMLElement>('[data-motion="hero"]');
      const dashboard = document.querySelector<HTMLElement>('[data-motion="dashboard"]');
      if (hero && dashboard) {
        const move = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          gsap.to(dashboard, { rotateY: x * 5, rotateX: -y * 5, x: x * 10, y: y * 8, duration: .8, ease: 'power3.out', overwrite: 'auto' });
        };
        const reset = () => gsap.to(dashboard, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: .9, ease: 'power4.out' });
        hero.addEventListener('pointermove', move, { passive: true }); hero.addEventListener('pointerleave', reset);
        cleanups.push(() => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', reset); });
      }

      q('[data-magnetic]').forEach((node) => {
        const el = node as HTMLElement;
        const move = (event: PointerEvent) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (event.clientX - r.left - r.width / 2) * .14, y: (event.clientY - r.top - r.height / 2) * .14, duration: .35, ease: 'power3.out', overwrite: 'auto' }); };
        const reset = () => gsap.to(el, { x: 0, y: 0, duration: .65, ease: 'elastic.out(1,.45)' });
        el.addEventListener('pointermove', move, { passive: true }); el.addEventListener('pointerleave', reset);
        cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); });
      });

      q('[data-ripple]').forEach((node) => {
        const el = node as HTMLElement;
        const ripple = (event: PointerEvent) => { const r = el.getBoundingClientRect(); const dot = document.createElement('span'); dot.className = 'premium-ripple'; dot.style.left = `${event.clientX - r.left}px`; dot.style.top = `${event.clientY - r.top}px`; el.appendChild(dot); gsap.fromTo(dot, { scale: 0, autoAlpha: .75 }, { scale: 12, autoAlpha: 0, duration: .75, ease: 'power2.out', onComplete: () => dot.remove() }); };
        el.addEventListener('pointerdown', ripple);
        cleanups.push(() => el.removeEventListener('pointerdown', ripple));
      });
      // Defer ScrollTrigger.refresh to the next frame so it doesn't block the
      // initial paint and layout pass.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => { cleanups.forEach((cleanup) => cleanup()); ctx.revert(); };
  }, []);
  return null;
}
