import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'neutral' | 'emerald' | 'amber';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1 gap-2',
  };

  const variantStyles = {
    cyan: 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25',
    blue: 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/25',
    neutral: 'bg-[#141D2B] text-[#94A3B8] border border-[#1E293B]',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/25',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
