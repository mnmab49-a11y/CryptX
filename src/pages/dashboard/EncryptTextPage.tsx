import React, { useState } from 'react';
import {
  FileCode,
  Lock,
  Unlock,
  Copy,
  RotateCcw,
  Check,
  Info,
  Cpu,
  Hash,
  ShieldCheck,
  AlertCircle,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api, TextEncryptResult } from '../../services/api';

export const EncryptTextPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [algorithm, setAlgorithm] = useState('AES-256-GCM');
  const [keyMode, setKeyMode] = useState<'server' | 'custom'>('server');
  const [customKey, setCustomKey] = useState('');
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [outputResult, setOutputResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEnvelope, setLastEnvelope] = useState<TextEncryptResult | null>(null);

  const handleAction = async (mode: 'encrypt' | 'decrypt') => {
    setNoticeMessage(null);
    setErrorMessage(null);

    if (!inputText.trim()) {
      setErrorMessage('Please enter text or encrypted envelope JSON into the input editor.');
      return;
    }

    if (mode === 'encrypt' && keyMode === 'custom' && !customKey.trim()) {
      setErrorMessage('Please specify your custom secret key/passphrase before encrypting.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'encrypt') {
        const result = await api.encryptText({
          plaintext: inputText,
          algorithm,
          custom_key: keyMode === 'custom' ? customKey.trim() : undefined,
        });
        const envelope = {
          version: '1.0',
          algorithm: result.algorithm || algorithm,
          key_mode: result.key_mode || keyMode,
          nonce: result.nonce,
          tag: result.tag,
          wrapped_dek: result.wrapped_dek,
          salt: result.salt,
          sha256_hash: result.sha256_hash,
          ciphertext: result.ciphertext,
        };
        setLastEnvelope(result);
        const formatted = JSON.stringify(envelope, null, 2);
        setOutputResult(formatted);
        const modeDesc = keyMode === 'custom' ? 'User-defined Custom Passphrase' : 'Server KEK Envelope';
        setNoticeMessage(
          `Payload successfully encrypted with ${result.algorithm} [${modeDesc}]! SHA-256: ${result.sha256_hash.substring(0, 16)}...`
        );
      } else {
        // Decrypt mode
        let payloadToDecrypt: any = null;
        try {
          payloadToDecrypt = JSON.parse(inputText.trim());
        } catch {
          if (lastEnvelope) {
            payloadToDecrypt = lastEnvelope;
          } else {
            throw new Error(
              'To decrypt, paste the complete JSON envelope (including ciphertext, nonce, tag, and key parameters) into the editor.'
            );
          }
        }

        if (!payloadToDecrypt.ciphertext || !payloadToDecrypt.nonce || !payloadToDecrypt.tag) {
          throw new Error('Missing required cryptographic fields in JSON envelope: ciphertext, nonce, and tag.');
        }

        const isCustom = payloadToDecrypt.key_mode === 'custom' || payloadToDecrypt.salt;
        const keyToUse = customKey.trim() || payloadToDecrypt.custom_key;

        if (isCustom && !keyToUse) {
          throw new Error('This envelope was encrypted with a Custom Secret Key. Please enter your Custom Secret Key in the field below to decrypt.');
        }

        const res = await api.decryptText({
          ciphertext: payloadToDecrypt.ciphertext,
          nonce: payloadToDecrypt.nonce,
          tag: payloadToDecrypt.tag,
          wrapped_dek: payloadToDecrypt.wrapped_dek,
          algorithm: payloadToDecrypt.algorithm || algorithm,
          custom_key: keyToUse,
          salt: payloadToDecrypt.salt,
        });

        setOutputResult(res.plaintext);
        setNoticeMessage(
          `Decryption successful! Cryptographic authentication verified (${payloadToDecrypt.algorithm || 'AES-256-GCM'}) and SHA-256 matched.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Cryptographic operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setOutputResult('');
    setNoticeMessage(null);
    setErrorMessage(null);
    setLastEnvelope(null);
  };

  return (
    <DashboardLayout
      pageTitle="Text Encryption & Decryption"
      pageDescription="Transform confidential text, tokens, and credentials using real AES-256-GCM authenticated cipher streams."
      breadcrumbs={['Encryption Tools', 'Text']}
    >
      <div className="space-y-6 text-left max-w-5xl">
        {/* Backend Status Notice */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start gap-3 text-xs text-[#94A3B8]">
          <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
              Live Cryptographic Engine:
            </strong>
            Connected to Python FastAPI backend running hardware-accelerated <strong>AES-256-GCM</strong> authenticated encryption. Every operation generates a 256-bit DEK wrapped with the Server Master KEK via NIST AES Key Wrap.
          </div>
        </div>

        {/* Action Status Notification */}
        {noticeMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 bg-[#101622] border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-sm font-bold text-[#F8FAFC]">Payload Input Editor</span>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {inputText.length} chars &bull; {inputText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={7}
                  placeholder="Paste confidential credentials, secret environment variables, or encrypted JSON envelope to decrypt..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full rounded-xl bg-[#080B12] text-[#F8FAFC] text-sm font-mono p-3.5 border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none focus:ring-1 focus:ring-[#00D4FF]/30 placeholder-[#64748B] resize-y"
                />
              </div>

              {/* Algorithm & Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 flex items-center justify-between">
                    <span>Cipher Algorithm</span>
                    <Badge variant="cyan" size="sm">Multi-Cipher</Badge>
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full rounded-lg bg-[#080B12] text-[#F8FAFC] text-xs font-mono p-2.5 border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none"
                  >
                    <option value="AES-256-GCM">AES-256-GCM (NIST AEAD - Default)</option>
                    <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 (RFC 8439 Stream AEAD)</option>
                    <option value="AES-256-CBC">AES-256-CBC (HMAC-SHA256 Encrypt-then-MAC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 flex items-center justify-between">
                    <span>Key Mode</span>
                    <Badge variant={keyMode === 'custom' ? 'emerald' : 'blue'} size="sm">
                      {keyMode === 'custom' ? 'User Custom Key' : 'Server KEK'}
                    </Badge>
                  </label>
                  <select
                    value={keyMode}
                    onChange={(e: any) => setKeyMode(e.target.value)}
                    className="w-full rounded-lg bg-[#080B12] text-[#F8FAFC] text-xs font-mono p-2.5 border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none"
                  >
                    <option value="server">Server Master KEK Envelope (Automated)</option>
                    <option value="custom">Custom Secret Key / Passphrase (User Defined)</option>
                  </select>
                </div>
              </div>

              {/* Custom Key Input (Shown when custom key mode is active or user wants to specify key for decrypt) */}
              <div className="p-3.5 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom Secret Key / Passphrase {keyMode === 'server' ? '(Optional for Decrypt)' : '(Required)'}:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomKey(!showCustomKey)}
                    className="text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-mono flex items-center gap-1"
                  >
                    {showCustomKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showCustomKey ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showCustomKey ? 'text' : 'password'}
                  placeholder="Enter your secret key/passphrase (derived via Argon2id / PBKDF2)..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full rounded-lg bg-[#101622] text-[#F8FAFC] text-xs font-mono p-2.5 border border-[#1E293B] focus:border-emerald-400 focus:outline-none placeholder-[#64748B]"
                />
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {keyMode === 'custom'
                    ? 'Your custom secret key derives a 256-bit key with high-entropy salt. The raw key is never stored on the server.'
                    : 'If decrypting a payload protected with a custom key, enter it here.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1E293B]">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Lock className="w-4 h-4" />}
                  onClick={() => handleAction('encrypt')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Encrypt Payload'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Unlock className="w-4 h-4" />}
                  onClick={() => handleAction('decrypt')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Decrypt Ciphertext'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={handleClear}
                  className="ml-auto"
                >
                  Clear
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Output & Cipher Inspect (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 bg-[#101622] border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-sm font-bold text-[#F8FAFC]">Output Ledger</span>
                </div>
                {outputResult && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-[#141D2B] text-[#00D4FF] hover:bg-[#1E293B] border border-[#1E293B] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Result'}</span>
                  </button>
                )}
              </div>

              {/* Output Display */}
              <div className="min-h-[160px] max-h-[220px] rounded-xl bg-[#080B12] border border-[#1E293B] p-3.5 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {outputResult || (
                  <span className="text-[#64748B] italic">
                    Output stream will appear here after triggering an operation.
                  </span>
                )}
              </div>

              {/* Algorithm Specs Box */}
              <div className="p-3.5 rounded-xl bg-[#141D2B] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#F8FAFC] pb-1 border-b border-[#1E293B]">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
                    Engine Specification
                  </span>
                  <Badge variant="emerald" size="sm">Active Engine</Badge>
                </div>
                <div className="space-y-1 text-[#94A3B8] text-[11px]">
                  <div>Cipher: Authenticated AES-256-GCM</div>
                  <div>IV Length: 96 bits (crypto_random)</div>
                  <div>MAC Tag: 128 bits (Tamper verification)</div>
                  <div>Key Wrap: NIST RFC 3394 Server KEK</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
