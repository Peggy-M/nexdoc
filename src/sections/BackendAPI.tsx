import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HolographicCard } from '@/components/HolographicCard';
import { 
  Code, 
  Webhook, 
  Shield, 
  Database, 
  FileJson, 
  Lock,
  Zap,
  RefreshCw
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const apis = [
  {
    name: 'POST /api/v1/contracts/upload',
    description: '上传合同文档进行解析',
    method: 'POST',
    icon: FileJson,
  },
  {
    name: 'GET /api/v1/contracts/{id}/analysis',
    description: '获取合同分析结果',
    method: 'GET',
    icon: Database,
  },
  {
    name: 'POST /api/v1/contracts/{id}/review',
    description: '提交审查意见',
    method: 'POST',
    icon: Shield,
  },
  {
    name: 'GET /api/v1/risk-library',
    description: '获取风险条款库',
    method: 'GET',
    icon: Lock,
  },
  {
    name: 'POST /api/v1/webhooks/configure',
    description: '配置事件回调',
    method: 'POST',
    icon: Webhook,
  },
  {
    name: 'GET /api/v1/compliance/check',
    description: '合规性实时检查',
    method: 'GET',
    icon: RefreshCw,
  },
];

const integrations = [
  { name: '钉钉', status: '已支持' },
  { name: '飞书', status: '已支持' },
  { name: '企业微信', status: '已支持' },
  { name: 'SAP', status: '已支持' },
  { name: 'Oracle', status: '已支持' },
  { name: '用友', status: '已支持' },
];

export const BackendAPI: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const apisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        apisRef.current?.children || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: apisRef.current,
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
      className="relative py-24 lg:py-32 bg-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div ref={contentRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-lime/10 rounded-full px-4 py-2 mb-6">
            <Code className="w-4 h-4 text-lime" />
            <span className="text-sm font-medium text-charcoal">开发者友好</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
            预留后端接口设计
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            系统架构采用微服务架构，预留以下核心接口，确保未来可无缝集成到钉钉、飞书或企业 ERP 中
          </p>
        </div>

        {/* API Cards */}
        <div ref={apisRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {apis.map((api, index) => {
            const Icon = api.icon;
            return (
              <HolographicCard
                key={index}
                className="p-5 bg-white"
                glowColor="rgba(210, 249, 0, 0.15)"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-lime" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        api.method === 'GET' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {api.method}
                      </span>
                    </div>
                    <code className="text-sm font-mono text-charcoal block truncate">
                      {api.name}
                    </code>
                    <p className="text-xs text-gray-500 mt-1">{api.description}</p>
                  </div>
                </div>
              </HolographicCard>
            );
          })}
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-lime" />
            <h3 className="text-lg font-semibold text-charcoal">已支持集成</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full"
              >
                <div className="w-2 h-2 bg-lime rounded-full" />
                <span className="text-sm font-medium text-charcoal">
                  {integration.name}
                </span>
                <span className="text-xs text-gray-400">{integration.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
