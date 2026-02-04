import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  className?: string;
  variant?: 'hero' | 'cta' | 'subtle';
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  className,
  variant = 'hero',
}) => {
  const variants = {
    hero: (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-lime/10" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-lime/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-charcoal/5 rounded-full blur-3xl" />
      </>
    ),
    cta: (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-charcoal/90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-lime/10 rounded-full blur-3xl" />
      </>
    ),
    subtle: (
      <>
        <div className="absolute inset-0 bg-white" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </>
    ),
  };

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {variants[variant]}
    </div>
  );
};
