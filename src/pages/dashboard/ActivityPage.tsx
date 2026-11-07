import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Info,
  Clock,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';

interface AuditLog {
  id: string;
  operation: string;
  target: string;
  timestamp: string;
  status: string;
  clientIp: string;
  shaDigest: string;
}

const sampleAuditLogs: AuditLog[] = [
  {
    id: 'log-101',
    operation: 'Encryption',
    target: 'annual_audit_report_2026.pdf',
    timestamp: '2026-11-07 20:14:02',
    status: 'Sealed',
    clientIp: '192.168.1.104 [Local]',
    shaDigest: '9f81a7...33ea',
  },
  {
    id: 'log-102',
    operation: 'Encryption',
    target: 'financial_ledger_q4.png',
    timestamp: '2026-11-07 18:22:19',
    status: 'Sealed',
    clientIp: '192.168.1.104 [Local]',
    shaDigest: '4a2f71...88ff',
  },
  {
    id: 'log-103',
    operation: 'Decryption',
    target: 'database_production_credentials.txt',
    timestamp: '2026-11-07 15:45:51',
    status: 'Verified',
    clientIp: '192.168.1.104 [Local]',
    shaDigest: 'e3b0c4...001a',
  },
  {
    id: 'log-104',
    operation: 'Key Rotation',
    target: 'Vault Root Data Encryption Key (DEK #4)',
    timestamp: '2026-11-06 12:00:00',
    status: 'Rotated',
    clientIp: '192.168.1.104 [Local]',
    shaDigest: '7c12d4...11fc',
  },
  {
    id: 'log-105',
    operation: 'Deletion',
    target: 'deprecated_token_cache.tmp',
    timestamp: '2026-11-05 08:33:14',
    status: 'Purged',
    clientIp: '192.168.1.104 [Local]',
    shaDigest: '5b1a99...442b',
  },
  {
    id: 'log-106',
    operation: 'Encryption',
    target: 'patient_mri_scan.jpg',
    timestamp: '2026-11-04 17:10:48',
    status: 'Sealed',
    clientIp: '192.168.1.104 [Local]',
    shaDigest: '3f99aa...5521',
  },
];

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(sampleAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOp, setSelectedOp] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await api.listActivities();
      if (res.items && res.items.length > 0) {
        const mapped: AuditLog[] = res.items.map((it) => ({
          id: it.id.substring(0, 8),
          operation: it.operation_type.replace('_', ' '),
          target: it.resource_name || 'System Payload',
          timestamp: new Date(it.created_at).toLocaleString(),
          status: it.status === 'SUCCESS' ? 'Verified' : 'Failed',
          clientIp: it.ip_address || '127.0.0.1 [Direct]',
          shaDigest: it.details ? it.details.substring(0, 18) : 'AES-GCM Authenticated',
        }));
        setLogs(mapped);
        setIsLive(true);
      }
    } catch {
      // Keep sample logs if backend unreachable
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);


  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesOp = selectedOp === 'All' || log.operation === selectedOp;
      const matchesQuery =
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesOp && matchesQuery;
    });
  }, [logs, searchQuery, selectedOp]);

  const getOpBadge = (op: string) => {
    switch (op) {
      case 'Encryption':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30">
            <Lock className="w-3 h-3" />
            Encrypt
          </span>
        );
      case 'Decryption':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Unlock className="w-3 h-3" />
            Decrypt
          </span>
        );
      case 'Key Rotation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <KeyRound className="w-3 h-3" />
            Key Rotation
          </span>
        );
      case 'Deletion':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
            <Trash2 className="w-3 h-3" />
            Purge
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      pageTitle="Cryptographic Audit Trail"
      pageDescription="Immutable ledger of operations, key activations, and tamper verification records."
      breadcrumbs={['Security', 'Activity History']}
    >
      <div className="space-y-6 text-left max-w-6xl">
        {/* Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <div className="flex items-center gap-2 mb-0.5">
                <strong className="text-[#F8FAFC] font-mono">
                  Cryptographic Audit Ledger:
                </strong>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  isLive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                }`}>
                  {isLive ? 'Live Records' : 'Illustrative Sample Records'}
                </span>
              </div>
              Forensic tracking for all encryption, decryption, and key operations. Every transaction is authenticated and verified.
            </div>
          </div>
          <button
            onClick={fetchActivities}
            className="p-1.5 rounded-lg bg-[#101622] hover:bg-[#1E293B] text-[#00D4FF] border border-[#1E293B] transition-colors shrink-0"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="p-4 bg-[#101622] border-[#1E293B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by target or log ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B12] text-xs font-mono text-[#F8FAFC] border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none placeholder-[#64748B]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#64748B] shrink-0 hidden sm:inline-block" />
            {['All', 'Encryption', 'Decryption', 'Key Rotation', 'Deletion'].map((op) => (
              <button
                key={op}
                onClick={() => setSelectedOp(op)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  selectedOp === op
                    ? 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30 font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B]'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </Card>

        {/* Audit Table */}
        <Card className="bg-[#101622] border-[#1E293B] overflow-hidden">
          {filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#141D2B]/50 text-[11px] font-mono uppercase text-[#94A3B8]">
                    <th className="py-3 px-4">Operation</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Origin Context</th>
                    <th className="py-3 px-4">SHA-256 Digest</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/70 text-xs font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#141D2B]/50 transition-colors">
                      <td className="py-3.5 px-4">{getOpBadge(log.operation)}</td>
                      <td className="py-3.5 px-4 font-sans font-medium text-[#F8FAFC]">
                        {log.target}
                      </td>
                      <td className="py-3.5 px-4 text-[#94A3B8]">{log.timestamp}</td>
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">{log.clientIp}</td>
                      <td className="py-3.5 px-4 text-[#00D4FF] text-[11px]">{log.shaDigest}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#141D2B] border border-[#1E293B] flex items-center justify-center mx-auto text-[#64748B]">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">No Audit Records Found</h4>
              <p className="text-xs text-[#94A3B8]">No log entries matched your filter query.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedOp('All');
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
