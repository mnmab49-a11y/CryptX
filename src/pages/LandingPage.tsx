import React, { useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { SecuritySection } from '../components/sections/SecuritySection';
import { AboutSection } from '../components/sections/AboutSection';
import { Footer } from '../components/layout/Footer';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { FeatureItem } from '../types';
import { Lock, Key, Info, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Modal states
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({
    isOpen: false,
    mode: 'login',
  });

  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex flex-col font-sans bg-grid-pattern selection:bg-[#00D4FF]/20 selection:text-[#00D4FF]">
      {/* Top Navigation */}
      <Navbar
        onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <HeroSection
          onGetStarted={() => setAuthModalState({ isOpen: true, mode: 'signup' })}
          onExploreFeatures={() => scrollToSection('features')}
        />

        <FeaturesSection
          onSelectFeature={(feature) => setSelectedFeature(feature)}
        />

        <HowItWorksSection />

        <SecuritySection />

        <AboutSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      />

      {/* --- Interactive Modals (Meaningful Phase 1 Feedback) --- */}

      {/* Authentication Gateway Preview Modal */}
      <Modal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        title={authModalState.mode === 'login' ? 'Account Authentication' : 'Create Secure CryptX Workspace'}
        subtitle={
          authModalState.mode === 'login'
            ? 'Access your encrypted storage vault and key credentials'
            : 'Initialize your cryptographic profile with master key isolation'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#141D2B] border border-[#1E293B] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
            <div className="text-xs text-[#94A3B8]">
              <strong className="text-[#F8FAFC]">Phase 1 Architecture Status:</strong> The frontend foundation is fully active. Live JWT token issuance and PostgreSQL backend authentication will connect in Phase 2 via Python FastAPI.
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                Security Identifier / Email
              </label>
              <input
                type="email"
                placeholder="architect@domain.com"
                readOnly
                value="demo.engineer@cryptx-vault.internal"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1E293B] text-[#F8FAFC] font-mono text-sm focus:outline-none focus:border-[#00D4FF] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                Passphrase / Master Secret
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  readOnly
                  value="DemoSecureKeyDerivation2026!"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1E293B] text-[#F8FAFC] font-mono text-sm focus:outline-none focus:border-[#00D4FF] cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute right-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Planned KEK: 256-bit PBKDF2 with 100,000+ iterations
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                alert('Phase 1 Notice: Frontend foundation initialized successfully. Full FastAPI backend authentication service will be connected in Phase 2.');
                setAuthModalState({ ...authModalState, isOpen: false });
              }}
            >
              {authModalState.mode === 'login' ? 'Proceed to Workspace Preview' : 'Initialize Vault Profile'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthModalState({ ...authModalState, isOpen: false })}
            >
              Close Window
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feature Technical Specification Modal */}
      {selectedFeature && (
        <Modal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          title={selectedFeature.title}
          subtitle={selectedFeature.subtitle}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#F8FAFC] leading-relaxed">
              {selectedFeature.description}
            </p>

            <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-3">
              <h4 className="text-xs font-mono uppercase text-[#00D4FF] font-semibold tracking-wider flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                Target Engineering Specifications
              </h4>
              <ul className="space-y-2">
                {selectedFeature.techSpecs.map((spec) => (
                  <li key={spec} className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-[#141D2B] border border-[#1E293B] text-xs text-[#94A3B8]">
              <span className="text-[#00D4FF] font-bold">Planned API Target: </span>
              <code className="text-slate-300">/api/v1/crypto/{selectedFeature.id}</code> (Python FastAPI with AES-256-GCM cipher streaming).
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFeature(null)}
              >
                Understood
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Privacy Architecture Statement"
        subtitle="University Project Academic Research & Cryptographic Isolation"
        maxWidth="md"
      >
        <div className="space-y-3 text-sm text-[#94A3B8] leading-relaxed">
          <p>
            CryptX is engineered with a strict <strong>Data Sovereignty First</strong> philosophy.
            No unencrypted payload or raw cryptographic master key is ever transmitted to or logged
            on remote servers in plaintext.
          </p>
          <div className="space-y-2 font-mono text-xs text-slate-300 bg-[#080B12] p-3 rounded-lg border border-[#1E293B]">
            <div>• Zero plaintext telemetry</div>
            <div>• Ephemeral memory handling for cipher operations</div>
            <div>• Opaque cloud object indexing with SHA-256 digests</div>
          </div>
          <div className="pt-3 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsPrivacyModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Security Architecture Statement Modal */}
      <Modal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        title="Cryptographic Architecture Statement"
        subtitle="Standardized Algorithms & Transparent Engineering"
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm text-[#94A3B8] leading-relaxed">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Cryptographic Algorithms Baseline</span>
          </div>
          <p>
            CryptX explicitly adheres to modern cryptographic standards. The planned backend
            leverages Python&apos;s authoritative <code>cryptography</code> library with
            OpenSSL bindings.
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B]">
              <span className="text-[#00D4FF] block font-semibold mb-1">Authenticated Cipher</span>
              <span>AES-256-GCM (NIST SP 800-38D)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B]">
              <span className="text-[#3B82F6] block font-semibold mb-1">Integrity Digest</span>
              <span>SHA-256 (FIPS 180-4)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Note: We refrain from unsubstantiated marketing phrases like &ldquo;military-grade&rdquo;
            or speculative &ldquo;unbreakable&rdquo; claims. Security is derived solely from peer-reviewed
            mathematics, authenticated encryption (AEAD), and rigorous key isolation.
          </p>
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsSecurityModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
