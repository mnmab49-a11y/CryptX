import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightAction,
      className = '',
      containerClassName = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider"
            >
              {label}
              {required && <span className="text-[#00D4FF] ml-1">*</span>}
            </label>
          </div>
        )}

        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full rounded-lg bg-[#080B12] text-[#F8FAFC] text-sm font-sans transition-all duration-200 placeholder-[#64748B] focus:outline-none focus:ring-1 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightAction ? 'pr-11' : 'pr-3.5'} py-2.5 border ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30'
                : 'border-[#1E293B] focus:border-[#00D4FF] focus:ring-[#00D4FF]/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-[#101622]' : ''} ${className}`}
            {...props}
          />

          {rightAction && (
            <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
              {rightAction}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-400 font-sans mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-[#94A3B8] font-mono mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
