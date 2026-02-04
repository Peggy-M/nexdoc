import React from 'react';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { Building2, Scale, Briefcase, Landmark, Gavel, FileCheck } from 'lucide-react';

const logos = [
  { name: '金杜律师事务所', icon: Scale },
  { name: '方达律师事务所', icon: Gavel },
  { name: '中伦律师事务所', icon: Briefcase },
  { name: '君合律师事务所', icon: Landmark },
  { name: '竞天公诚', icon: Building2 },
  { name: '通商律师事务所', icon: FileCheck },
];

export const LogoStream: React.FC = () => {
  return (
    <section className="relative py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-6 lg:px-12 mb-8">
        <p className="text-center text-sm text-gray-500 uppercase tracking-wider">
          受到顶级法律团队的信赖
        </p>
      </div>
      
      <InfiniteScroll speed={40} pauseOnHover>
        {logos.map((logo, index) => {
          const Icon = logo.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-full hover:bg-lime/10 transition-colors duration-300 group"
            >
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-lime transition-colors" />
              <span className="text-lg font-medium text-gray-600 group-hover:text-charcoal transition-colors whitespace-nowrap">
                {logo.name}
              </span>
            </div>
          );
        })}
      </InfiniteScroll>
    </section>
  );
};
