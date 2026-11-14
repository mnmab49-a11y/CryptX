import React from 'react';
import { Shield, KeyRound, Lock } from 'lucide-react';
import { Link } from '../../router';

interface FooterProps {
  onOpenPrivacyModal: () => void;
  onOpenSecurityModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacyModal,
  onOpenSecurityModal,
}) => {
  return (
    <footer className="bg-[#080B12] border-t border-[#1E293B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E293B]/70">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#101622] border border-[#1E293B]">
                <Shield className="w-5 h-5 text-[#00D4FF]" />
                <KeyRound className="w-3 h-3 text-[#3B82F6] absolute bottom-2 right-2" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-wider text-[#F8FAFC]">
                  CRYPT<span className="text-[#00D4FF]">X</span>
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-widest">
                  Secure Storage Platform
                </span>
              </div>
            </div>

            <p className="text-sm text-[#94A3B8] max-w-sm leading-relaxed">
              Cloud-Based Multi-Format Encryption & Secure Storage Platform.
              Empowering users with mathematically grounded data privacy, client-side
              confidentiality, and robust cloud key management.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101622] border border-[#1E293B] text-xs font-mono text-[#94A3B8]">
              <Lock className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Tagline: &ldquo;Your Data. Your Keys. Your Privacy.&rdquo;</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li>
                <a href="#hero" className="hover:text-[#00D4FF] transition-colors">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#00D4FF] transition-colors">
                  Product Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#00D4FF] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#00D4FF] transition-colors">
                  Security Model
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#00D4FF] transition-colors">
                  About CryptX
                </a>
              </li>
              <li className="pt-1 border-t border-[#1E293B]/60">
                <Link to="/login" className="hover:text-[#00D4FF] transition-colors font-medium">
                  Vault Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#00D4FF] transition-colors font-medium">
                  Create Vault Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Cryptography Specs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider font-mono">
              Specifications
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li className="flex items-center justify-between">
                <span>Algorithm:</span>
                <span className="font-mono text-xs text-[#F8FAFC]">AES-256-GCM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Integrity:</span>
                <span className="font-mono text-xs text-[#F8FAFC]">SHA-256</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Key Derivation:</span>
                <span className="font-mono text-xs text-[#F8FAFC]">Argon2id / KEK</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Backend:</span>
                <span className="font-mono text-xs text-[#00D4FF]">FastAPI</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Database:</span>
                <span className="font-mono text-xs text-[#3B82F6]">PostgreSQL</span>
              </li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider font-mono">
              Governance
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacyModal}
                  className="hover:text-[#00D4FF] transition-colors text-left"
                >
                  Privacy Policy Notice
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSecurityModal}
                  className="hover:text-[#00D4FF] transition-colors text-left"
                >
                  Security Architecture Statement
                </button>
              </li>
              <li>
                <span className="text-xs font-mono text-slate-500 block pt-1">
                  Academic University Capstone Project (2026)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>
            &copy; {new Date().getFullYear()} CryptX Project. Cloud-Based Multi-Format Encryption & Secure Storage Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Frontend Foundation v0.1.0 Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
