import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HolographicCard } from '@/components/HolographicCard';
import { MagneticButton } from '@/components/MagneticButton';
import { Check, Sparkles, Building2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

gsap.registerPlugin(ScrollTrigger);

interface PricingProps {
  onOpenTrial: () => void;
}

const plans = [
  {
    name: '基础版',
    description: '适合个人律师和小型团队',
    monthlyPrice: 29,
    yearlyPrice: 30,
    features: [
      '每月 50 份合同分析',
      '基础风险识别',
      'PDF/Word 支持',
      '7 天数据保留',
      '邮件支持',
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    name: '商业版',
    description: '适合中型法律团队',
    monthlyPrice: 999,
    yearlyPrice: 100,
    features: [
      '无限合同分析',
      '高级风险识别',
      '所有文件格式支持',
      '无限数据保留',
      '团队协作功能',
      'API 访问',
      '优先支持',
    ],
    icon: Building2,
    popular: true,
  },
  {
    name: '企业版',
    description: '适合大型企业和律所',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      '商业版全部功能',
      '定制化 AI 模型',
      '私有化部署选项',
      'SSO 单点登录',
      '专属客户经理',
      'SLA 保障',
      '定制集成开发',
    ],
    icon: Building2,
    popular: false,
  },
];

export const Pricing: React.FC<PricingProps> = ({ onOpenTrial }) => {
  const [isYearly, setIsYearly] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
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
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
            定价方案
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            选择适合您团队的方案，随时升级或降级
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isYearly ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
              月付
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-lime"
            />
            <span className={`text-sm ${isYearly ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
              年付
            </span>
            {isYearly && (
              <span className="text-xs bg-lime/20 text-lime px-2 py-1 rounded-full">
                节省 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <HolographicCard
                key={index}
                className={`relative p-8 ${
                  plan.popular
                    ? 'border-2 border-lime shadow-glow'
                    : 'border border-gray-100'
                }`}
                glowColor={plan.popular ? 'rgba(210, 249, 0, 0.3)' : 'rgba(0,0,0,0.05)'}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-lime text-charcoal text-xs font-medium px-4 py-1 rounded-full">
                      最受欢迎
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-lime' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-charcoal' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal">{plan.name}</h3>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-charcoal">
                        ¥{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-400">/月</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-charcoal">联系销售</div>
                  )}
                  {isYearly && plan.monthlyPrice && (
                    <div className="text-sm text-gray-400 mt-1">
                      按年付费，每年 ¥{plan.yearlyPrice! * 12}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <MagneticButton
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full justify-center"
                  onClick={plan.monthlyPrice ? onOpenTrial : undefined}
                >
                  {plan.monthlyPrice ? '开始免费试用' : '联系销售'}
                </MagneticButton>
              </HolographicCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
