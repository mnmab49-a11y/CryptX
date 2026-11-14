import React, { useState, useEffect } from 'react';
import { Shield, Lock, Cloud, FileText, Image as ImageIcon, Database, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

export const HeroVisual: React.FC = () => {
  const [hexTicker, setHexTicker] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  useEffect(() => {
    const chars = '0123456789abcdef';
    const interval = setInterval(() => {
      let nextHex = '';
      for (let i = 0; i < 64; i++) {
        nextHex += chars[Math.floor(Math.random() * chars.length)];
      }
      setHexTicker(nextHex);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none group">
      {/* Decorative ambient gradient backing */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4FF]/30 to-[#3B82F6]/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

      {/* Main Terminal / Vault Canvas */}
      <div className="relative bg-[#101622]/95 border border-[#1E293B] rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden cyber-card">
        {/* Animated Laser Scanner Bar running across the terminal */}
        <div className="laser-scanner-beam opacity-70" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-[#94A3B8]">
              cryptx-vault-engine // isolation-mode: active
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Central Architecture Schematic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Source Data Card */}
          <div className="bg-[#141D2B] p-3.5 rounded-xl border border-[#1E293B] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Input Stream</span>
              <FileText className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[#F8FAFC]">
                <span>sensitive.pdf</span>
                <span className="text-[10px] text-[#94A3B8]">Plaintext</span>
              </div>
              <div className="flex items-center justify-between text-[#94A3B8] text-[10px]">
                <span>financial_audit.png</span>
                <ImageIcon className="w-3 h-3 text-[#94A3B8]" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E293B]/60 text-[10px] font-mono text-slate-400">
              Format Preserved
            </div>
          </div>

          {/* Central Cryptographic Engine */}
          <div className="bg-gradient-to-b from-[#141D2B] to-[#101622] p-3.5 rounded-xl border border-[#00D4FF]/40 relative overflow-hidden shadow-[0_0_20px_-2px_rgba(0,212,255,0.25)] flex flex-col justify-between">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-[#00D4FF]/5 animate-pulse" />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[11px] font-mono text-[#00D4FF] font-semibold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00D4FF] animate-pulse" />
                Cipher Engine
              </span>
              <Cpu className="w-4 h-4 text-[#00D4FF]" />
            </div>

            <div className="flex flex-col items-center justify-center py-1 relative z-10">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#080B12] border border-[#00D4FF]/50 shadow-inner">
                {/* Radar ripple rings */}
                <span className="absolute inset-0 rounded-full border border-[#00D4FF]/40 animate-ping opacity-30" />
                <span className="absolute -inset-1 rounded-full border border-[#00D4FF]/20 animate-pulse" />
                <Shield className="w-6 h-6 text-[#00D4FF] animate-pulse" />
                <Lock className="w-3 h-3 text-[#3B82F6] absolute" />
              </div>
              <span className="mt-2 font-mono text-[11px] text-[#F8FAFC] font-medium tracking-wide">AES-256-GCM</span>
              <span className="text-[9px] font-mono text-[#94A3B8]">Authenticated IV + Tag</span>
            </div>

            <div className="mt-2 text-center text-[10px] font-mono text-[#00D4FF] bg-[#00D4FF]/10 rounded py-0.5 border border-[#00D4FF]/30 relative z-10">
              Isolated Keys
            </div>
          </div>

          {/* Cloud Storage Vault Card */}
          <div className="bg-[#141D2B] p-3.5 rounded-xl border border-[#1E293B] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Cloud Vault</span>
              <Cloud className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[#00D4FF]">
                <span>blob_9f81a.enc</span>
                <span className="text-[10px] text-emerald-400">Sealed</span>
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate">
                SHA-256: 4a2f7...8b1e
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] font-mono text-emerald-400">
              <span>Verified 256-bit</span>
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Cryptographic Stream Console View */}
        <div className="bg-[#080B12] rounded-xl border border-[#1E293B] p-3.5 font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#94A3B8] text-[11px] pb-1 border-b border-[#1E293B]">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#3B82F6]" />
              Secure Data Ledger Preview
            </span>
            <span className="text-[10px] text-[#00D4FF]">SHA-256 HMAC</span>
          </div>

          <div className="text-[#94A3B8] text-[11px] leading-relaxed pt-1">
            <span className="text-[#3B82F6]">Payload: </span>
            <span className="text-slate-300">payload_multiformat_stream[bytes]</span>
          </div>
          <div className="text-[11px] text-slate-400 break-all leading-tight">
            <span className="text-[#00D4FF]">Ciphertext: </span>
            <span className="text-[#38BDF8] font-semibold">{hexTicker.substring(0, 32)}</span>
            <span className="text-slate-500">{hexTicker.substring(32)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
            <span>Auth Tag: 128-bit GCM MAC</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Integrity Validated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
