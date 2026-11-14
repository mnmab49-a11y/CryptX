import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  hoverEffect?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';

  const variantStyles = {
    default: 'bg-[#141D2B] border border-[#1E293B]',
    elevated: 'bg-[#101622] border border-[#1E293B] shadow-xl',
    glass: 'bg-[#141D2B]/80 backdrop-blur-md border border-[#1E293B]/80',
  };

  const hoverStyles = hoverEffect
    ? 'hover:border-[#00D4FF]/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(0,212,255,0.12)]'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
