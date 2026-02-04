import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: 'LexGuard AI 支持哪些文件格式？',
    answer: 'LexGuard AI 支持 PDF、Word（.doc/.docx）、图片格式（JPG、PNG、TIFF）以及纯文本文件。我们的视觉 AI 技术可以保持文档的原版排版结构，确保"所见即所审"。',
  },
  {
    question: '合同数据的安全性如何保障？',
    answer: '我们采用银行级加密技术，所有数据传输使用 TLS 1.3 加密，存储采用 AES-256 加密。我们已通过 ISO 27001 和 SOC 2 Type II 认证，并支持私有化部署选项。',
  },
  {
    question: 'AI 识别的准确率有多高？',
    answer: '基于 DeepSeek-R1 推理引擎，LexGuard AI 的风险识别准确率达到 99.8%。我们的模型已在超过 500 万份合同上进行训练，并持续学习更新。',
  },
  {
    question: '是否可以与现有系统集成？',
    answer: '是的，LexGuard 提供完整的 RESTful API 和 Webhook 支持，可无缝集成到钉钉、飞书、企业微信以及 SAP、Oracle 等 ERP 系统中。',
  },
  {
    question: '免费试用期多长？',
    answer: '我们提供 14 天全功能免费试用，无需信用卡。试用期间您可以体验所有商业版功能，包括无限合同分析和团队协作。',
  },
];

export const FAQ: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        accordionRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
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
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
            常见问题
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            关于 LexGuard AI 的常见疑问解答
          </p>
        </div>

        <div ref={accordionRef} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border-none shadow-sm px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-charcoal hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
