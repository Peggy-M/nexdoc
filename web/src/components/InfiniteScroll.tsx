import React from 'react';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  className,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
}) => {
  const animationDirection = direction === 'left' ? 'scroll-left' : 'scroll-right';
  
  return (
    <div
      className={cn(
        'overflow-hidden',
        pauseOnHover && 'hover:[&>div]:animation-paused',
        className
      )}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `${animationDirection} ${speed}s linear infinite`,
        }}
      >
        <div className="flex items-center gap-12 pr-12">{children}</div>
        <div className="flex items-center gap-12 pr-12">{children}</div>
      </div>
    </div>
  );
};
