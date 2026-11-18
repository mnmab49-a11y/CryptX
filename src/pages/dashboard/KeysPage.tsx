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
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Trash2
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
  const [keyName, setKeyName] = useState('');
  const [userPassphrase, setUserPassphrase] = useState('');
  const [managedKeys, setManagedKeys] = useState<Array<{ id: string; name: string; value: string }>>([]);
  const [showUserPassphrase, setShowUserPassphrase] = useState(false);
  const [showManagedKeys, setShowManagedKeys] = useState(false);
  const [passphraseNotice, setPassphraseNotice] = useState<string | null>(null);
  const [passphraseError, setPassphraseError] = useState<string | null>(null);

  const handleGeneratePassphrase = () => {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    setUserPassphrase(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
    setShowUserPassphrase(true);
    setPassphraseNotice('A random 256-bit passphrase was generated. Add it to the in-memory key list to manage it here.');
    setPassphraseError(null);
  };

  const handleAddKey = () => {
    setPassphraseNotice(null);
    setPassphraseError(null);
    if (!keyName.trim() || !userPassphrase.trim()) {
      setPassphraseError('Enter both a key name and a passphrase before adding the key.');
      return;
    }

    const idBytes = new Uint8Array(16);
    window.crypto.getRandomValues(idBytes);
    setManagedKeys((keys) => [
      ...keys,
      {
        id: Array.from(idBytes, (byte) => byte.toString(16).padStart(2, '0')).join(''),
        name: keyName.trim(),
        value: userPassphrase,
      },
    ]);
    setKeyName('');
    setUserPassphrase('');
    setShowUserPassphrase(false);
    setPassphraseNotice('Key added to this session’s in-memory key list.');
  };

  const handleCopyKey = async (value: string) => {
    setPassphraseNotice(null);
    setPassphraseError(null);
    try {
      await navigator.clipboard.writeText(value);
      setPassphraseNotice('Key copied to clipboard.');
    } catch {
      setPassphraseError('Could not access the clipboard. Reveal the key and copy it manually.');
    }
  };

  const handleClearDraft = () => {
    setKeyName('');
    setUserPassphrase('');
    setShowUserPassphrase(false);
    setPassphraseNotice('The unsaved key entry has been cleared.');
    setPassphraseError(null);
  };

  const handleRemoveKey = (id: string) => {
    setManagedKeys((keys) => keys.filter((key) => key.id !== id));
    setPassphraseNotice('Key removed from this session’s in-memory list.');
    setPassphraseError(null);
  };

  const handleRotationNotice = () => {
    setRotationModalOpen(false);
    setActionNotice(
      'Production KEK rotation is not available from this interface. Contact your system administrator for key-management operations.'
    );
  };

  return (
    <DashboardLayout
      pageTitle="Cryptographic Key Hierarchy & Lifecycle"
      pageDescription="Manage session-only custom passphrases and review CryptX’s envelope-encryption model."
      breadcrumbs={['Security', 'Key Management']}
    >
      <div className="space-y-6 text-left max-w-6xl">
        {/* Architecture Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start gap-3 text-xs text-[#94A3B8]">
          <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
              CryptX Key Management:
            </strong>
            File encryption uses a per-object Data Encryption Key (DEK), wrapped by the server-managed Key Encryption Key (KEK). Custom text passphrases are separate and are not server KEKs. Secret values entered below remain in this page’s memory only; they are cleared when you leave or reload the page.
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Custom Key Manager
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Add custom passphrases for text encryption. Entries are held in page memory only. Copy a key before leaving this page; it will not be saved to your account or applied to file encryption.
            </p>
          </div>

          {passphraseNotice && (
            <div role="status" className="text-xs text-emerald-300 font-mono">{passphraseNotice}</div>
          )}
          {passphraseError && (
            <div role="alert" className="text-xs text-rose-300 font-mono">{passphraseError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-key-name" className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">
                Key name
              </label>
              <input
                id="user-key-name"
                type="text"
                value={keyName}
                onChange={(event) => {
                  setKeyName(event.target.value);
                  setPassphraseNotice(null);
                  setPassphraseError(null);
                }}
                placeholder="e.g. Project archive"
                className="w-full rounded-lg bg-[#080B12] text-[#F8FAFC] text-xs font-mono p-2.5 border border-[#1E293B] focus:border-emerald-400 focus:outline-none placeholder-[#64748B]"
              />
            </div>
            <div>
              <label htmlFor="user-custom-passphrase" className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">
                Passphrase
              </label>
              <input
                id="user-custom-passphrase"
                type={showUserPassphrase ? 'text' : 'password'}
                autoComplete="new-password"
                value={userPassphrase}
                onChange={(event) => {
                  setUserPassphrase(event.target.value);
                  setPassphraseNotice(null);
                  setPassphraseError(null);
                }}
                placeholder="Enter a passphrase"
                className="w-full rounded-lg bg-[#080B12] text-[#F8FAFC] text-xs font-mono p-2.5 border border-[#1E293B] focus:border-emerald-400 focus:outline-none placeholder-[#64748B]"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={showUserPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              onClick={() => setShowUserPassphrase((visible) => !visible)}
            >
              {showUserPassphrase ? 'Hide' : 'Show'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={handleGeneratePassphrase}
            >
              Generate
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Key className="w-3.5 h-3.5" />}
              onClick={handleAddKey}
            >
              Add key
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleClearDraft}
              disabled={!userPassphrase && !keyName}
            >
              Clear fields
            </Button>
          </div>

          <div className="border-t border-[#1E293B] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase">Session keys</h4>
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">{managedKeys.length} {managedKeys.length === 1 ? 'key' : 'keys'}</Badge>
                {managedKeys.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftIcon={showManagedKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    onClick={() => setShowManagedKeys((visible) => !visible)}
                  >
                    {showManagedKeys ? 'Hide keys' : 'Reveal keys'}
                  </Button>
                )}
              </div>
            </div>
            {managedKeys.length === 0 ? (
              <p className="text-xs text-[#64748B]">No custom keys added in this session.</p>
            ) : (
              <ul className="space-y-2">
                {managedKeys.map((managedKey) => (
                  <li
                    key={managedKey.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-[#080B12] border border-[#1E293B] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#F8FAFC] truncate">{managedKey.name}</p>
                      <p className="text-[11px] font-mono text-[#94A3B8] truncate">
                        {showManagedKeys ? managedKey.value : '•'.repeat(Math.min(managedKey.value.length, 32))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<Copy className="w-3.5 h-3.5" />}
                        onClick={() => handleCopyKey(managedKey.value)}
                      >
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => handleRemoveKey(managedKey.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Visual Key Hierarchy Architecture */}
        <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B] gap-2">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00D4FF]" />
                Envelope Encryption Hierarchy (NIST SP 800-57)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Separate wrapping and data keys limit exposure and simplify cryptographic lifecycle management.
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
                Recovery guidance
              </Button>
            </div>
          </div>

          {/* 3 Tier Key Cards Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Tier 1: Master Key */}
            <div className="p-5 rounded-xl bg-[#141D2B] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
                  Tier 1 &bull; Account Credential
                </span>
                <Badge variant="cyan" size="sm">Authentication</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00D4FF]" />
                Account Password
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Account passwords are verified using salted password hashes. They are authentication credentials, not encryption keys, and cannot be recovered from their hashes.
              </p>
              <div className="pt-2 border-t border-[#1E293B]/60 text-[11px] font-mono text-slate-400">
                Authentication only &bull; Not used to wrap file keys
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
                The server uses this key to wrap and unwrap file Data Encryption Keys (DEKs). KEK rotation requires server-side key-management operations.
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
                A unique symmetric key is generated for each encrypted file and used with <strong>AES-256-GCM</strong>.
              </p>
              <div className="pt-2 border-t border-[#1E293B]/60 text-[11px] font-mono text-emerald-400">
                Stored with the encrypted object as a wrapped DEK
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
              Key Rotation
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Envelope encryption separates the payload key from the key that protects it. This separation can reduce the work required during key-management events.
            </p>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              A KEK rotation requires the server to unwrap and re-wrap each applicable DEK. The encrypted payloads do not need to be decrypted and encrypted again. Rotation availability depends on the configured backend key-management workflow.
            </p>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B] text-[11px] font-mono text-slate-300">
              Payload ciphertext remains unchanged during DEK re-wrapping
            </div>
          </Card>

          {/* Key Recovery Explanation */}
          <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-[#F8FAFC]">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Account Recovery
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Account password verification and encryption-key management are separate processes. A password reset does not reveal the server-managed KEK.
            </p>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Recovery options depend on the deployment’s configured key-management and backup policies. Keep any custom passphrases securely backed up; CryptX does not store the session keys listed above.
            </p>
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#1E293B] text-[11px] font-mono text-slate-300">
              Do not share passphrases &bull; Store recovery material securely
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
                Summary of algorithms currently implemented and candidates for future development.
              </p>
            </div>
            <Badge variant="cyan" size="sm">Standards-Based Design</Badge>
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
                  <td className="py-2.5 px-3 text-[#94A3B8]">Can support origin verification when signing keys, identity binding, and verification workflows are implemented.</td>
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
              CryptX does not use <strong>AES-ECB</strong> or unauthenticated <strong>AES-CBC</strong> for payload encryption. Encryption must use authenticated modes or an appropriately authenticated construction; visual scrambling is not encryption.
            </p>
          </div>
        </Card>

        <Modal
          isOpen={rotationModalOpen}
          onClose={() => setRotationModalOpen(false)}
          title="Key Rotation"
          subtitle="Server-managed cryptographic operation"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-[#94A3B8] leading-relaxed">
            <p>
              Rotating the server KEK requires an authorized server-side key-management workflow. This page does not currently initiate or simulate a production rotation.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleRotationNotice}>
                Understood
              </Button>
            </div>
          </div>
        </Modal>

        {/* Recovery Key Modal */}
        <Modal
          isOpen={recoveryModalOpen}
          onClose={() => setRecoveryModalOpen(false)}
          title="Recovery Guidance"
          subtitle="Protecting access to encrypted data"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-[#94A3B8] leading-relaxed">
            <div className="p-3 rounded-lg bg-[#141D2B] border border-amber-500/30 flex items-start gap-2.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Custom passphrases are not stored by CryptX. Keep a secure backup before using them to encrypt data.
              </span>
            </div>
            <p>
              A recovery-key export is not currently available in this interface. Account password recovery does not recover custom passphrases or expose the server-managed KEK.
            </p>
            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setRecoveryModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
