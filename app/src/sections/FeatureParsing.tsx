import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchImage } from '@/components/GlitchImage';
import { Check, Zap, Eye, Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Eye,
    title: '上下文感知分析',
    description: 'AI 理解合同条款的上下文关系，而非简单的关键词匹配',
  },
  {
    icon: Zap,
    title: '风险热力图可视化',
    description: '直观展示合同中的风险分布，优先级一目了然',
  },
];

export const FeatureParsing: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { x: 50, opacity: 0 },
        {
          x: 0,
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

      // Image parallax layers
      const layers = imageRef.current?.querySelectorAll('.parallax-layer');
      layers?.forEach((layer, index) => {
        gsap.to(layer, {
          y: (index + 1) * 30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative order-2 lg:order-1 h-full min-h-[500px]"
            style={{ perspective: '1000px' }}
          >
            <div className="absolute inset-0 bg-lime/20 rounded-3xl rotate-6 scale-95 blur-xl"></div>
            <div className="relative h-full rounded-3xl bg-charcoal p-6 shadow-2xl border border-gray-800 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <span className="text-white font-bold text-lg tracking-wider">SaaS</span>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>Design</span>
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-8 mb-8">
                <div className="text-white font-medium border-b-2 border-lime pb-2 px-1">原始合同</div>
                <div className="text-gray-500 font-medium pb-2 px-1">风险解析结果</div>
              </div>

              {/* Content Mockup */}
              <div className="space-y-4 opacity-80 flex-1 relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-charcoal pointer-events-none z-10"></div>
                 
                 {/* Highlighted block */}
                 <div className="flex gap-3">
                   <div className="w-1 bg-lime/50 rounded-full h-12 mt-1"></div>
                   <div className="flex-1 bg-lime/10 border border-lime/20 p-3 rounded-lg">
                      <div className="h-2 bg-lime/40 rounded w-full mb-2"></div>
                      <div className="h-2 bg-lime/40 rounded w-2/3"></div>
                   </div>
                 </div>

                 {/* Standard text */}
                 <div className="space-y-2 pl-4">
                   <div className="h-2 bg-gray-700 rounded w-full"></div>
                   <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                   <div className="h-2 bg-gray-700 rounded w-4/5"></div>
                 </div>

                 {/* Another Highlight */}
                 <div className="flex gap-3 pt-2">
                   <div className="w-1 bg-yellow-500/50 rounded-full h-12 mt-1"></div>
                   <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <div className="h-2 bg-yellow-500/40 rounded w-11/12 mb-2"></div>
                      <div className="h-2 bg-yellow-500/40 rounded w-1/2"></div>
                   </div>
                 </div>
                 
                 {/* Standard text */}
                 <div className="space-y-2 pl-4">
                   <div className="h-2 bg-gray-700 rounded w-11/12"></div>
                   <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                 </div>
              </div>

              {/* Footer Status */}
              <div className="mt-auto pt-6 flex items-center gap-3 border-t border-white/5">
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-md border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></div>
                  <span className="text-lime text-xs font-mono tracking-wider">OCR_SCANNING: ACTIVE</span>
                </div>
                <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-lime w-2/3 animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="parallax-layer absolute -top-8 -right-8 w-32 h-32 bg-lime/30 rounded-full blur-3xl animate-pulse" />
            <div className="parallax-layer absolute -bottom-8 -left-8 w-48 h-48 bg-charcoal/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div ref={contentRef} className="order-1 lg:order-2 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-lime/10 rounded-full px-4 py-2 w-fit">
              <Check className="w-4 h-4 text-lime" />
              <span className="text-sm font-medium text-charcoal">核心功能一</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-charcoal">
              极速多模态解析
              <span className="block text-gray-400 text-2xl lg:text-3xl mt-2 font-normal">
                Omni-Parsing
              </span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              支持 PDF、Word、甚至手机拍照的合同扫描件。利用视觉 AI 保持文档原版排版结构，
              确保"所见即所审"。我们的 AI 在几秒钟内解构复杂的法律术语，识别风险并以清晰的视觉层级突出显示。
            </p>

            <div className="flex flex-col gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-lime" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
