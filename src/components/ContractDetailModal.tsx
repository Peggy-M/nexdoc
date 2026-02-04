import { X, FileText, Download, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

interface Contract {
  id: number;
  name: string;
  type: string;
  status: string;
  risks: { high: number; medium: number; low: number };
  date: string;
  size: string;
  uploader?: string;
}

interface ContractDetailModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ 
  contract, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen || !contract) return null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      analyzed: 'bg-orange-100 text-orange-600',
      pending: 'bg-gray-100 text-gray-600',
      completed: 'bg-green-100 text-green-600',
    };
    const labels: Record<string, string> = {
      analyzed: '已分析',
      pending: '待分析',
      completed: '已完成',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const totalRisks = contract.risks.high + contract.risks.medium + contract.risks.low;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-charcoal">合同详情</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contract Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-lime" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-charcoal">{contract.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {contract.date}
                </span>
                <span>{contract.size}</span>
                <span>类型: {contract.type}</span>
              </div>
            </div>
            {getStatusBadge(contract.status)}
          </div>

          {/* Risk Summary */}
          {totalRisks > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-charcoal mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                风险识别结果
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {contract.risks.high > 0 && (
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-500">{contract.risks.high}</div>
                    <div className="text-xs text-red-400">高风险</div>
                  </div>
                )}
                {contract.risks.medium > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-500">{contract.risks.medium}</div>
                    <div className="text-xs text-orange-400">中风险</div>
                  </div>
                )}
                {contract.risks.low > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-500">{contract.risks.low}</div>
                    <div className="text-xs text-green-400">低风险</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mock Risk List */}
          {totalRisks > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-charcoal">风险详情</h4>
              {contract.risks.high > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700">违约金比例过高</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">第 8.2 条款约定的违约金比例为合同金额的 30%，超过法定合理范围。</p>
                </div>
              )}
              {contract.risks.medium > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-orange-700">争议解决条款缺失</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">合同未明确约定争议解决方式和管辖法院。</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <MagneticButton variant="primary" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              下载合同
            </MagneticButton>
            {contract.status === 'pending' && (
              <MagneticButton variant="outline" className="flex-1">
                开始分析
              </MagneticButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
