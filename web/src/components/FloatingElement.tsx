import React from 'react';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  amplitude?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className,
  duration = 6,
  delay = 0,
  amplitude = 10,
}) => {
  return (
    <div
      className={cn('will-change-transform', className)}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        ['--amplitude' as string]: `${amplitude}px`,
      }}
    >
      {children}
    </div>
  );
};
