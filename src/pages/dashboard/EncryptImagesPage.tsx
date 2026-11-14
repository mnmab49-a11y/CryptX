import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Lock,
  Unlock,
  Download,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api, VaultFileItem } from '../../services/api';

export const EncryptImagesPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savedVaultItem, setSavedVaultItem] = useState<VaultFileItem | null>(null);
  const [decryptedPreviewUrl, setDecryptedPreviewUrl] = useState<string | null>(null);
  const [cipherPreviewUrl, setCipherPreviewUrl] = useState<string | null>(null);
  const [coverStyle, setCoverStyle] = useState<'scenic' | 'cyber' | 'noise'>('scenic');
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

  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

  const processFile = (file: File) => {
    if (!allowedFormats.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
      setOperationState((prev) => ({
        ...prev,
        error: 'Please upload a supported image format: JPG, JPEG, PNG, WEBP, or BMP.',
      }));
      return;
    }

    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setOperationState((prev) => ({
        ...prev,
        error: `Image exceeds maximum allowed size of ${MAX_SIZE_MB}MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select an image under ${MAX_SIZE_MB}MB.`,
      }));
      return;
    }

    setSelectedImage(file);
    setSavedVaultItem(null);
    setDecryptedPreviewUrl(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageMeta({ width: img.naturalWidth, height: img.naturalHeight });
    };

    setOperationState({ inProgress: false, completed: false, message: null, error: null });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleAction = async (mode: 'encrypt' | 'decrypt') => {
    if (!selectedImage) return;

    setOperationState({
      inProgress: true,
      completed: false,
      message: mode === 'encrypt' ? `Encrypting "${selectedImage.name}" losslessly with AES-256-GCM...` : 'Decrypting image...',
      error: null,
    });

    try {
      if (mode === 'encrypt') {
        const item = await api.encryptFile(selectedImage, 'image');
        setSavedVaultItem(item);
        let decoyFilename = `${selectedImage.name.replace(/\.[^/.]+$/, '')}.carrier.png`;
        try {
          const { blob, filename } = await api.downloadCarrierImageBlob(item.id, coverStyle);
          decoyFilename = filename;
          const cUrl = URL.createObjectURL(blob);
          setCipherPreviewUrl(cUrl);

          // Auto-download the Decoy Cover picture to disk
          const a = document.createElement('a');
          a.href = cUrl;
          a.download = decoyFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (cErr) {
          console.warn('Auto carrier download error:', cErr);
        }

        setOperationState({
          inProgress: false,
          completed: true,
          message: `Secret image "${selectedImage.name}" encrypted with AES-256-GCM! The new Decoy Cover Image "${decoyFilename}" was downloaded. Opening this file displays the decoy picture; uploading it to Decrypt restores the original photo losslessly!`,
          error: null,
        });
      } else {
        if (selectedImage) {
          try {
            const { blob, filename } = await api.decryptCarrierFile(selectedImage);
            const url = URL.createObjectURL(blob);
            setDecryptedPreviewUrl(url);
            setCipherPreviewUrl(null);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setOperationState({
              inProgress: false,
              completed: true,
              message: `Decoy Cover Image decrypted! Restored original secret photo "${filename}" losslessly with 100% SHA-256 match.`,
              error: null,
            });
            return;
          } catch (carrierErr: any) {
            if (savedVaultItem) {
              const { blob, filename } = await api.decryptFileBlob(savedVaultItem.id);
              const url = URL.createObjectURL(blob);
              setDecryptedPreviewUrl(url);
              setCipherPreviewUrl(null);

              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);

              setOperationState({
                inProgress: false,
                completed: true,
                message: 'Image decrypted! Lossless bytes verified with SHA-256 checksum.',
                error: null,
              });
              return;
            }
            throw carrierErr;
          }
        }

        if (savedVaultItem) {
          const { blob, filename } = await api.decryptFileBlob(savedVaultItem.id);
          const url = URL.createObjectURL(blob);
          setDecryptedPreviewUrl(url);
          setCipherPreviewUrl(null);

          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          setOperationState({
            inProgress: false,
            completed: true,
            message: 'Image decrypted! Lossless bytes verified with SHA-256 checksum.',
            error: null,
          });
          return;
        }

        throw new Error('Please select an encrypted Decoy Cover Image (.png) or image file first.');
      }
    } catch (err: any) {
      setOperationState({
        inProgress: false,
        completed: false,
        message: null,
        error: err.message || 'Image operation failed',
      });
    }
  };

  const handleDownloadVisualCipher = async () => {
    if (!savedVaultItem) return;
    try {
      const { blob, filename } = await api.downloadCarrierImageBlob(savedVaultItem.id, coverStyle);
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
        message: `Decoy Cover Image "${filename}" downloaded! Displays as a viewable picture; decrypts back to your original photo.`,
      }));
    } catch (err: any) {
      setOperationState((prev) => ({
        ...prev,
        error: err.message || 'Decoy cover image download failed',
      }));
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageMeta(null);
    setSavedVaultItem(null);
    setDecryptedPreviewUrl(null);
    setCipherPreviewUrl(null);
    setOperationState({ inProgress: false, completed: false, message: null, error: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout
      pageTitle="Lossless Image Encryption"
      pageDescription="Protect photos, graphics, medical scans, and visual assets without compression artifacts or data loss."
      breadcrumbs={['Encryption Tools', 'Images']}
    >
      <div className="space-y-6 text-left max-w-5xl">
        {/* Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start gap-3 text-xs text-[#94A3B8]">
          <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
              Lossless AES-256-GCM Binary Security:
            </strong>
            Images are encrypted as exact binary streams. Zero loss, zero re-compression. When decrypted, every byte and color pixel is identical to the original asset.
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
          {/* Upload & Image Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-[#00D4FF] bg-[#00D4FF]/5 scale-[0.99]'
                    : 'border-[#1E293B] hover:border-[#00D4FF]/50 bg-[#080B12]/60 hover:bg-[#080B12]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-center justify-center text-[#00D4FF] mb-2.5 shadow-inner">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#F8FAFC]">
                  Drop image here, or <span className="text-[#00D4FF] underline">browse files</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Supports PNG, JPEG, WEBP, BMP &bull; Lossless preservation guaranteed
                </p>
              </div>

              {/* Image Preview & Meta */}
              {previewUrl && selectedImage && (
                <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F8FAFC] truncate max-w-[200px]">
                      {selectedImage.name}
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-xs text-[#94A3B8] hover:text-red-400 font-mono transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="relative rounded-lg overflow-hidden bg-[#080B12] border border-[#1E293B] aspect-video flex items-center justify-center">
                    <img
                      src={decryptedPreviewUrl || cipherPreviewUrl || previewUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    {cipherPreviewUrl && !decryptedPreviewUrl && (
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-[#080B12]/90 border border-[#00D4FF] text-[#00D4FF] text-[10px] font-mono font-bold backdrop-blur-sm">
                        DECOY COVER IMAGE ACTIVE (SECRET PHOTO ENCRYPTED INSIDE)
                      </div>
                    )}
                    {decryptedPreviewUrl && (
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-emerald-500/90 border border-emerald-400 text-[#F8FAFC] text-[10px] font-mono font-bold backdrop-blur-sm">
                        DECRYPTED ORIGINAL PHOTO (RESTORED LOSSLESSLY)
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded-lg bg-[#101622] border border-[#1E293B]">
                      <div className="text-[#64748B] text-[10px]">FILE SIZE</div>
                      <div className="text-[#F8FAFC] font-bold mt-0.5">{formatFileSize(selectedImage.size)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#101622] border border-[#1E293B]">
                      <div className="text-[#64748B] text-[10px]">DIMENSIONS</div>
                      <div className="text-[#F8FAFC] font-bold mt-0.5">
                        {imageMeta ? `${imageMeta.width}x${imageMeta.height}` : 'Reading...'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#101622] border border-[#1E293B]">
                      <div className="text-[#64748B] text-[10px]">FORMAT</div>
                      <div className="text-[#00D4FF] font-bold mt-0.5 uppercase">
                        {selectedImage.type.split('/')[1] || 'IMAGE'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Image Style Selector */}
              <div className="p-3.5 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#00D4FF] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Decoy Cover Image Style (The Alternate Picture)</span>
                  </label>
                  <Badge variant="cyan" size="sm">Steganography</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverStyle('scenic')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      coverStyle === 'scenic'
                        ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#F8FAFC] ring-1 ring-[#00D4FF]/30'
                        : 'bg-[#101622] border-[#1E293B] text-[#94A3B8] hover:border-[#64748B]'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>🌄</span>
                      <span>Scenic Nature</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">Twilight mountain wallpaper</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverStyle('cyber')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      coverStyle === 'cyber'
                        ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#F8FAFC] ring-1 ring-[#00D4FF]/30'
                        : 'bg-[#101622] border-[#1E293B] text-[#94A3B8] hover:border-[#64748B]'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>🌌</span>
                      <span>Cyber Synthwave</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">Retro neon grid artwork</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverStyle('noise')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      coverStyle === 'noise'
                        ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#F8FAFC] ring-1 ring-[#00D4FF]/30'
                        : 'bg-[#101622] border-[#1E293B] text-[#94A3B8] hover:border-[#64748B]'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Visual Cipher</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">Diffused byte static</div>
                  </button>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-tight">
                  When encrypted, this alternate picture is generated and downloaded. Opening it displays the chosen artwork, while the original photo is safely encrypted inside.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#1E293B]">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedImage || operationState.inProgress}
                  isLoading={operationState.inProgress}
                  leftIcon={<Lock className="w-4 h-4" />}
                  onClick={() => handleAction('encrypt')}
                >
                  Encrypt Image
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={(!selectedImage && !savedVaultItem) || operationState.inProgress}
                  isLoading={operationState.inProgress && !cipherPreviewUrl}
                  leftIcon={<Unlock className="w-4 h-4" />}
                  onClick={() => handleAction('decrypt')}
                >
                  Decrypt &amp; Download
                </Button>
                {selectedImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="ml-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Encrypted Envelope & Stats (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <h3 className="text-sm font-bold text-[#F8FAFC]">Cryptographic Metadata</h3>
                <Badge variant={operationState.completed ? 'emerald' : 'neutral'} size="sm">
                  {operationState.completed ? 'Encrypted' : 'Standby'}
                </Badge>
              </div>

              {/* Encrypted Envelope Box */}
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-3 font-mono text-xs">
                {savedVaultItem ? (
                  <>
                    <div className="text-emerald-400 flex items-center gap-2 font-bold pb-2 border-b border-[#1E293B]">
                      <CheckCircle2 className="w-4 h-4" />
                      Encrypted Image In Vault
                    </div>
                    <div className="space-y-1 text-[#94A3B8] text-[11px]">
                      <div>Stored ID: <span className="text-[#F8FAFC]">{savedVaultItem.id.substring(0, 18)}...</span></div>
                      <div>Container: <span className="text-emerald-400">.img.cptx (Byte-Exact Lossless)</span></div>
                      <div>Algorithm: <span className="text-[#00D4FF]">AES-256-GCM</span></div>
                      <div>Plaintext Bytes: <span className="text-[#F8FAFC]">{formatFileSize(savedVaultItem.file_size)}</span></div>
                      <div>Encrypted Bytes: <span className="text-[#F8FAFC]">{formatFileSize(savedVaultItem.encrypted_size)}</span></div>
                      <div>Auth Tag: <span className="text-[#38BDF8]">{savedVaultItem.authentication_tag.substring(0, 16)}...</span></div>
                      <div>SHA-256 Checksum: <span className="text-slate-400 break-all">{savedVaultItem.sha256_hash}</span></div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-[#64748B]">
                    Upload and encrypt an image to view cryptographic envelope details.
                  </div>
                )}
              </div>

              {/* Download Triggers */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!savedVaultItem}
                  leftIcon={<ImageIcon className="w-4 h-4 text-[#00D4FF]" />}
                  className="w-full justify-center"
                  onClick={handleDownloadVisualCipher}
                >
                  Download Decoy Cover Image (.png)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  disabled={!savedVaultItem && !selectedImage}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="w-full justify-center"
                  onClick={() => handleAction('decrypt')}
                >
                  Decrypt &amp; Download Original Photo
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
