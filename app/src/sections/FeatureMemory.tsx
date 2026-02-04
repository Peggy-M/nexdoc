import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, Search, Filter, Clock, Archive, BarChart3 } from 'lucide-react';
import { HolographicCard } from '@/components/HolographicCard';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: '已分析合同', value: '500万+', icon: BarChart3 },
  { label: '存储记录', value: '无限', icon: Archive },
  { label: '检索速度', value: '<1s', icon: Search },
];

const dimensions = [
  { label: '时间维度', description: '按审查时间线追溯' },
  { label: '合同类型', description: '按业务场景分类' },
  { label: '风险等级', description: '按严重程度筛选' },
];

export const FeatureMemory: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 50, opacity: 0, rotateY: -15 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-charcoal overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div ref={contentRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-lime/10 rounded-full px-4 py-2 mb-6">
            <Database className="w-4 h-4 text-lime" />
            <span className="text-sm font-medium text-lime">核心功能四</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            数字化档案库
            <span className="block text-gray-500 text-2xl lg:text-3xl mt-2 font-normal">
              Memory Bank
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            全量保存历史审查记录，支持按时间、合同类型、风险等级进行多维追溯。<br className="hidden md:block" />您的法律数据资产，永久安全存储。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center mx-auto mb-3 border border-lime/20 group-hover:bg-lime/20 transition-colors">
                  <Icon className="w-6 h-6 text-lime" />
                </div>
                <div className="text-3xl lg:text-5xl font-bold text-lime mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-medium tracking-wide">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Dimension cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6">
          {dimensions.map((dim, index) => {
            const icons = [Clock, Filter, BarChart3];
            const Icon = icons[index];
            return (
              <HolographicCard
                key={index}
                className="p-8 bg-charcoal/50 border border-lime/30 shadow-[0_0_30px_rgba(163,230,53,0.1)] hover:shadow-[0_0_50px_rgba(163,230,53,0.2)] transition-all duration-500 group"
                glowColor="rgba(163, 230, 53, 0.15)"
              >
                <div className="w-12 h-12 rounded-full bg-lime/10 flex items-center justify-center mb-6 border border-lime/20 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-lime" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {dim.label}
                </h3>
                <p className="text-sm text-gray-400 font-medium">{dim.description}</p>
              </HolographicCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
