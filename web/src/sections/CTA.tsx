import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '@/components/MagneticButton';
import { GradientBackground } from '@/components/GradientBackground';
import { ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CTAProps {
  onOpenTrial: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onOpenTrial }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Pulsing glow animation
      gsap.to(glowRef.current, {
        scale: 1.2,
        opacity: 0.5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <GradientBackground variant="cta" />
      
      {/* Pulsing glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-lime" />
            <span className="text-sm font-medium text-white">14 天免费试用</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            准备好保护您的
            <span className="text-lime">合同</span>了吗？
          </h2>

          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            加入 10,000+ 法律团队的行列，让 NexDoc AI 成为您的数字法务官
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <MagneticButton
              variant="primary"
              className="animate-pulse-glow"
              onClick={onOpenTrial}
            >
              开始免费试用
              <ArrowRight className="w-4 h-4 ml-2" />
            </MagneticButton>
            <MagneticButton variant="secondary">
              联系销售团队
            </MagneticButton>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            无需信用卡 · 随时取消 · 全功能体验
          </p>
        </div>
      </div>
    </section>
  );
};
