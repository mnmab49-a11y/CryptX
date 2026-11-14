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
import { Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from '../router';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
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
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <HeroSection
          onGetStarted={() => navigate('/register')}
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

      {/* --- Informational Modals --- */}

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
              <span className="text-emerald-400 font-bold">Active API Endpoint: </span>
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
