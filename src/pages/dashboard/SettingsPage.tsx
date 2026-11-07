import React, { useState } from 'react';
import {
  User,
  Shield,
  Lock,
  HardDrive,
  Clock,
  Trash2,
  Download,
  Info,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'account'>('profile');
  const [name, setName] = useState('Mina Amjad');
  const [email] = useState('mnmab49@gmail.com');
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [clipboardClear, setClipboardClear] = useState(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = (section: string) => {
    setSaveNotice(`Settings for "${section}" saved locally in client memory. Backend profile synchronization will activate in Phase 4.`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <DashboardLayout
      pageTitle="Vault Preferences & Security Configuration"
      pageDescription="Manage your cryptographic profile, session timeouts, and client environment preferences."
      breadcrumbs={['Settings']}
    >
      <div className="space-y-6 text-left max-w-5xl">
        {/* Notice Banner */}
        <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] flex items-start gap-3 text-xs text-[#94A3B8]">
          <Info className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F8FAFC] block mb-0.5 font-mono">
              Client Preferences Interface (Frontend Phase 3):
            </strong>
            Configuration choices below govern the client UI experience. Multi-factor authentication (MFA) and persistent profile storage connect via PostgreSQL in Phase 4.
          </div>
        </div>

        {/* Status Toast */}
        {saveNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-1 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile Profile', icon: <User className="w-4 h-4" /> },
            { id: 'security', label: 'Security Protocols', icon: <Shield className="w-4 h-4" /> },
            { id: 'appearance', label: 'Appearance', icon: <Lock className="w-4 h-4" /> },
            { id: 'account', label: 'Vault Data & Account', icon: <HardDrive className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#141D2B] text-[#00D4FF] border border-[#00D4FF]/30 font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B]/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Operator Profile</h3>
              <p className="text-xs text-[#94A3B8]">Identity associated with this cryptographic vault session.</p>
            </div>

            <div className="space-y-4 max-w-lg">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                readOnly
                disabled
                helperText="Email modification is disabled in demo mode."
              />

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1">
                  Assigned Security Role
                </label>
                <input
                  type="text"
                  value="Security Architect &bull; Vault Custodian"
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] text-xs font-mono text-[#00D4FF] border border-[#1E293B] cursor-not-allowed opacity-80"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSave('Profile')}
                >
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Client Session &amp; Memory Safeguards</h3>
              <p className="text-xs text-[#94A3B8]">Configure ephemeral memory handling and session timeouts.</p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
                  Inactivity Vault Lock Timeout
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full bg-[#080B12] text-[#F8FAFC] text-xs font-mono p-2.5 rounded-lg border border-[#1E293B] focus:border-[#00D4FF] focus:outline-none"
                >
                  <option value="5">5 Minutes</option>
                  <option value="15">15 Minutes (Recommended)</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                </select>
                <p className="text-[11px] text-[#64748B] font-mono mt-1">
                  Automatically clears memory keys after periods of idle inactivity.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#F8FAFC]">
                  <input
                    type="checkbox"
                    checked={clipboardClear}
                    onChange={(e) => setClipboardClear(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#080B12] border-[#1E293B] text-[#00D4FF] focus:ring-[#00D4FF]/40 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold block">Automatic Clipboard Scrubbing</span>
                    <span className="text-[#94A3B8] text-[11px] block">
                      Purges copied decrypted plaintext from OS clipboard after 45 seconds.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSave('Security Protocols')}
                >
                  Apply Security Preferences
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 3: Appearance */}
        {activeTab === 'appearance' && (
          <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Visual Interface Preferences</h3>
              <p className="text-xs text-[#94A3B8]">CryptX design system specifications.</p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#00D4FF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8FAFC]">Cybersecurity Dark Theme</span>
                  <span className="text-[10px] font-mono text-[#00D4FF] font-semibold">Active &bull; System Default</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  CryptX enforces high-contrast dark tones (`#080B12`, `#101622`, `#141D2B`) to maximize operational legibility during cryptographic key audits.
                </p>
                <div className="flex gap-2 pt-2">
                  <div className="w-6 h-6 rounded bg-[#080B12] border border-[#1E293B]" title="#080B12" />
                  <div className="w-6 h-6 rounded bg-[#101622] border border-[#1E293B]" title="#101622" />
                  <div className="w-6 h-6 rounded bg-[#141D2B] border border-[#1E293B]" title="#141D2B" />
                  <div className="w-6 h-6 rounded bg-[#00D4FF]" title="#00D4FF" />
                  <div className="w-6 h-6 rounded bg-[#3B82F6]" title="#3B82F6" />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 4: Account & Danger Zone */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <Card className="p-6 bg-[#101622] border-[#1E293B] space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Export Vault Metadata Manifest</h3>
                <p className="text-xs text-[#94A3B8]">
                  Download your encrypted object manifest and SHA-256 verification hash list.
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => {
                  alert('Phase 3 Demo: Export manifest downloaded as JSON.');
                }}
              >
                Export Manifest (.json)
              </Button>
            </Card>

            <Card className="p-6 bg-[#101622] border-red-500/30 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Danger Zone &bull; Vault Purge
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Irreversibly delete your vault registry reference and zero all cached key derivation parameters.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                  onClick={() => {
                    alert('Phase 3 Notice: Vault purge simulation acknowledged. No backend changes executed.');
                  }}
                >
                  Purge Vault Registry
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
