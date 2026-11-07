import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  Info,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { api, VaultFileItem } from '../../services/api';

export const VaultPage: React.FC = () => {
  const [items, setItems] = useState<VaultFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');
  const [itemToDelete, setItemToDelete] = useState<VaultFileItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const catParam = selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase();
      const files = await api.listVaultFiles(catParam, searchQuery || undefined);
      setItems(files);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch vault items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedCategory, searchQuery]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortOrder === 'date-desc') return b.created_at.localeCompare(a.created_at);
      if (sortOrder === 'date-asc') return a.created_at.localeCompare(b.created_at);
      if (sortOrder === 'name-asc') return a.original_filename.localeCompare(b.original_filename);
      if (sortOrder === 'name-desc') return b.original_filename.localeCompare(a.original_filename);
      return 0;
    });
  }, [items, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteVaultFile(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadDecrypted = async (item: VaultFileItem) => {
    try {
      const { blob, filename } = await api.decryptFileBlob(item.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Decryption download failed: ${err.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'document':
        return <FileText className="w-4 h-4 text-[#3B82F6]" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#00D4FF]" />;
      case 'text':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  return (
    <DashboardLayout
      pageTitle="My Vault Registry"
      pageDescription="Encrypted cloud object management with bit-exact integrity tracking and access controls."
      breadcrumbs={['Storage', 'My Vault']}
    >
      <div className="space-y-6 text-left max-w-6xl">
        {/* Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
                Authenticated Cloud Storage Vault:
              </strong>
              Files displayed here are stored as <strong>AES-256-GCM ciphertext</strong>. Clicking Decrypt verifies authentication tags in real-time before streaming original plaintext to your device.
            </div>
          </div>
          <button
            onClick={fetchFiles}
            className="p-1.5 rounded-lg bg-[#101622] hover:bg-[#1E293B] text-[#00D4FF] border border-[#1E293B] transition-colors shrink-0"
            title="Refresh Vault"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter & Search Control Bar */}
        <Card className="p-4 bg-[#101622] border-[#1E293B] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search encrypted files by name or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B12] text-xs font-mono text-[#F8FAFC] border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none placeholder-[#64748B]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#64748B] shrink-0 hidden sm:inline-block" />
            {['All', 'Document', 'Image', 'File'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#080B12] text-xs font-mono text-[#F8FAFC] border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </Card>

        {/* File Ledger Table */}
        <Card className="bg-[#101622] border-[#1E293B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#080B12]/80 text-[#94A3B8] text-[11px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">SHA-256 Digest</th>
                  <th className="py-3 px-4">Encrypted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-xs font-mono text-[#F8FAFC]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                      Loading encrypted vault registry...
                    </td>
                  </tr>
                ) : sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748B]">
                      No encrypted files found in vault. Upload files via the File or Image encryption tools.
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#141D2B]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {getCategoryIcon(item.category)}
                          <span className="font-bold text-[#F8FAFC] truncate max-w-[220px]" title={item.original_filename}>
                            {item.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#94A3B8] capitalize">{item.category}</td>
                      <td className="py-3.5 px-4 text-[#94A3B8]">{formatFileSize(item.file_size)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 text-[10px]">
                          {item.encryption_algorithm}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {item.sha256_hash.substring(0, 12)}...
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadDecrypted(item)}
                            className="p-1.5 rounded-lg text-[#00D4FF] hover:bg-[#141D2B] transition-colors"
                            title="Decrypt & Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-[#141D2B] transition-colors"
                            title="Delete File from Vault"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <Modal
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            title="Permanently Delete Encrypted File"
          >
            <div className="space-y-4 text-left">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#F8FAFC] font-mono">{itemToDelete.original_filename}</strong>?
                This will delete the encrypted ciphertext file and purge its wrapped DEK.
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#1E293B]">
                <Button variant="ghost" size="sm" onClick={() => setItemToDelete(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Delete File'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
