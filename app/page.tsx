'use client';

import AnimatedBackground from '@/components/landing/AnimatedBackground';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import OrbitalBackground from '@/components/landing/OrbitalBackground';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import LogoCloud from '@/components/landing/LogoCloud';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ResourceShowcase from '@/components/landing/ResourceShowcase';
import VengeanceShowcaseSection from '@/components/landing/VengeanceShowcaseSection';
import MetricsStrip from '@/components/landing/MetricsStrip';
import HowItWorks from '@/components/landing/HowItWorks';
import TestimonialSection from '@/components/landing/TestimonialSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import PremiumMotion from '@/components/landing/PremiumMotion';

export default function LandingPage() {
  useSmoothScroll();

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#030308' }}>
      {/* Fixed animated background */}
      <AnimatedBackground />
      <OrbitalBackground />
      <PremiumMotion />

      {/* Page sections */}
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <LogoCloud />
        <FeaturesGrid />
        <ResourceShowcase />
        <VengeanceShowcaseSection />
        <MetricsStrip />
        <HowItWorks />
        <TestimonialSection />
        <CTASection />
      </main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
