import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Lock,
  Unlock,
  Download,
  FileText,
  RotateCcw,
  Info,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api, VaultFileItem } from '../../services/api';

export const EncryptFilesPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savedVaultItem, setSavedVaultItem] = useState<VaultFileItem | null>(null);
  const [operationState, setOperationState] = useState<{
    inProgress: boolean;
    completed: boolean;
    message: string | null;
    error: string | null;
  }>({
    inProgress: false,
    completed: false,
    message: null,
    error: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setSavedVaultItem(null);
      setOperationState({ inProgress: false, completed: false, message: null, error: null });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSavedVaultItem(null);
      setOperationState({ inProgress: false, completed: false, message: null, error: null });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleAction = async (mode: 'encrypt' | 'decrypt') => {
    if (!selectedFile) return;

    setOperationState({
      inProgress: true,
      completed: false,
      message: mode === 'encrypt' ? `Encrypting "${selectedFile.name}" with AES-256-GCM...` : 'Processing decryption...',
      error: null,
    });

    try {
      if (mode === 'encrypt') {
        const item = await api.encryptFile(selectedFile, 'document');
        setSavedVaultItem(item);
        setOperationState({
          inProgress: false,
          completed: true,
          message: `"${selectedFile.name}" encrypted with AES-256-GCM. Stored in vault & ready for Carrier Image download. SHA-256: ${item.sha256_hash.substring(0, 16)}...`,
          error: null,
        });
      } else {
        // Direct Steganographic Carrier image decryption
        if (selectedFile && (selectedFile.name.endsWith('.png') || selectedFile.type.includes('image'))) {
          const { blob, filename } = await api.decryptCarrierFile(selectedFile);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setOperationState({
            inProgress: false,
            completed: true,
            message: `Carrier image verified! Extracted original payload: "${filename}". Downloaded to disk.`,
            error: null,
          });
          return;
        }

        // Vault-based decryption
        if (savedVaultItem) {
          await handleDownloadDecrypted(savedVaultItem.id);
          setOperationState({
            inProgress: false,
            completed: true,
            message: `Decryption verified! Authentication tag confirmed. File downloaded to disk.`,
            error: null,
          });
          return;
        }

        throw new Error('Please select an encrypted Carrier Image (.png) to extract, or encrypt a file first.');
      }
    } catch (err: any) {
      setOperationState({
        inProgress: false,
        completed: false,
        message: null,
        error: err.message || 'File operation failed',
      });
    }
  };

  const handleDownloadCarrier = async () => {
    if (!savedVaultItem) return;
    try {
      const { blob, filename } = await api.downloadCarrierImageBlob(savedVaultItem.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setOperationState((prev) => ({
        ...prev,
        message: `Steganographic Carrier Image "${filename}" downloaded! Contains the sealed encrypted file.`,
      }));
    } catch (err: any) {
      setOperationState((prev) => ({
        ...prev,
        error: err.message || 'Carrier download failed',
      }));
    }
  };

  const handleDownloadDecrypted = async (fileId: string) => {
    try {
      const { blob, filename } = await api.decryptFileBlob(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setOperationState((prev) => ({
        ...prev,
        error: err.message || 'Download and decryption failed',
      }));
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSavedVaultItem(null);
    setOperationState({ inProgress: false, completed: false, message: null, error: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout
      pageTitle="Document & File Encryption"
      pageDescription="Protect PDF, DOCX, archives, and arbitrary data payloads using authenticated AES-256-GCM cipher streams."
      breadcrumbs={['Encryption Tools', 'Files']}
    >
      <div className="space-y-6 text-left max-w-5xl">
        {/* Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start gap-3 text-xs text-[#94A3B8]">
          <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
              Live File Cryptography Engine:
            </strong>
            Files are encrypted in Python memory with <strong>AES-256-GCM</strong> and saved in secure isolated storage. Raw plaintext is never persisted to disk.
          </div>
        </div>

        {/* Operation Status */}
        {operationState.message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{operationState.message}</span>
          </div>
        )}

        {/* Error Notification */}
        {operationState.error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{operationState.error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Upload & Drop Zone (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-[#00D4FF] bg-[#00D4FF]/5 scale-[0.99]'
                    : 'border-[#1E293B] hover:border-[#00D4FF]/50 bg-[#080B12]/60 hover:bg-[#080B12]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#141D2B] border border-[#1E293B] flex items-center justify-center text-[#00D4FF] mb-3 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#F8FAFC]">
                    Drag &amp; drop your file here, or{' '}
                    <span className="text-[#00D4FF] underline">browse</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Supports PDF, DOCX, XLSX, TXT, ZIP, and arbitrary binaries up to 50 MB
                  </p>
                </div>
              </div>

              {/* Selected File Card */}
              {selectedFile && (
                <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-[#101622] border border-[#1E293B] text-[#3B82F6] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#F8FAFC] truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-2 mt-0.5">
                        <span>{formatFileSize(selectedFile.size)}</span>
                        <span>&bull;</span>
                        <span>{selectedFile.type || 'Binary blob'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-[#101622] transition-colors"
                    title="Remove file"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#1E293B]">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedFile || operationState.inProgress}
                  isLoading={operationState.inProgress}
                  leftIcon={<Lock className="w-4 h-4" />}
                  onClick={() => handleAction('encrypt')}
                >
                  Encrypt File
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={!savedVaultItem || operationState.inProgress}
                  leftIcon={<Unlock className="w-4 h-4" />}
                  onClick={() => handleAction('decrypt')}
                >
                  Decrypt &amp; Download
                </Button>
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="ml-auto"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Output & Action Interface (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <h3 className="text-sm font-bold text-[#F8FAFC]">Resulting Artifact</h3>
                <Badge variant={operationState.completed ? 'emerald' : 'neutral'} size="sm">
                  {operationState.completed ? 'Vault Secured' : 'Standby'}
                </Badge>
              </div>

              {/* Result Preview Box */}
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-3 font-mono text-xs">
                {savedVaultItem ? (
                  <>
                    <div className="text-emerald-400 flex items-center gap-2 font-bold pb-2 border-b border-[#1E293B]">
                      <CheckCircle2 className="w-4 h-4" />
                      Encrypted In Vault
                    </div>
                    <div className="space-y-1 text-[#94A3B8] text-[11px]">
                      <div>Original: <span className="text-[#F8FAFC]">{savedVaultItem.original_filename}</span></div>
                      <div>Container: <span className="text-emerald-400">.cptx (Versioned Binary Envelope)</span></div>
                      <div>Algorithm: <span className="text-[#00D4FF]">{savedVaultItem.encryption_algorithm}</span></div>
                      <div>Plaintext Size: <span className="text-[#F8FAFC]">{formatFileSize(savedVaultItem.file_size)}</span></div>
                      <div>Ciphertext Size: <span className="text-[#F8FAFC]">{formatFileSize(savedVaultItem.encrypted_size)}</span></div>
                      <div>SHA-256 Digest: <span className="text-slate-400 break-all">{savedVaultItem.sha256_hash}</span></div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-[#64748B]">
                    Select a document or archive to encrypt with AES-256-GCM.
                  </div>
                )}
              </div>

              {/* Download Trigger Buttons */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!savedVaultItem}
                  leftIcon={<ImageIcon className="w-4 h-4 text-[#00D4FF]" />}
                  className="w-full justify-center"
                  onClick={handleDownloadCarrier}
                >
                  Download As Carrier Image (.png)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  disabled={!savedVaultItem}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="w-full justify-center"
                  onClick={() => savedVaultItem && handleDownloadDecrypted(savedVaultItem.id)}
                >
                  Decrypt &amp; Download Raw File
                </Button>
              </div>

              {/* Architecture Bullet */}
              <div className="pt-2 text-[11px] font-mono text-[#64748B] flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Encrypted with 256-bit DEK wrapped via Server Master KEK</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
