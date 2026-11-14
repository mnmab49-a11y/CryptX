import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Link, useNavigate } from '../router';
import { useAuth } from '../context/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Email validation regex
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g. user@domain.com).';
    }

    if (!password) {
      newErrors.password = 'Master password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);
      setSubmissionStatus('Authentication successful. Redirecting to your CryptX vault...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout
      title="Access Your Vault"
      subtitle="Authenticate with your credentials to unlock your isolated encryption environment."
      authMode="login"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left">
        {/* API Error Banner */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300 font-sans leading-relaxed">
              <strong className="text-rose-400 block font-mono mb-0.5">Authentication Failed</strong>
              {apiError}
            </div>
          </div>
        )}

        {/* Status Confirmation Banner */}
        {submissionStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-2.5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 font-sans leading-relaxed">
                <strong className="text-emerald-400 block font-mono mb-0.5">
                  Client Validation Succeeded
                </strong>
                {submissionStatus}
              </div>
            </div>
            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Dashboard Console
              </Button>
            </div>
          </div>
        )}

        {/* Email Address */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@domain.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email}
          required
        />

        {/* Password */}
        <Input
          label="Master Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="Enter master password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password}
          required
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#00D4FF]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#94A3B8] hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-[#080B12] border-[#1E293B] text-[#00D4FF] focus:ring-[#00D4FF]/40 focus:ring-offset-0 focus:ring-1"
            />
            <span>Remember session identifier</span>
          </label>

          <button
            type="button"
            onClick={() => setIsForgotModalOpen(true)}
            className="text-[#00D4FF] hover:underline focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full justify-center shadow-lg"
          >
            Sign In to Vault
          </Button>
        </div>

        {/* Switch to Registration */}
        <div className="pt-3 border-t border-[#1E293B]/70 text-center text-xs font-mono text-[#94A3B8]">
          <span>Don&apos;t have an account? </span>
          <Link to="/register" className="text-[#00D4FF] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </form>

      {/* Forgot Password Disclosure Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Master Key Recovery Policy"
        subtitle="Cryptographic Identity & Password Reset Notice"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          <div className="p-3 rounded-lg bg-[#141D2B] border border-[#1E293B] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
            <p>
              In CryptX, user data is sealed using authenticated <strong>AES-256-GCM</strong> keys derived from your master password.
            </p>
          </div>
          <p>
            CryptX operates on a zero-knowledge cryptographic foundation. Passwords are never stored
            or recoverable in plaintext on our servers. Payload encryption keys are wrapped using
            NIST RFC 3394 key envelopes and can only be derived with your master credentials.
          </p>
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsForgotModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
};
