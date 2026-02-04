import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchImage } from '@/components/GlitchImage';
import { Shield, AlertTriangle, RefreshCw, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: RefreshCw,
    title: '实时监管更新',
    description: '数据库持续同步最新法规变化，确保合规检查始终准确',
  },
  {
    icon: AlertTriangle,
    title: '自动合规标记',
    description: '系统自动识别不合规条款，并提供修改建议',
  },
];

export const FeatureCompliance: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { x: -50, opacity: 0 },
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

      // Glitch effect trigger on scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 50%',
        onEnter: () => {
          const glitchElement = imageRef.current?.querySelector('.glitch-active');
          if (glitchElement) {
            glitchElement.classList.add('active');
            setTimeout(() => {
              glitchElement.classList.remove('active');
            }, 800);
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <div ref={contentRef} className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-lime/10 rounded-full px-4 py-2 w-fit">
              <Shield className="w-4 h-4 text-lime" />
              <span className="text-sm font-medium text-charcoal">核心功能二</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-charcoal">
              "上帝视角"深度审查
              <span className="block text-gray-400 text-2xl lg:text-3xl mt-2 font-normal">
                Deep Scan
              </span>
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-white rounded-xl border-l-4 border-lime">
                <h3 className="font-semibold text-charcoal mb-2">规范性检查</h3>
                <p className="text-sm text-gray-500">
                  序号逻辑、金额大小写一致性、主体信息完整性自动校验
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-xl border-l-4 border-orange-400">
                <h3 className="font-semibold text-charcoal mb-2">风险扫描</h3>
                <p className="text-sm text-gray-500">
                  识别不平等条款、管辖地陷阱、过高的违约金比例
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-xl border-l-4 border-red-400">
                <h3 className="font-semibold text-charcoal mb-2">漏洞捕捉</h3>
                <p className="text-sm text-gray-500">
                  发现"合同真空区"——即应该写而没写的条款，如不可抗力、争议解决
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-lime" />
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal mb-1">
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

          {/* Image */}
          <div
            ref={imageRef}
            className="relative h-full min-h-[500px]"
            style={{ perspective: '1000px' }}
          >
            <div className="absolute inset-0 bg-charcoal rounded-3xl -rotate-3 scale-95 opacity-10"></div>
            <div className="relative h-full rounded-3xl bg-charcoal p-8 shadow-2xl border border-gray-800 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <span className="text-white font-bold text-2xl tracking-tight">SaaS</span>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></div>
                    <span className="text-[10px] text-gray-300 font-mono uppercase">Engine: Online</span>
                  </div>
                  <span className="text-[10px] text-lime font-mono uppercase bg-lime/10 px-2 py-1 rounded-md">Risk Level: Low</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-4 flex-1">
                {[
                  '数据加密合规性',
                  '用户隐私保护',
                  '访问权限管理',
                  '日志审计完整性',
                  '备份恢复机制'
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-lime/30 hover:bg-white/10 transition-all duration-300 group cursor-default"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center shadow-lg shadow-lime/20 group-hover:scale-110 transition-transform">
                        <Check className="w-5 h-5 text-charcoal stroke-[3]" />
                      </div>
                      <span className="text-gray-200 font-medium group-hover:text-white transition-colors">{item}</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-lime/10 text-lime text-xs font-bold border border-lime/20 shadow-sm">
                      已通过
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Bottom decorative fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-charcoal to-transparent pointer-events-none rounded-b-3xl"></div>
            </div>
            
            {/* Decorative */}
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-lime rounded-full opacity-20 blur-[100px]" />
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-[100px]" />
          </div>
        </div>
      </div>
    </section>
  );
};
