import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '@/components/MagneticButton';
import { FloatingElement } from '@/components/FloatingElement';
import { GradientBackground } from '@/components/GradientBackground';
import { Shield, Play, Star, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onOpenTrial: () => void;
  onOpenVideo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTrial, onOpenVideo }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      );

      // Buttons animation
      gsap.fromTo(
        buttonsRef.current?.children || [],
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.6 }
      );

      // Image animation
      gsap.fromTo(
        imageRef.current,
        { rotateX: 45, opacity: 0, y: 50 },
        { rotateX: 0, opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', delay: 0.3 }
      );

      // Trust badge animation
      gsap.fromTo(
        trustRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.8 }
      );

      // Scroll parallax for image
      gsap.to(imageRef.current, {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Title scroll effect removed

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3D tilt effect for image
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    gsap.to(imageRef.current, {
      rotateY: x * 10,
      rotateX: -y * 10,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleImageMouseLeave = () => {
    gsap.to(imageRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden pt-20"
    >
      <GradientBackground variant="hero" />
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-16 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-lime/10 border border-lime/20 rounded-full px-4 py-2 w-fit">
              <Shield className="w-4 h-4 text-lime" />
              <span className="text-sm font-medium text-charcoal">
                DeepSeek-R1 推理引擎驱动
              </span>
            </div>

            {/* Title */}
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-charcoal leading-tight tracking-tight"
            >
              AI 驱动的
              <br />
              <span className="relative inline-block mt-4 group">
                <span className="absolute inset-0 bg-lime rounded-xl translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"></span>
                <span className="relative inline-block bg-charcoal text-lime px-6 py-2 rounded-xl shadow-xl">
                  合同防护
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-lg lg:text-xl text-gray-600 max-w-xl leading-relaxed"
            >
              在漏洞引发问题之前识别并修复。LexGuard 为现代团队提供精准的法律防护，
              模拟"数字法务官"思维，全量解构合同逻辑。
            </p>

            {/* Buttons */}
            <div ref={buttonsRef} className="flex flex-wrap gap-4">
              <MagneticButton variant="primary" onClick={onOpenTrial}>
                开始免费试用
              </MagneticButton>
              <MagneticButton variant="outline" onClick={onOpenVideo}>
                <Play className="w-4 h-4 mr-2" />
                观看演示
              </MagneticButton>
            </div>

            {/* Trust Badge */}
            <div ref={trustRef} className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-lime to-lime/60 border-2 border-white flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-charcoal" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-lime text-lime" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  受到 10,000+ 法律团队的信赖
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Image */}
          <div
            className="relative lg:h-[600px] flex items-center justify-center"
            style={{ perspective: '1000px' }}
          >
            <FloatingElement duration={6} amplitude={10}>
              <div
                ref={imageRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
              >
                <img
                  src="/images/hero-dashboard.jpg"
                  alt="LexGuard AI Dashboard"
                  className="w-full h-auto rounded-2xl"
                />
                {/* Glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-lime/10 to-transparent pointer-events-none" />
              </div>
            </FloatingElement>

            {/* Floating UI Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime animate-pulse" />
                <span className="text-sm font-medium">AI 分析中...</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-charcoal text-white rounded-xl shadow-lg p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-2xl font-bold text-lime">99.8%</div>
              <div className="text-xs text-gray-400">风险识别准确率</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
