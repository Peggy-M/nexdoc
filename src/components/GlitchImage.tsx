import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlitchImageProps {
  src: string;
  alt: string;
  className?: string;
  triggerOnScroll?: boolean;
}

export const GlitchImage: React.FC<GlitchImageProps> = ({
  src,
  alt,
  className,
  triggerOnScroll = true,
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!triggerOnScroll) {
      setIsVisible(true);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 800);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 800);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById(`glitch-${alt}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [triggerOnScroll, isVisible, alt]);

  return (
    <div
      id={`glitch-${alt}`}
      className={cn('relative overflow-hidden', className)}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-all duration-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      />
      {isGlitching && (
        <>
          <div
            className="absolute inset-0 bg-lime/20 mix-blend-overlay"
            style={{
              animation: 'glitch 0.3s linear',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: 'glitch 0.3s linear reverse',
              mixBlendMode: 'difference',
            }}
          />
        </>
      )}
    </div>
  );
};
