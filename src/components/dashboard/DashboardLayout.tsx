import React, { useState, ReactNode } from 'react';
import {
  Shield,
  KeyRound,
  LayoutDashboard,
  FileCode,
  Files,
  Image as ImageIcon,
  FolderLock,
  History,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  User,
  Info
} from 'lucide-react';
import { Link, useLocation, useNavigate } from '../../router';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Encrypt Text', href: '/dashboard/text', icon: <FileCode className="w-4 h-4" /> },
  { label: 'Encrypt Files', href: '/dashboard/files', icon: <Files className="w-4 h-4" /> },
  { label: 'Encrypt Images', href: '/dashboard/images', icon: <ImageIcon className="w-4 h-4" /> },
  { label: 'My Vault', href: '/dashboard/vault', icon: <FolderLock className="w-4 h-4" /> },
  { label: 'Activity History', href: '/dashboard/activity', icon: <History className="w-4 h-4" /> },
  { label: 'Key Management', href: '/dashboard/keys', icon: <KeyRound className="w-4 h-4" /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
];

export interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageDescription?: string;
  breadcrumbs?: string[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
  pageDescription,
  breadcrumbs = [],
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex font-sans bg-grid-pattern selection:bg-[#00D4FF]/20 selection:text-[#00D4FF]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#101622] border-r border-[#1E293B] shrink-0 sticky top-0 h-screen z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#1E293B] gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#080B12] border border-[#1E293B] group-hover:border-[#00D4FF]/50 transition-colors">
              <Shield className="w-4 h-4 text-[#00D4FF]" />
              <KeyRound className="w-2 h-2 text-[#3B82F6] absolute bottom-1 right-1" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider text-[#F8FAFC]">
                CRYPT<span className="text-[#00D4FF]">X</span>
              </span>
              <span className="text-[9px] font-mono uppercase text-[#94A3B8] tracking-widest">
                Vault Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Platform Console
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#141D2B] text-[#00D4FF] border border-[#00D4FF]/30 shadow-[0_0_15px_-3px_rgba(0,212,255,0.15)]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-[#00D4FF]' : 'text-[#64748B] group-hover:text-[#94A3B8]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#101622] text-[#94A3B8] border border-[#1E293B]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0c111a]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#141D2B] border border-[#1E293B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/25 flex items-center justify-center text-[#00D4FF] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#F8FAFC] truncate">
                  {user?.full_name || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono truncate">
                  {user?.email || 'Encrypted Session'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-[#101622] transition-colors focus:outline-none"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-[#101622]/90 border-b border-[#1E293B] backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B] focus:outline-none"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <nav className="flex items-center gap-1.5 text-xs font-mono text-[#94A3B8]">
              <Link to="/" className="hover:text-[#F8FAFC] transition-colors">
                CryptX
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
              <Link to="/dashboard" className="hover:text-[#F8FAFC] transition-colors">
                Console
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-[#F8FAFC] font-medium">{crumb}</span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right: Security Pill & Notifications */}
          <div className="flex items-center gap-3">
            {/* Cryptographic Isolation Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256-GCM Spec</span>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B] border border-transparent hover:border-[#1E293B] relative focus:outline-none"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D4FF]" />
              </button>

              {/* Notification Popover Drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#101622] border border-[#1E293B] rounded-2xl shadow-2xl p-4 z-50 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                    <span className="text-xs font-bold font-mono uppercase text-[#F8FAFC]">
                      Security Telemetry
                    </span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[#64748B] hover:text-[#F8FAFC]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-[#1E293B]/60 text-xs space-y-2 pt-2">
                    <div className="pt-2">
                      <div className="font-semibold text-[#F8FAFC]">Phase 3 Frontend Environment</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">
                        Client dashboard operational. FastAPI cryptographic endpoints connect in Phase 4.
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1">Status: Ready</div>
                    </div>
                    <div className="pt-2">
                      <div className="font-semibold text-[#F8FAFC]">Key Derivation Baseline</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">
                        PBKDF2/KMS envelope schema active in UI specification.
                      </div>
                      <div className="text-[10px] font-mono text-[#00D4FF] mt-1">Audit: Verified</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Logout for Top Bar */}
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B] border border-transparent hover:border-[#1E293B] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* Security Workspace Status Banner */}
        <div className="bg-[#141D2B]/90 border-b border-[#1E293B] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2 min-w-0">
            <Info className="w-4 h-4 text-[#00D4FF] shrink-0" />
            <span className="truncate">
              <strong>CryptX Secure Workspace:</strong> Authenticated session active. AES-256-GCM authenticated cipher streams protect all operations.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 shrink-0 ml-2 hidden sm:inline-block">
            Session Active
          </span>
        </div>

        {/* Dynamic Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              {pageTitle}
            </h1>
            {pageDescription && (
              <p className="mt-1 text-sm text-[#94A3B8]">{pageDescription}</p>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#080B12]/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-72 bg-[#101622] border-r border-[#1E293B] h-full flex flex-col p-4 z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00D4FF]" />
                <span className="font-bold text-sm text-[#F8FAFC]">CRYPTX VAULT</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-[#141D2B] text-[#00D4FF] border border-[#00D4FF]/30'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#101622] text-[#94A3B8]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-[#F8FAFC]">Mina Amjad</div>
                <div className="text-[10px] text-[#94A3B8]">Demo Session</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
