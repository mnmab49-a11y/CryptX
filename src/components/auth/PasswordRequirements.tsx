import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordRule {
  id: string;
  label: string;
  isValid: boolean;
}

export interface PasswordRequirementsProps {
  password: string;
}

export const getPasswordRequirements = (password: string): PasswordRule[] => {
  return [
    {
      id: 'length',
      label: 'Minimum 8 characters',
      isValid: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      isValid: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      isValid: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      isValid: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      isValid: /[^A-Za-z0-9]/.test(password),
    },
  ];
};

export const getPasswordStrength = (rules: PasswordRule[]) => {
  const validCount = rules.filter((r) => r.isValid).length;
  if (validCount <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
  if (validCount <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
  if (validCount === 4) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
};

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const rules = getPasswordRequirements(password);
  const strength = getPasswordStrength(rules);
  const showStrength = password.length > 0;

  return (
    <div className="space-y-3 p-3.5 rounded-xl bg-[#080B12] border border-[#1E293B]">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#94A3B8]">Cryptographic Entropy:</span>
          {showStrength ? (
            <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
          ) : (
            <span className="text-slate-500">Not Evaluated</span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          <div
            className={`rounded-full transition-colors duration-300 ${
              showStrength && strength.score >= 1 ? strength.color : 'bg-[#1E293B]'
            }`}
          />
          <div
            className={`rounded-full transition-colors duration-300 ${
              showStrength && strength.score >= 2 ? strength.color : 'bg-[#1E293B]'
            }`}
          />
          <div
            className={`rounded-full transition-colors duration-300 ${
              showStrength && strength.score >= 3 ? strength.color : 'bg-[#1E293B]'
            }`}
          />
          <div
            className={`rounded-full transition-colors duration-300 ${
              showStrength && strength.score >= 4 ? strength.color : 'bg-[#1E293B]'
            }`}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="pt-2 border-t border-[#1E293B]/70 space-y-1.5">
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Required Complexity:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                rule.isValid ? 'text-emerald-400 font-medium' : 'text-[#64748B]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  rule.isValid
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#101622] text-[#64748B] border border-[#1E293B]'
                }`}
              >
                {rule.isValid ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
              </div>
              <span className="truncate">{rule.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
