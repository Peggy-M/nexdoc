import { useState } from 'react';
import { X, Check, Loader2, Shield, Mail, Building, User } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { cn } from '@/lib/utils';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('success');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden",
        "transform transition-all duration-300 scale-100"
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {step === 'form' && (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-lime/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-lime" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-2">
                开始 14 天免费试用
              </h2>
              <p className="text-gray-500 text-sm">
                无需信用卡，全功能体验，随时取消
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  姓名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="请输入您的姓名"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  工作邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  公司名称
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="请输入公司名称"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  联系电话
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="请输入联系电话"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <MagneticButton variant="primary" className="w-full justify-center py-4">
                  立即开始免费试用
                </MagneticButton>
              </div>

              <p className="text-xs text-gray-400 text-center">
                点击提交即表示您同意我们的
                <a href="#" className="text-lime hover:underline">服务条款</a>
                和
                <a href="#" className="text-lime hover:underline">隐私政策</a>
              </p>
            </form>
          </div>
        )}

        {step === 'submitting' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-lime animate-spin mb-4" />
            <p className="text-gray-600">正在创建您的账户...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-lime flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-charcoal" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              注册成功！
            </h2>
            <p className="text-gray-500 mb-2">
              您的账户已创建成功。
            </p>
            <p className="text-gray-400 text-sm mb-6">
              注册邮箱：{formData.email}
            </p>
            <MagneticButton 
              variant="primary" 
              onClick={() => {
                onClose();
                onSuccess?.();
              }}
              className="px-8"
            >
              立即登录
            </MagneticButton>
          </div>
        )}
      </div>
    </div>
  );
};
