import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, Scan, Users, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: '上传',
    description: '拖放您的合同文档，支持 PDF、Word、图片等多种格式',
    icon: Upload,
  },
  {
    number: '02',
    title: '分析',
    description: 'AI 扫描漏洞和合规问题，生成风险报告',
    icon: Scan,
  },
  {
    number: '03',
    title: '协作',
    description: '与您的团队一起修订，应用 AI 建议',
    icon: Users,
  },
  {
    number: '04',
    title: '定稿',
    description: '安全签署并存储，建立数字化档案',
    icon: CheckCircle,
  },
];

export const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // SVG path draw animation
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: 1,
          },
        });
      }

      // Steps animation
      const stepCards = stepsRef.current?.querySelectorAll('.step-card');
      stepCards?.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.3, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: card,
              start: 'top 60%',
              end: 'top 40%',
              scrub: true,
            },
          }
        );
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
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
            工作原理
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            简单四步，让合同审查从数天缩短至数分钟
          </p>
        </div>

        {/* Circuit line SVG */}
        <div className="relative">
          <svg
            className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 hidden lg:block"
            viewBox="0 0 4 800"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d="M2 0 L2 800"
              stroke="#d2f900"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Steps */}
          <div ref={stepsRef} className="relative space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`step-card relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div
                    className={`${
                      isEven ? 'lg:text-right' : 'lg:order-2 lg:text-left'
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-4 mb-6 ${
                        isEven ? 'lg:flex-row-reverse' : ''
                      }`}
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-lime blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative w-14 h-14 rounded-2xl bg-charcoal flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-lime" />
                        </div>
                      </div>
                      <span className="text-6xl font-black text-gray-100 select-none tracking-tighter">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-charcoal mb-4 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto lg:mx-0">
                      {step.description}
                    </p>
                  </div>

                  <div
                    className={`flex ${
                      isEven ? 'lg:justify-start' : 'lg:order-1 lg:justify-end'
                    }`}
                  >
                    <div className="relative w-full max-w-md group cursor-pointer">
                      <div className="absolute -inset-1 bg-gradient-to-r from-lime to-emerald-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative aspect-[4/3] rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-500">
                        {/* Decorative background grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        
                        <div className="relative z-10 w-24 h-24 rounded-full bg-lime/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Icon className="w-12 h-12 text-lime" />
                        </div>
                        
                        {/* Corner accents */}
                        <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-200"></div>
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-200"></div>
                        <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gray-200"></div>
                        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gray-200"></div>
                      </div>
                      
                      {/* Connection node */}
                      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-charcoal rounded-full border-4 border-lime shadow-xl z-20"
                        style={{
                          [isEven ? 'left' : 'right']: '-3rem',
                        }}
                      >
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-lime rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
