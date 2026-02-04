import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchImage } from '@/components/GlitchImage';
import { Users, MessageSquare, Edit3, AlertCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Users,
    title: '实时多人协作',
    description: '团队成员可同时编辑和审查同一份合同',
  },
  {
    icon: MessageSquare,
    title: '上下文评论',
    description: '在特定条款上添加评论，讨论更有针对性',
  },
  {
    icon: Edit3,
    title: '一键应用修订',
    description: 'AI 生成的修改建议可一键应用到文档',
  },
];

export const FeatureCollaboration: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const orbitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation with heavy feel
      gsap.fromTo(
        contentRef.current?.children || [],
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Orbiting elements
      const orbits = orbitsRef.current?.querySelectorAll('.orbit');
      orbits?.forEach((orbit, index) => {
        gsap.to(orbit, {
          rotation: 360,
          duration: 20 + index * 5,
          repeat: -1,
          ease: 'none',
          transformOrigin: 'center center',
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
          {/* Image with orbiting elements */}
          <div
            ref={orbitsRef}
            className="relative order-2 lg:order-1 h-[500px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-lime/5 rounded-full scale-150 blur-3xl animate-pulse-slow"></div>
            
            {/* Concentric Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[120%] h-[120%] border border-lime/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
              <div className="w-[100%] h-[100%] border border-lime/10 rounded-full animate-[spin_45s_linear_infinite_reverse]"></div>
              <div className="w-[80%] h-[80%] border border-lime/20 rounded-full animate-[spin_30s_linear_infinite]"></div>
            </div>

            {/* Main Circle */}
            <div className="relative w-80 h-80 rounded-full bg-charcoal overflow-hidden shadow-2xl border-4 border-gray-800 flex items-center justify-center z-10">
              {/* Dark UI Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
              
              {/* Avatars */}
              <div className="relative z-10 grid grid-cols-2 gap-4 scale-90">
                 {/* Mock Avatars */}
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-16 h-16 rounded-full bg-gray-700 border-2 border-charcoal overflow-hidden relative shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                   </div>
                 ))}
              </div>

              {/* Floating Chips */}
              <div className="absolute top-1/4 -left-12 bg-white text-charcoal px-4 py-2 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 animate-float z-20 border border-gray-100">
                <AlertCircle className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                条款需确认
              </div>
              <div className="absolute bottom-1/3 -right-12 bg-white text-charcoal px-4 py-2 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 animate-float z-20 border border-gray-100" style={{ animationDelay: '1.5s' }}>
                <Edit3 className="w-4 h-4 text-lime fill-lime/20" />
                此处可修改
              </div>

              {/* Status */}
              <div className="absolute bottom-8 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                 <div className="w-2 h-2 rounded-full bg-lime animate-pulse"></div>
                 <span className="text-white text-xs font-medium">用户 A 正在编辑...</span>
              </div>
            </div>
            
            {/* Orbiting avatars (simplified from previous) */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="orbit absolute"
                  style={{
                    width: `${100 + i * 40}%`,
                    height: `${100 + i * 40}%`,
                    left: '50%',
                    top: '50%',
                    marginLeft: `-${(100 + i * 40) / 2}%`,
                    marginTop: `-${(100 + i * 40) / 2}%`,
                    borderRadius: '50%',
                    border: '1px dashed rgba(163, 230, 53, 0.2)',
                  }}
                >
                  <div
                    className="absolute w-10 h-10 rounded-full bg-charcoal border border-lime/30 flex items-center justify-center shadow-lg"
                    style={{
                      top: '0',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Users className="w-4 h-4 text-lime/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="order-1 lg:order-2 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-lime/10 rounded-full px-4 py-2 w-fit">
              <MessageSquare className="w-4 h-4 text-lime" />
              <span className="text-sm font-medium text-charcoal">核心功能三</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-charcoal">
              交互式修改建议
              <span className="block text-gray-400 text-2xl lg:text-3xl mt-2 font-normal">
                Active Action
              </span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              AI 不仅指出问题，还实时生成"建议修订版"，支持一键应用到文档。
              在平台内直接分配任务、留下评论并追踪修订。法律工作流，优化提升。
            </p>

            <div className="flex flex-col gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
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
