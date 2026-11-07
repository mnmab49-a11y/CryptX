import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from '../router';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center bg-grid-pattern relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00D4FF]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-md w-full bg-[#101622] border border-[#1E293B] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#141D2B] border border-[#1E293B] flex items-center justify-center mx-auto text-[#00D4FF] shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#00D4FF]">
            Status Code 404
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">
            Encrypted Block Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            The cryptographic route you attempted to access does not exist or has been
            relocated within the platform architecture.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B] font-mono text-[11px] text-slate-400">
          <span>Target Cipher Coordinate: </span>
          <span className="text-[#00D4FF]">{window.location.pathname}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Return to Home
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Lock className="w-4 h-4" />}
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
        </div>

        <div className="pt-2 text-xs font-mono text-[#64748B]">
          CryptX Secure Vault &bull; <Link to="/" className="text-[#94A3B8] hover:text-[#F8FAFC]">Overview</Link>
        </div>
      </div>
    </div>
  );
};
