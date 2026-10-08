import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }> = ({ 
  className, hover = false, children, ...props 
}) => {
  return (
    <div 
      className={cn("glass-card", hover && "glass-card-hover", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
