import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Key, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { HeroVisual } from './HeroVisual';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onExploreFeatures,
}) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#00D4FF]/10 via-[#3B82F6]/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Top Security Pill */}
            <div className="inline-flex items-center gap-2">
              <Badge
                variant="cyan"
                size="md"
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Next-Gen Multi-Format Cryptography
              </Badge>
              <Badge
                variant="neutral"
                size="md"
                className="hidden sm:inline-flex"
              >
                AES-256-GCM Architecture
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.12]">
              Your Data.{' '}
              <span className="text-shimmer">
                Your Keys.
              </span>{' '}
              Your Privacy.
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Protect your digital world with powerful encryption and secure cloud storage.
              Encrypt text, files, and images with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={onGetStarted}
                className="w-full sm:w-auto shadow-lg"
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onExploreFeatures}
                className="w-full sm:w-auto"
              >
                Explore Features
              </Button>
            </div>

            {/* Trust and Key Security Highlights */}
            <div className="pt-6 sm:pt-8 border-t border-[#1E293B]/70 grid grid-cols-3 gap-3 sm:gap-6 text-left">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-[#F8FAFC]">
                    Multi-Format
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#94A3B8]">
                    Text, Docs, & Images
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] shrink-0">
                  <Key className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-[#F8FAFC]">
                    Key Isolation
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#94A3B8]">
                    Controlled Access
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] shrink-0">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-[#F8FAFC]">
                    Integrity First
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#94A3B8]">
                    SHA-256 Validation
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Vault Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
};
