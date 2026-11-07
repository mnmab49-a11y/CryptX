import React, { ReactNode } from 'react';
import { Shield, KeyRound, ArrowLeft, Lock, ShieldCheck, Database } from 'lucide-react';
import { Link } from '../../router';

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  authMode: 'login' | 'register';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  authMode,
}) => {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex flex-col font-sans bg-grid-pattern selection:bg-[#00D4FF]/20 selection:text-[#00D4FF] relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#00D4FF]/10 via-[#3B82F6]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="border-b border-[#1E293B]/70 bg-[#080B12]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Link */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#00D4FF] rounded-lg p-1"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#101622] border border-[#1E293B] group-hover:border-[#00D4FF]/50 transition-colors">
              <Shield className="w-4 h-4 text-[#00D4FF]" />
              <KeyRound className="w-2.5 h-2.5 text-[#3B82F6] absolute bottom-1.5 right-1.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-[#F8FAFC]">
                CRYPT<span className="text-[#00D4FF]">X</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-semibold">
                v0.1
              </span>
            </div>
          </Link>

          {/* Navigation Action */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#141D2B] border border-transparent hover:border-[#1E293B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono border-l border-[#1E293B] pl-4">
              <span className="text-[#64748B]">
                {authMode === 'login' ? 'Need an account?' : 'Already registered?'}
              </span>
              <Link
                to={authMode === 'login' ? '/register' : '/login'}
                className="text-[#00D4FF] hover:underline font-semibold"
              >
                {authMode === 'login' ? 'Create Account' : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-6">
          {/* Left Column: Security Showcase (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 w-fit">
              <Lock className="w-3.5 h-3.5" />
              Zero Plaintext Exposure
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
                Your Keys Control <br />
                <span className="bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] bg-clip-text text-transparent">
                  Your Digital Sovereignty.
                </span>
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                CryptX decouples user authentication from data decryption. Master keys are
                derived using memory-hard key derivation functions, ensuring unencrypted files
                never exist on remote cloud storage.
              </p>
            </div>

            {/* Architecture Highlights */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#101622] border border-[#1E293B] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] shrink-0 text-[#00D4FF]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC]">Authenticated Encryption</div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    AES-256-GCM cipher with non-repeating 96-bit IVs
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101622] border border-[#1E293B] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] shrink-0 text-[#3B82F6]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC]">Key Envelope Architecture</div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    KEK/DEK separation with planned KMS envelope integration
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101622] border border-[#1E293B] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] shrink-0 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC]">Tamper-Proof Ledger</div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    SHA-256 pre-storage cryptographic verification
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-[#64748B]">
              Ready for Phase 3 FastAPI Integration &bull; REST API /api/v1/auth
            </div>
          </div>

          {/* Right Column: Form Container Card */}
          <div className="lg:col-span-7 w-full max-w-xl mx-auto">
            <div className="bg-[#101622] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Subtle accent border at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D4FF] to-[#3B82F6]" />

              {/* Form Header */}
              <div className="mb-6 space-y-1.5 text-left">
                <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">{title}</h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">{subtitle}</p>
              </div>

              {/* Children (Login / Register Form) */}
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Assurance */}
      <footer className="border-t border-[#1E293B]/70 py-4 text-center text-xs text-[#64748B] font-mono">
        CryptX Platform &bull; Cloud-Based Multi-Format Encryption & Secure Storage &bull; Academic Engineering 2026
      </footer>
    </div>
  );
};
