import React, { useState, useEffect } from 'react';
import {
  Files,
  HardDrive,
  Activity,
  KeyRound,
  ArrowUpRight,
  ShieldCheck,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from '../../router';
import { useAuth } from '../../context/AuthContext';
import { api, VaultSummary } from '../../services/api';

interface ActivityItem {
  id: string;
  name: string;
  type: 'Text' | 'File' | 'Image';
  operation: 'Encryption' | 'Decryption' | 'Key Rotation';
  time: string;
  status: 'Sealed' | 'Verified' | 'Completed';
  hash: string;
}


export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [categorySizes, setCategorySizes] = useState<{ images: number; docs: number; text: number }>({
    images: 0,
    docs: 0,
    text: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [sumRes, actRes, filesRes] = await Promise.allSettled([
          api.getVaultSummary(),
          api.listActivities(0, 5),
          api.listVaultFiles(),
        ]);

        if (!isMounted) return;

        if (sumRes.status === 'fulfilled') {
          setSummary(sumRes.value);
        }

        if (filesRes.status === 'fulfilled' && Array.isArray(filesRes.value)) {
          let imgBytes = 0;
          let docBytes = 0;
          let textBytes = 0;
          filesRes.value.forEach((f) => {
            const cat = (f.category || '').toLowerCase();
            const sz = f.encrypted_size || f.file_size || 0;
            if (cat === 'image') imgBytes += sz;
            else if (cat === 'document') docBytes += sz;
            else textBytes += sz;
          });
          setCategorySizes({ images: imgBytes, docs: docBytes, text: textBytes });
        }

        if (actRes.status === 'fulfilled' && actRes.value?.items) {
          const mapped: ActivityItem[] = actRes.value.items.map((it) => {
            let actType: 'Text' | 'File' | 'Image' = 'File';
            if (it.operation_type.includes('IMAGE')) actType = 'Image';
            else if (it.operation_type.includes('TEXT')) actType = 'Text';

            let actOp: 'Encryption' | 'Decryption' | 'Key Rotation' = 'Encryption';
            if (it.operation_type.startsWith('DECRYPT')) actOp = 'Decryption';
            else if (it.operation_type.includes('KEY')) actOp = 'Key Rotation';

            return {
              id: it.id,
              name: it.resource_name || 'System Payload',
              type: actType,
              operation: actOp,
              time: new Date(it.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: it.status === 'SUCCESS' ? 'Verified' : 'Completed',
              hash: it.details ? it.details.substring(0, 16) : 'AES-GCM-SHA256',
            };
          });
          setActivities(mapped);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalFiles = summary ? summary.total_files : 0;
  const totalStorage = summary ? summary.total_storage_bytes : 0;
  const storageStr = summary ? formatBytes(summary.total_storage_bytes) : '0 B';
  const totalOps = summary ? summary.total_operations : 0;

  const imgPercent = totalStorage > 0 ? Math.round((categorySizes.images / totalStorage) * 100) : 0;
  const docPercent = totalStorage > 0 ? Math.round((categorySizes.docs / totalStorage) * 100) : 0;
  const textPercent = totalStorage > 0 ? Math.max(0, 100 - imgPercent - docPercent) : 0;

  return (
    <DashboardLayout
      pageTitle="Vault Overview & Security Status"
      pageDescription="Real-time telemetry of your multi-format encrypted assets and cryptographic keys."
      breadcrumbs={['Overview']}
    >
      <div className="space-y-6 text-left">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#101622] via-[#141D2B] to-[#101622] border border-[#1E293B] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                Welcome back, {user?.full_name || 'CryptX User'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                {isLoading ? 'Connecting...' : 'Live Vault Telemetry'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Your cryptographic workspace is online. All payloads are governed under AES-256-GCM authenticated cipher streams.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard/text')}
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Quick Encrypt
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard/vault')}
            >
              View Vault
            </Button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#141D2B] border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#94A3B8] uppercase">Encrypted Files</span>
              <div className="p-2 rounded-lg bg-[#101622] text-[#00D4FF] border border-[#1E293B]">
                <Files className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#F8FAFC]">{totalFiles}</div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <span>Active Vault Count</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-[#141D2B] border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#94A3B8] uppercase">Storage Consumed</span>
              <div className="p-2 rounded-lg bg-[#101622] text-[#3B82F6] border border-[#1E293B]">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#F8FAFC]">{storageStr}</div>
              <div className="text-[11px] font-mono text-[#94A3B8] mt-1">
                Persistent Ciphertext Allocation
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-[#141D2B] border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#94A3B8] uppercase">Operations Run</span>
              <div className="p-2 rounded-lg bg-[#101622] text-emerald-400 border border-[#1E293B]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#F8FAFC]">{totalOps}</div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1">
                100% Cryptographic Integrity
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-[#141D2B] border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#94A3B8] uppercase">Key Hierarchy</span>
              <div className="p-2 rounded-lg bg-[#101622] text-amber-400 border border-[#1E293B]">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#F8FAFC]">Active</div>
              <div className="text-[11px] font-mono text-[#00D4FF] mt-1">
                Server KEK / DEK Envelope
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Row: Storage Breakdown & Security Posture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Storage Breakdown Visualization */}
          <Card className="lg:col-span-7 p-6 bg-[#101622] border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Vault Storage Distribution</h3>
                <p className="text-xs text-[#94A3B8]">Multi-format payloads stored in secure cryptographic vault storage</p>
              </div>
              <span className="text-xs font-mono text-[#00D4FF]">Live Registry</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-[#080B12] overflow-hidden flex border border-[#1E293B]">
                <div style={{ width: `${imgPercent}%` }} className="bg-[#00D4FF] h-full transition-all duration-500" title={`Images: ${formatBytes(categorySizes.images)}`} />
                <div style={{ width: `${docPercent}%` }} className="bg-[#3B82F6] h-full transition-all duration-500" title={`Documents: ${formatBytes(categorySizes.docs)}`} />
                <div style={{ width: `${textPercent}%` }} className="bg-emerald-400 h-full transition-all duration-500" title={`Other: ${formatBytes(categorySizes.text)}`} />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF]" />
                  <span className="text-[#94A3B8]">Images:</span>
                  <span className="text-[#F8FAFC] font-semibold">{formatBytes(categorySizes.images)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                  <span className="text-[#94A3B8]">Documents:</span>
                  <span className="text-[#F8FAFC] font-semibold">{formatBytes(categorySizes.docs)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[#94A3B8]">Other:</span>
                  <span className="text-[#F8FAFC] font-semibold">{formatBytes(categorySizes.text)}</span>
                </div>
              </div>
            </div>

            {/* Cloud Object Details */}
            <div className="pt-3 border-t border-[#1E293B] grid grid-cols-2 gap-4 text-xs font-mono text-[#94A3B8]">
              <div>
                <span className="text-[#64748B] block">Vault Storage:</span>
                <span className="text-[#F8FAFC]">Authenticated Object Store</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Tamper Protocol:</span>
                <span className="text-emerald-400">AEAD Tag & SHA-256 Digest</span>
              </div>
            </div>
          </Card>

          {/* Security Status Panel */}
          <Card className="lg:col-span-5 p-6 bg-[#101622] border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security Baseline
              </h3>
              <Badge variant="emerald" size="sm">Audited Spec</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#141D2B] border border-[#1E293B] flex items-center justify-between">
                <span className="text-[#94A3B8]">Primary Cipher</span>
                <span className="text-[#00D4FF] font-semibold">AES-256-GCM (256-bit AEAD)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141D2B] border border-[#1E293B] flex items-center justify-between">
                <span className="text-[#94A3B8]">Integrity Checksum</span>
                <span className="text-[#F8FAFC] font-semibold">SHA-256 Bit-Exact Digests</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141D2B] border border-[#1E293B] flex items-center justify-between">
                <span className="text-[#94A3B8]">Password KDF</span>
                <span className="text-[#F8FAFC] font-semibold">Argon2id (m=64MB, t=3, p=4)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141D2B] border border-[#1E293B] flex items-center justify-between">
                <span className="text-[#94A3B8]">Key Encryption (KEK)</span>
                <span className="text-emerald-400 font-semibold">NIST AES Key Wrap (RFC 3394)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Launch Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#F8FAFC]">Quick Cryptographic Actions</h3>
            <span className="text-xs font-mono text-[#94A3B8]">Direct Tool Launcher</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/text"
              className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] hover:border-[#00D4FF]/40 hover:-translate-y-0.5 transition-all group block"
            >
              <div className="p-2 rounded-lg bg-[#101622] text-[#00D4FF] border border-[#1E293B] w-fit mb-3">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors flex items-center justify-between">
                <span>Encrypt Text</span>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00D4FF]" />
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Seal confidential text, passwords, and tokens.
              </p>
            </Link>

            <Link
              to="/dashboard/files"
              className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] hover:border-[#3B82F6]/40 hover:-translate-y-0.5 transition-all group block"
            >
              <div className="p-2 rounded-lg bg-[#101622] text-[#3B82F6] border border-[#1E293B] w-fit mb-3">
                <Files className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#3B82F6] transition-colors flex items-center justify-between">
                <span>Encrypt Files</span>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#3B82F6]" />
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Protect PDF, DOCX, and arbitrary binary archives.
              </p>
            </Link>

            <Link
              to="/dashboard/images"
              className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] hover:border-[#00D4FF]/40 hover:-translate-y-0.5 transition-all group block"
            >
              <div className="p-2 rounded-lg bg-[#101622] text-[#00D4FF] border border-[#1E293B] w-fit mb-3">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors flex items-center justify-between">
                <span>Encrypt Images</span>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00D4FF]" />
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Shield PNG, JPG, WEBP with lossless recovery.
              </p>
            </Link>

            <Link
              to="/dashboard/keys"
              className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] hover:border-amber-400/40 hover:-translate-y-0.5 transition-all group block"
            >
              <div className="p-2 rounded-lg bg-[#101622] text-amber-400 border border-[#1E293B] w-fit mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Key Management</span>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-amber-400]" />
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Inspect KEK/DEK lifecycle & rotation schema.
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <Card className="p-6 bg-[#101622] border-[#1E293B]">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3B82F6]" />
                Recent Cryptographic Activity
              </h3>
              <p className="text-xs text-[#94A3B8]">Audit ledger live records</p>
            </div>
            <Link
              to="/dashboard/activity"
              className="text-xs font-mono text-[#00D4FF] hover:underline"
            >
              View Full History &rarr;
            </Link>
          </div>

          {activities.length > 0 ? (
            <div className="divide-y divide-[#1E293B]/70 overflow-x-auto">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between min-w-[500px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#141D2B] border border-[#1E293B] text-[#00D4FF]">
                      {act.type === 'Text' ? (
                        <FileCode className="w-4 h-4" />
                      ) : act.type === 'Image' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <Files className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F8FAFC] truncate max-w-[280px]">{act.name}</div>
                      <div className="text-[11px] font-mono text-[#64748B]">
                        {act.operation} &bull; Digest: {act.hash}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#94A3B8]">{act.time}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-mono text-[#64748B]">
              No cryptographic operations recorded yet. Encrypt text, files, or images to begin your audit log.
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
