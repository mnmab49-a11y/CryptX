import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Hash, 
  KeyRound, 
  CheckCircle,
  FileCheck2,
  Layers
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SecurityPrinciple } from '../../types';

const principles: SecurityPrinciple[] = [
  {
    title: 'Confidentiality',
    tag: 'Payload Secrecy',
    description: 'Protecting information against unauthorized observation. Plaintext is rendered completely indistinguishable from random noise to any eavesdropper or intermediate cloud layer.',
    technicalDetails: [
      'AES-256 block cipher in Galois/Counter Mode',
      'Non-repeating 96-bit initialization vectors (IVs)',
      'Provably resilient against known plaintext and ciphertext attacks'
    ],
    iconName: 'Lock',
  },
  {
    title: 'Integrity',
    tag: 'Tamper Detection',
    description: 'Guarantees that files and messages cannot be altered, substituted, or corrupted without immediate cryptographic invalidation before decryption occurs.',
    technicalDetails: [
      'SHA-256 cryptographic hashing for pre- and post-validation',
      'Bit-exact verification tags prior to object persistence',
      'Silent modification attempts trigger immediate payload rejection'
    ],
    iconName: 'Hash',
  },
  {
    title: 'Secure Key Management',
    tag: 'Lifecycle Isolation',
    description: 'Cryptographic security is strictly bound to key isolation. Key metadata and payload ciphertexts are decoupled and managed through structured access barriers.',
    technicalDetails: [
      'Strict separation of data encryption keys (DEK) & key encryption keys (KEK)',
      'Live Cloud KMS & NIST RFC 3394 envelope encryption architecture',
      'No plaintext keys written to disk or logged in server telemetry'
    ],
    iconName: 'KeyRound',
  },
  {
    title: 'Authenticated Encryption',
    tag: 'Combined Secrecy & Auth',
    description: 'CryptX utilizes Authenticated Encryption with Associated Data (AEAD), combining ciphertext privacy with unforgeable authenticity verification.',
    technicalDetails: [
      'AES-256-GCM as the primary cryptographic standard',
      'Integrated 128-bit authentication MAC tag per encrypted block',
      'Mitigates ciphertext manipulation and padding oracle vulnerabilities'
    ],
    iconName: 'ShieldCheck',
  },
];

export const SecuritySection: React.FC = () => {
  const getIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-[#00D4FF]' };
    switch (iconName) {
      case 'Lock':
        return <Lock {...props} />;
      case 'Hash':
        return <Hash {...props} />;
      case 'KeyRound':
        return <KeyRound {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      default:
        return <ShieldCheck {...props} />;
    }
  };

  return (
    <section id="security" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cyan" size="sm">
            Core Principles
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Security Is Not an Option. It&apos;s Our Foundation.
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg">
            CryptX is designed upon peer-reviewed cryptographic standards, mathematically
            sound algorithms, and explicit threat modeling—without relying on security-through-obscurity
            or unsupported marketing claims.
          </p>
        </div>

        {/* Security Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {principles.map((principle) => (
            <Card
              key={principle.title}
              hoverEffect
              className="p-8 border border-[#1E293B] bg-[#141D2B]/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 rounded-xl bg-[#101622] border border-[#1E293B] shadow-inner">
                    {getIcon(principle.iconName)}
                  </div>
                  <Badge variant="blue" size="sm">
                    {principle.tag}
                  </Badge>
                </div>

                <h3 className="text-2xl font-bold text-[#F8FAFC] mb-3">
                  {principle.title}
                </h3>
                <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6">
                  {principle.description}
                </p>
              </div>

              {/* Technical Bullet Points */}
              <div className="pt-5 border-t border-[#1E293B] space-y-2.5">
                {principle.technicalDetails.map((detail) => (
                  <div
                    key={detail}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-mono"
                  >
                    <CheckCircle className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Algorithm Standards & Transparency Architecture Box */}
        <div className="bg-[#101622] border border-[#1E293B] rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00D4FF]" />
                <h4 className="text-lg font-bold text-[#F8FAFC]">
                  Cryptographic Standard: AES-256-GCM
                </h4>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                CryptX specifies <strong>AES-256-GCM</strong> (Advanced Encryption Standard in
                Galois/Counter Mode with 256-bit symmetric keys) as its primary encryption algorithm.
                GCM provides high-throughput hardware acceleration via CLMUL instruction sets,
                simultaneous data confidentiality, and built-in tamper resistance.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#141D2B] text-[#00D4FF] border border-[#1E293B]">
                  NIST SP 800-38D Compliant
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#141D2B] text-slate-300 border border-[#1E293B]">
                  SHA-256 Digest Validation
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#141D2B] text-slate-300 border border-[#1E293B]">
                  Non-Deterministic 96-bit Nonces
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#141D2B] p-5 rounded-xl border border-[#1E293B] space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between text-[#F8FAFC] pb-2 border-b border-[#1E293B]">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Engineering Standard
                </span>
                <span className="text-emerald-400">Audited Spec</span>
              </div>
              <div className="space-y-1.5 text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Key Length:</span>
                  <span className="text-[#F8FAFC]">256 bits (32 bytes)</span>
                </div>
                <div className="flex justify-between">
                  <span>Block Size:</span>
                  <span className="text-[#F8FAFC]">128 bits</span>
                </div>
                <div className="flex justify-between">
                  <span>Tag Length:</span>
                  <span className="text-[#F8FAFC]">128 bits (16 bytes)</span>
                </div>
                <div className="flex justify-between">
                  <span>Backend Library:</span>
                  <span className="text-[#00D4FF]">Python cryptography</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
