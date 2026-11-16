import React, { useState } from 'react';
import {
  KeyRound,
  Key,
  RotateCcw,
  ShieldCheck,
  Lock,
  Cpu,
  Layers,
  Info,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const KeysPage: React.FC = () => {
  const [rotationModalOpen, setRotationModalOpen] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSimulateRotation = () => {
    setRotationModalOpen(false);
    setActionNotice(
      'Notice: Server Master KEK policy is active. DEKs are wrapped using the server-managed master key via NIST AES Key Wrap (RFC 3394) with automatic cryptographic envelope isolation.'
    );
  };

  return (
    <DashboardLayout
      pageTitle="Cryptographic Key Hierarchy & Lifecycle"
      pageDescription="Envelope encryption architecture, key wrapping isolation, and rotation policies."
      breadcrumbs={['Security', 'Key Management']}
    >
      <div className="space-y-6 text-left max-w-6xl">
        {/* Architecture Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start gap-3 text-xs text-[#94A3B8]">
          <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
              Key Hierarchy Architecture (Active Implementation):
            </strong>
            CryptX implements two-tier envelope encryption: Each file or text payload uses a fresh 256-bit AES-GCM Data Encryption Key (DEK). The DEK is wrapped using the Server Master KEK (RFC 3394) and stored with the ciphertext. Raw DEKs are never persisted.
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Visual Key Hierarchy Architecture */}
        <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B] gap-2">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00D4FF]" />
                Envelope Encryption Hierarchy (NIST SP 800-57)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Multi-tier separation prevents master credentials from directly exposing bulk payload ciphers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setRotationModalOpen(true)}
              >
                Rotate KEK
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Key className="w-3.5 h-3.5 text-amber-400" />}
                onClick={() => setRecoveryModalOpen(true)}
              >
                Recovery Keys
              </Button>
            </div>
          </div>

          {/* 3 Tier Key Cards Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Tier 1: Master Key */}
            <div className="p-5 rounded-xl bg-[#141D2B] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
                  Tier 1 &bull; Master Secret
                </span>
                <Badge variant="cyan" size="sm">User Boundary</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00D4FF]" />
                Master Key (MK)
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Protected and hashed using <strong>Argon2id</strong> ($m=65536, t=3, p=4$) with high-entropy cryptographic salt.
              </p>
              <div className="pt-2 border-t border-[#1E293B]/60 text-[11px] font-mono text-slate-400">
                Isolation: Client RAM Only &bull; Never Persisted
              </div>
            </div>

            {/* Tier 2: Key Encryption Key (KEK) */}
            <div className="p-5 rounded-xl bg-[#141D2B] border border-[#3B82F6]/40 space-y-3 relative shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-wider font-bold">
                  Tier 2 &bull; Wrapping Layer
                </span>
                <Badge variant="blue" size="sm">Server KEK</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#3B82F6]" />
                Key Encryption Key (KEK)
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Wraps and unwraps Data Encryption Keys (DEKs). Enables instantaneous <strong>key rotation</strong> without re-encrypting raw files.
              </p>
              <div className="pt-2 border-t border-[#1E293B]/60 text-[11px] font-mono text-[#60A5FA]">
                Algorithm: AES-256 Key Wrap (RFC 3394)
              </div>
            </div>

            {/* Tier 3: Data Encryption Key (DEK) */}
            <div className="p-5 rounded-xl bg-[#141D2B] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  Tier 3 &bull; Payload Sealing
                </span>
                <Badge variant="emerald" size="sm">Per-Object</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Data Encryption Key (DEK)
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Unique 256-bit symmetric key generated per payload. Encrypts documents, text, and images via <strong>AES-256-GCM</strong>.
              </p>
              <div className="pt-2 border-t border-[#1E293B]/60 text-[11px] font-mono text-emerald-400">
                Encapsulation: Sealed inside object header
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Concepts Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Rotation Explanation */}
          <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-[#F8FAFC]">
              <RotateCcw className="w-4 h-4 text-[#00D4FF]" />
              How Key Rotation Protects You
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              When a security team rotates cryptographic keys, re-encrypting gigabytes of cloud storage would be cost-prohibitive and dangerous.
            </p>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              With envelope encryption, only the <strong>Key Encryption Key (KEK)</strong> is regenerated. The wrapped DEKs stored in object headers are re-wrapped under the new KEK. The underlying multi-gigabyte ciphertexts remain untouched and completely secure.
            </p>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B] text-[11px] font-mono text-slate-300">
              Zero Downtime &bull; Sub-Second Envelope Rotation
            </div>
          </Card>

          {/* Key Recovery Explanation */}
          <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-[#F8FAFC]">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Sovereign Key Recovery Philosophy
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Because CryptX never stores your master password in plaintext, conventional &ldquo;reset my password&rdquo; email links cannot decrypt your files.
            </p>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Account recovery relies upon an emergency <strong>Recovery Kit</strong> generated during vault initialization, utilizing split-key secret sharing so you retain total custody over your assets.
            </p>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B] text-[11px] font-mono text-slate-300">
              Zero-Knowledge &bull; Mathematical Proof of Ownership
            </div>
          </Card>
        </div>

        {/* Cryptographic Algorithm Standards & Evaluation Matrix */}
        <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E293B] gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00D4FF]" />
                Cryptographic Algorithm Standards &amp; Architecture Roadmap
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Evaluation of modern authenticated ciphers, key exchange, and digital signatures.
              </p>
            </div>
            <Badge variant="cyan" size="sm">NIST &amp; RFC Compliant</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#94A3B8] bg-[#080B12]">
                  <th className="py-2.5 px-3">ALGORITHM</th>
                  <th className="py-2.5 px-3">PRIMARY USE CASE</th>
                  <th className="py-2.5 px-3">STATUS IN CRYPTX</th>
                  <th className="py-2.5 px-3">ENGINEERING ASSESSMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                <tr className="hover:bg-[#141D2B]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#00D4FF]">AES-256-GCM</td>
                  <td className="py-2.5 px-3 text-[#F8FAFC]">Universal Payload AEAD</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Default Primary</span></td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">Hardware-accelerated via CLMUL instruction set. 128-bit authentication tag guarantees confidentiality and integrity.</td>
                </tr>
                <tr className="hover:bg-[#141D2B]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-200">ChaCha20-Poly1305</td>
                  <td className="py-2.5 px-3 text-[#F8FAFC]">Mobile / ARM AEAD</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">Supported Alternative</span></td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">High-speed software cipher resilient to timing attacks on hardware platforms lacking native AES extensions.</td>
                </tr>
                <tr className="hover:bg-[#141D2B]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-200">XChaCha20-Poly1305</td>
                  <td className="py-2.5 px-3 text-[#F8FAFC]">Extended Nonce Storage</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">Roadmap Target</span></td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">192-bit extended nonce permits random nonce generation without statistical collision risk over billions of files.</td>
                </tr>
                <tr className="hover:bg-[#141D2B]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-200">AES-256-GCM-SIV</td>
                  <td className="py-2.5 px-3 text-[#F8FAFC]">Misuse-Resistant AEAD</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">Roadmap Target</span></td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">RFC 8452 synthetic initialization vector prevents catastrophic confidentiality loss if a nonce is accidentally reused.</td>
                </tr>
                <tr className="hover:bg-[#141D2B]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-200">HPKE / RSA-OAEP</td>
                  <td className="py-2.5 px-3 text-[#F8FAFC]">Asymmetric Multi-User Sharing</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">Roadmap Target</span></td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">Enables sharing encrypted files with another user by encrypting the DEK with their public key without payload re-encryption.</td>
                </tr>
                <tr className="hover:bg-[#141D2B]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-200">Ed25519 / RSA-PSS</td>
                  <td className="py-2.5 px-3 text-[#F8FAFC]">Digital Authenticity &amp; Signatures</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">Roadmap Target</span></td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">Provides cryptographic non-repudiation, mathematically proving an encrypted object originated from its registered owner.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cryptographic Anti-Patterns Box */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Strictly Excluded &amp; Insecure Cryptographic Anti-Patterns</span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              In accordance with strict security engineering standards, CryptX strictly prohibits <strong>AES-ECB mode</strong> (leaks plaintext patterns), unauthenticated <strong>AES-CBC without HMAC</strong> (vulnerable to padding oracle attacks), and toy &ldquo;pixel shuffling / chaotic map&rdquo; visual scramblers which provide zero mathematical security.
            </p>
          </div>
        </Card>

        {/* Key Rotation Simulation Modal */}
        <Modal
          isOpen={rotationModalOpen}
          onClose={() => setRotationModalOpen(false)}
          title="Rotate Key Encryption Key (KEK)"
          subtitle="Envelope Cryptography Lifecycle Workflow"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-[#94A3B8] leading-relaxed">
            <p>
              Initiating a KEK rotation will request a new 256-bit wrapping key from the KMS vault and re-wrap the 12 active Data Encryption Keys in your registry.
            </p>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B] space-y-1 font-mono text-[11px] text-slate-300">
              <div>Target: Vault KEK #2 &rarr; Vault KEK #3</div>
              <div>Estimated Operations: 12 DEK re-wraps</div>
              <div>Estimated Time: ~45 ms</div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRotationModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSimulateRotation}>
                Execute Rotation Simulation
              </Button>
            </div>
          </div>
        </Modal>

        {/* Recovery Key Modal */}
        <Modal
          isOpen={recoveryModalOpen}
          onClose={() => setRecoveryModalOpen(false)}
          title="Vault Emergency Recovery Kit"
          subtitle="Cryptographic Disaster Recovery Parameters"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-[#94A3B8] leading-relaxed">
            <div className="p-3 rounded-lg bg-[#141D2B] border border-amber-500/30 flex items-start gap-2.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Keep recovery parameters stored offline in a secure physical location or air-gapped device.
              </span>
            </div>
            <p>
              Your Recovery Kit exports an emergency cryptographic recovery passphrase capable of reconstructing your Master Key in the event of credential loss.
            </p>
            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setRecoveryModalOpen(false)}>
                Understood
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
