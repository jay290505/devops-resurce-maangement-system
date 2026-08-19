'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/** A deliberately quiet WebGL screensaver layer for the marketing page. */
export default function OrbitalBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // On high-refresh displays (≥90 Hz) prefer the high-performance GPU context
    // so the driver doesn't throttle us back to 60. On battery/low-power devices
    // keep the existing low-power hint.
    const prefersHighRefresh = window.matchMedia('(min-resolution: 120dpi)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: prefersHighRefresh ? 'high-performance' : 'low-power',
    });
    // A 1x canvas keeps frame time low on high-refresh displays while still
    // looking crisp at this low opacity.
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const system = new THREE.Group();
    system.position.set(4.8, -1.4, -3.5);
    system.scale.setScalar(1.08);
    scene.add(system);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.55 }),
    );
    system.add(core);

    const makeOrbit = (radiusX: number, radiusY: number, tilt: number, color: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(64).map((point) => new THREE.Vector3(point.x, point.y, 0));
      const orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32 }),
      );
      orbit.rotation.x = tilt;
      orbit.rotation.z = tilt * 0.35;
      system.add(orbit);
      return orbit;
    };

    const orbitA = makeOrbit(4.2, 1.55, 0.76, 0x6366f1);
    const orbitB = makeOrbit(3.15, 2.1, -0.62, 0x22d3ee);
    const orbitC = makeOrbit(2.5, 0.95, 1.25, 0xa855f7);

    const satellites = [
      { radiusX: 4.2, radiusY: 1.55, speed: 0.42, phase: 0, tilt: 0.76, color: 0x60a5fa, size: 0.16 },
      { radiusX: 3.15, radiusY: 2.1, speed: -0.57, phase: 1.8, tilt: -0.62, color: 0x22d3ee, size: 0.12 },
      { radiusX: 2.5, radiusY: 0.95, speed: 0.72, phase: 3.2, tilt: 1.25, color: 0xc084fc, size: 0.14 },
    ].map((item) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(item.size, 10, 10),
        new THREE.MeshBasicMaterial({ color: item.color, transparent: true, opacity: 0.9 }),
      );
      system.add(mesh);
      return { ...item, mesh };
    });

    const starPositions = new Float32Array(72 * 3);
    for (let i = 0; i < starPositions.length; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 34;
      starPositions[i + 1] = (Math.random() - 0.5) * 22;
      starPositions[i + 2] = -7 - Math.random() * 8;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.035, transparent: true, opacity: 0.32, sizeAttenuation: true }),
    );
    scene.add(stars);

    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) =>
      pointer.set(
        (event.clientX / window.innerWidth - 0.5) * 0.5,
        -(event.clientY / window.innerHeight - 0.5) * 0.35,
      );

    // Debounced resize — avoids triggering multiple expensive setSize calls
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);

    let active = true;
    const onVisibilityChange = () => { active = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let scrolling = false;
    let scrollEndTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      scrolling = true;
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => { scrolling = false; }, 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Yield to Lenis/GSAP during scroll; full rate when idle.
    const IDLE_FPS = 60;
    const SCROLL_FPS = 30;
    let lastFrameTime = 0;

    let startTime = -1;
    renderer.setAnimationLoop((timestamp) => {
      if (!active) return;

      const targetFps = scrolling ? SCROLL_FPS : IDLE_FPS;
      const frameBudget = 1000 / targetFps;
      const delta = timestamp - lastFrameTime;
      if (delta < frameBudget - 1) return;
      lastFrameTime = timestamp - (delta % frameBudget);

      if (startTime < 0) startTime = timestamp;
      const elapsed = (timestamp - startTime) * 0.001; // ms → seconds
      system.rotation.y = elapsed * 0.12 + pointer.x;
      system.rotation.x = pointer.y;
      core.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.08);
      orbitA.rotation.z += 0.0015;
      orbitB.rotation.z -= 0.001;
      orbitC.rotation.z += 0.0018;
      satellites.forEach(({ radiusX, radiusY, speed, phase, tilt, mesh }) => {
        const angle = elapsed * speed + phase;
        mesh.position.set(
          radiusX * Math.cos(angle),
          radiusY * Math.sin(angle) * Math.cos(tilt),
          radiusY * Math.sin(angle) * Math.sin(tilt),
        );
      });
      stars.rotation.y = elapsed * 0.008;
      renderer.render(scene, camera);
    });

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(scrollEndTimer);
      renderer.setAnimationLoop(null);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      starGeometry.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.Points
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50"
      aria-hidden="true"
    />
  );
}
