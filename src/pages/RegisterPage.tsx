import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PasswordRequirements, getPasswordRequirements } from '../components/auth/PasswordRequirements';
import { Link, useNavigate } from '../router';
import { useAuth } from '../context/AuthContext';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Email validation regex
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    // Email
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g. user@domain.com).';
    }

    // Password requirements check
    const rules = getPasswordRequirements(password);
    const allRulesPassed = rules.every((r) => r.isValid);
    if (!password) {
      newErrors.password = 'Master password is required.';
    } else if (!allRulesPassed) {
      newErrors.password = 'Password does not meet all required complexity criteria below.';
    }

    // Confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Terms agreement
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service & Privacy Policy to proceed.';
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
      await register(fullName.trim(), email.trim(), password);
      setSubmissionStatus('Account successfully created! Redirecting to your CryptX vault...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Secure Vault"
      subtitle="Establish your sovereign cryptographic profile with client-side key isolation."
      authMode="register"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
        {/* API Error Banner */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300 font-sans leading-relaxed">
              <strong className="text-rose-400 block font-mono mb-0.5">Registration Failed</strong>
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

        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="e.g. Dr. Jane Doe"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) {
              setErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          leftIcon={<User className="w-4 h-4" />}
          error={errors.fullName}
          required
        />

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

        {/* Master Password */}
        <Input
          label="Master Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="new-password"
          placeholder="Create master password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
            if (errors.confirmPassword && confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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

        {/* Password Requirements Checklist & Entropy Meter */}
        <PasswordRequirements password={password} />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat master password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword}
          required
          rightAction={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#00D4FF]"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Terms and Privacy Policy Agreement */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#94A3B8]">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: undefined }));
                }
              }}
              className="w-4 h-4 rounded bg-[#080B12] border-[#1E293B] text-[#00D4FF] focus:ring-[#00D4FF]/40 focus:ring-offset-0 focus:ring-1 mt-0.5"
            />
            <span className="leading-relaxed">
              I acknowledge the{' '}
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-[#00D4FF] hover:underline"
              >
                Terms of Service
              </button>{' '}
              and agree to the sovereign cryptographic data handling rules.
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-red-400 mt-1 font-sans">{errors.terms}</p>
          )}
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
            Create Secure Account
          </Button>
        </div>

        {/* Switch to Login */}
        <div className="pt-3 border-t border-[#1E293B]/70 text-center text-xs font-mono text-[#94A3B8]">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#00D4FF] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </form>

      {/* Terms and Policy Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="Terms of Service & Data Sovereignty Policy"
        subtitle="CryptX Academic Research Platform Architecture"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          <p>
            By initializing a vault profile on <strong>CryptX</strong>, you agree to the cryptographic
            governance model:
          </p>
          <ul className="space-y-2 font-mono text-xs text-slate-300 bg-[#080B12] p-3.5 rounded-xl border border-[#1E293B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Plaintext Storage:</strong> The platform will never record or persist raw
                data or passwords in unencrypted format.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Key Custody:</strong> Cryptographic keys remain the exclusive possession of the
                user. Data recovery depends upon authenticated recovery parameters.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Standardized Algorithms:</strong> Encryption is executed via AES-256-GCM and SHA-256 digests.
              </span>
            </li>
          </ul>
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsTermsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
};
