import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, Menu, X, ArrowRight, Lock, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { NavItem } from '../../types';
import { Link, useNavigate } from '../../router';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'About', href: '#about' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (onOpenAuthModal) {
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080B12]/90 backdrop-blur-md border-b border-[#1E293B] py-3.5 shadow-lg shadow-black/30'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#00D4FF] rounded-lg p-1"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#101622] to-[#141D2B] border border-[#1E293B] group-hover:border-[#00D4FF]/50 transition-colors shadow-inner">
              <Shield className="w-5 h-5 text-[#00D4FF]" />
              <KeyRound className="w-3 h-3 text-[#3B82F6] absolute bottom-2 right-2 opacity-90" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-wider text-[#F8FAFC]">
                  CRYPT<span className="text-[#00D4FF]">X</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-semibold">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-[#94A3B8] tracking-widest uppercase font-mono hidden sm:inline-block">
                Secure Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3.5 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B]/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg border border-[#00D4FF]/25 transition-colors"
                >
                  <span>Vault Console</span>
                </Link>
                <div className="text-xs font-mono text-[#94A3B8] px-2 py-1 bg-[#141D2B] rounded-lg border border-[#1E293B]">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Exit
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Lock className="w-4 h-4 text-[#94A3B8]" />}
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleRegisterClick}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B] border border-transparent hover:border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E293B] bg-[#101622]/98 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141D2B] rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#1E293B] flex flex-col gap-2.5">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-mono font-semibold rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25"
            >
              Enter Vault Console
            </Link>
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLoginClick();
              }}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                setMobileMenuOpen(false);
                handleRegisterClick();
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
