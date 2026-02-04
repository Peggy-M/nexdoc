import React from 'react';
import { Shield, Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

const footerLinks = {
  product: {
    title: '产品',
    links: [
      { name: '功能介绍', href: '#features' },
      { name: '定价方案', href: '#pricing' },
      { name: 'API 文档', href: '#api' },
      { name: '更新日志', href: '#' },
    ],
  },
  company: {
    title: '公司',
    links: [
      { name: '关于我们', href: '#' },
      { name: '加入我们', href: '#' },
      { name: '新闻动态', href: '#' },
      { name: '合作伙伴', href: '#' },
    ],
  },
  resources: {
    title: '资源',
    links: [
      { name: '帮助中心', href: '#' },
      { name: '博客', href: '#' },
      { name: '案例研究', href: '#' },
      { name: '白皮书', href: '#' },
    ],
  },
  legal: {
    title: '法律',
    links: [
      { name: '隐私政策', href: '#' },
      { name: '服务条款', href: '#' },
      { name: '安全合规', href: '#' },
      { name: 'Cookie 政策', href: '#' },
    ],
  },
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center">
                <Shield className="w-6 h-6 text-charcoal" />
              </div>
              <span className="text-xl font-bold">NexDoc AI</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              基于 DeepSeek-R1 推理引擎的新一代智能合同防御系统，为您的法律工作流提供精准防护。
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@NexDoc.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>400-888-8888</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>北京市朝阳区</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-lime transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2024 NexDoc AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-lime transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-lime transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-lime transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
