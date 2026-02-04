import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className,
  as: Component = 'span',
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const chars = children.split('');
    textRef.current.innerHTML = chars
      .map((char) => `<span class="inline-block overflow-hidden"><span class="inline-block translate-y-full opacity-0">${char === ' ' ? '&nbsp;' : char}</span></span>`)
      .join('');

    const innerSpans = textRef.current.querySelectorAll('span > span');

    gsap.to(innerSpans, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.03,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [children, delay]);

  return (
    <div ref={containerRef} className="overflow-hidden">
      <Component ref={textRef as any} className={cn('inline-block', className)}>
        {children}
      </Component>
    </div>
  );
};
