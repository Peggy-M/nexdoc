import { X, FileText, Download, Calendar, AlertTriangle, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { useNavigate } from 'react-router-dom';

interface Contract {
  id: number;
  name: string;
  type: string;
  status: string;
  risks: { high: number; medium: number; low: number };
  date: string;
  size: string;
  uploader?: string;
  // Analysis details
  analysis_results?: Array<{
    id: number;
    title: string;
    type: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
    clause: string;
  }>;
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
  const navigate = useNavigate();
  if (!isOpen || !contract) return null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      analyzed: 'bg-orange-100 text-orange-600',
      pending: 'bg-gray-100 text-gray-600',
      completed: 'bg-green-100 text-green-600',
      uploading: 'bg-blue-100 text-blue-600',
      analyzing: 'bg-blue-100 text-blue-600',
      failed: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      analyzed: '已分析',
      pending: '待分析',
      completed: '已完成',
      uploading: '上传中',
      analyzing: '分析中',
      failed: '失败',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'text-red-500 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'low': return 'text-green-500 bg-green-50 border-green-100';
      default: return 'text-gray-500 bg-gray-50 border-gray-100';
    }
  };

  const totalRisks = contract.risks ? (contract.risks.high + contract.risks.medium + contract.risks.low) : 0;

  const handleDownload = async () => {
    if (!contract) return;
    try {
        const token = localStorage.getItem('NexDoc_token');
        if (!token) return;

        // Default to original file
        let url = `/api/v1/contracts/${contract.id}/download`;
        let filename = contract.name;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('Download error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-charcoal">合同详情</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                  <div className="text-2xl font-bold text-red-500">{contract.risks.high}</div>
                  <div className="text-xs text-red-400 font-medium">高风险</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                  <div className="text-2xl font-bold text-orange-500">{contract.risks.medium}</div>
                  <div className="text-xs text-orange-400 font-medium">中风险</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-500">{contract.risks.low}</div>
                  <div className="text-xs text-green-400 font-medium">低风险</div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Details List (Preview) */}
          {contract.analysis_results && contract.analysis_results.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-charcoal">风险详情</h4>
              <div className="space-y-3">
                {contract.analysis_results.map((risk, index) => (
                  <div key={index} className={`p-4 rounded-xl border-l-4 ${getRiskColor(risk.type).replace('text-', 'border-').split(' ')[0]} bg-white border border-gray-100 shadow-sm`}>
                    <div className="flex items-start gap-3">
                      {risk.type === 'high' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : risk.type === 'medium' ? (
                        <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h5 className={`font-bold text-sm mb-1 ${
                          risk.type === 'high' ? 'text-red-600' : 
                          risk.type === 'medium' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {risk.title} 
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">{risk.description}</p>
                        {risk.clause && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic border border-gray-100">
                            "{risk.clause}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 flex-shrink-0">
          <MagneticButton 
            variant="primary" 
            size="lg" 
            className="flex-1 justify-center"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            下载合同
          </MagneticButton>
          
          {['analyzed', 'completed'].includes(contract.status) && (
            <MagneticButton 
              variant="outline" 
              size="lg" 
              className="flex-1 justify-center bg-white hover:bg-lime hover:text-charcoal hover:border-lime group"
              onClick={() => navigate(`/dashboard/upload?id=${contract.id}&name=${encodeURIComponent(contract.name)}`)}
            >
              查看完整报告
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          )}
        </div>
      </div>
    </div>
  );
};
