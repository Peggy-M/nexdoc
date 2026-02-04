import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { cn } from '@/lib/utils';

interface Risk {
  id: string | number;
  title: string;
  contract: string;
  type: 'high' | 'medium' | 'low';
  category: string;
  status: 'pending' | 'processing' | 'resolved';
  date: string;
  aiConfidence: number;
  description?: string;
  suggestion?: string;
  clause?: string;
}

interface RiskDetailModalProps {
  risk: Risk | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess?: (riskId: string | number) => void;
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ 
  risk, 
  isOpen, 
  onClose,
  onProcess 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  if (!isOpen || !risk) return null;

  const handleProcess = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsResolved(true);
    onProcess?.(risk.id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium text-white", getTypeColor(risk.type))}>
              {getTypeLabel(risk.type)}
            </span>
            <h2 className="text-xl font-bold text-charcoal">{risk.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contract Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <FileText className="w-5 h-5 text-lime" />
            <span className="text-gray-600">所属合同:</span>
            <span className="font-medium text-charcoal">{risk.contract}</span>
          </div>

          {/* Original Clause */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="text-sm font-medium text-gray-500 mb-3">原文条款</h4>
            <p className="text-charcoal bg-white p-4 rounded-lg border-l-4 border-gray-300">
              {risk.clause || '任何通知应以书面形式送达。'}
            </p>
          </div>

          {/* Issue Description */}
          <div className="bg-orange-50 rounded-xl p-5">
            <h4 className="text-sm font-medium text-orange-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              问题分析
            </h4>
            <p className="text-gray-700">
              {risk.description || '第 12 条约定的通知方式较为笼统，可能导致通知效力争议。'}
            </p>
          </div>

          {/* AI Suggestion */}
          <div className="bg-lime/5 rounded-xl p-5 border border-lime/20">
            <h4 className="text-sm font-medium text-charcoal mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-lime" />
              AI 修改建议
            </h4>
            <p className="text-gray-700 mb-4">
              {risk.suggestion || '建议明确电子邮件、快递等具体送达方式和生效时间。'}
            </p>
            <div className="bg-white p-4 rounded-lg border-l-4 border-lime">
              <p className="text-charcoal">
                任何通知应以书面形式通过快递或电子邮件送达，电子邮件发送后 24 小时视为送达。
              </p>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">AI 置信度</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-lime rounded-full"
                style={{ width: `${risk.aiConfidence}%` }}
              />
            </div>
            <span className="text-sm font-medium text-charcoal">{risk.aiConfidence}%</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isResolved ? (
              <div className="flex-1 flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">已处理完成</span>
              </div>
            ) : (
              <>
                <MagneticButton 
                  variant="primary" 
                  className="flex-1"
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      应用此修改
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </MagneticButton>
                <MagneticButton variant="outline">
                  忽略此问题
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
