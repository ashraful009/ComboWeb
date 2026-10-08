import React from 'react';
import { cn } from './GlassCard';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, variant = 'primary', isLoading, children, disabled, ...props 
}) => {
  const base = "pill-button inline-flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none hover:shadow-none hover:-translate-y-0",
  };

  return (
    <button 
      className={cn(base, variants[variant], (disabled || isLoading) && "opacity-60 cursor-not-allowed pointer-events-none", className)} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
