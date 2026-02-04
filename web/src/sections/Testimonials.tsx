import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    content: 'NexDoc AI 将我们的合同审查时间从平均 3 天缩短到 2 小时。AI 识别的风险点非常精准，大大提高了我们的工作效率。',
    author: '张明',
    title: '高级合伙人',
    company: '金杜律师事务所',
    rating: 5,
  },
  {
    content: '作为一家快速发展的科技公司，我们需要处理大量合作协议。NexDoc 的自动化审查让我们能够专注于核心业务。',
    author: '李华',
    title: '法务总监',
    company: '某独角兽科技公司',
    rating: 5,
  },
  {
    content: '数字化档案库功能非常实用，我们可以轻松追溯历史合同和审查记录。团队协作功能也让跨部门沟通更加顺畅。',
    author: '王芳',
    title: '合规经理',
    company: '某大型制造企业',
    rating: 5,
  },
];

const stats = [
  { value: '10,000+', label: '法律团队' },
  { value: '500万+', label: '合同分析' },
  { value: '99.8%', label: '识别准确率' },
  { value: '2小时', label: '平均审查时间' },
];

export const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 50, opacity: 0 },
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

      gsap.fromTo(
        statsRef.current?.children || [],
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
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
        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-lime mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
            客户评价
          </h2>
          <p className="text-lg text-gray-500">
            听听使用 NexDoc AI 的法律团队怎么说
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-lime/20" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-lime text-lime" />
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-lime">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-charcoal">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.title} · {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
