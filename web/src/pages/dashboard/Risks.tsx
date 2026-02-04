import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  ArrowRight,
  Shield,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HolographicCard } from '@/components/HolographicCard';
import { MagneticButton } from '@/components/MagneticButton';
import { RiskDetailModal } from '@/components/RiskDetailModal';

interface RiskStat {
  name: string;
  value: number;
  change: number;
  color: string;
}

interface Risk {
  id: string | number; // Backend might send string combined ID
  original_id?: number;
  contract_id?: number;
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

const categories = ['全部', '违约责任', '争议解决', '知识产权', '保密条款', '付款条款', '通知条款', '其他'];

export const Risks: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [risksList, setRisksList] = useState<Risk[]>([]);
  const [riskStats, setRiskStats] = useState<RiskStat[]>([
    { name: '待处理', value: 0, change: 0, color: 'red' },
    { name: '处理中', value: 0, change: 0, color: 'orange' },
    { name: '已解决', value: 0, change: 0, color: 'green' },
    { name: '本月新增', value: 0, change: 0, color: 'blue' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const token = localStorage.getItem('NexDoc_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/v1/risks/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
           navigate('/login');
           return;
        }
        throw new Error('Failed to fetch risks');
      }

      const data = await response.json();
      setRisksList(data.risks);
      setRiskStats(data.stats);
    } catch (error) {
      console.error('Error fetching risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRisks = risksList.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.contract.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || risk.category === selectedCategory;
    const matchesType = selectedType === 'all' || risk.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-600',
      medium: 'bg-orange-100 text-orange-600',
      low: 'bg-green-100 text-green-600',
    };
    const labels: Record<string, string> = {
      high: '高风险',
      medium: '中风险',
      low: '低风险',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-600',
      processing: 'bg-blue-100 text-blue-600',
      resolved: 'bg-green-100 text-green-600',
    };
    const labels: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">风险中心</h1>
          <p className="text-gray-500 mt-1">管理和处理合同中的风险条款</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">风险环比下降 15%</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {riskStats.map((stat, index) => (
          <HolographicCard key={index} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-charcoal mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                <AlertTriangle className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <span className={`text-sm ${stat.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change}
              </span>
              <span className="text-xs text-gray-400">较上周</span>
            </div>
          </HolographicCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索风险、合同..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {['all', 'high', 'medium', 'low'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                selectedType === type
                  ? "bg-lime text-charcoal"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              {type === 'all' && '全部风险'}
              {type === 'high' && '高风险'}
              {type === 'medium' && '中风险'}
              {type === 'low' && '低风险'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
              selectedCategory === category
                ? "bg-charcoal text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Risk List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">风险描述</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">所属合同</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">类别</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">等级</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">AI 置信度</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRisks.map((risk) => (
              <tr key={risk.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-charcoal">{risk.title}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{risk.contract}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {risk.category}
                  </span>
                </td>
                <td className="px-6 py-4">{getTypeBadge(risk.type)}</td>
                <td className="px-6 py-4">{getStatusBadge(risk.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-lime rounded-full"
                        style={{ width: `${risk.aiConfidence}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{risk.aiConfidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {risk.status === 'pending' && (
                      <MagneticButton 
                        variant="primary" 
                        className="py-1.5 px-3 text-xs"
                        onClick={() => {
                          setSelectedRisk(risk);
                          setIsDetailOpen(true);
                        }}
                      >
                        处理
                      </MagneticButton>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedRisk(risk);
                        setIsDetailOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRisks.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">暂无风险数据</p>
          </div>
        )}
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-lime/10 to-lime/5 rounded-2xl p-6 border border-lime/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-charcoal" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal mb-2">AI 风险洞察</h3>
            <p className="text-gray-600 text-sm">
              根据您的合同数据分析，建议重点关注技术服务类合同中的知识产权条款。
              本月此类风险占比 35%，建议制定统一的知识产权归属模板以降低风险。
            </p>
            <div className="flex items-center gap-4 mt-4">
              <button className="text-sm text-lime hover:underline flex items-center gap-1">
                查看详细报告
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="text-sm text-gray-400 hover:text-charcoal">
                忽略此建议
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Detail Modal */}
      <RiskDetailModal 
        risk={selectedRisk}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onProcess={async (riskId) => {
          // Parse composite ID: "contractId_riskId"
          if (typeof riskId === 'string' && riskId.includes('_')) {
             const [contractId, realRiskId] = riskId.split('_');
             try {
                const token = localStorage.getItem('NexDoc_token');
                await fetch(`/api/v1/risks/${contractId}/${realRiskId}/status`, {
                   method: 'PATCH',
                   headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                   },
                   body: JSON.stringify({ status: 'resolved' })
                });
             } catch (e) {
                console.error("Failed to update status", e);
             }
          }
          
          setRisksList(prev => prev.map(r => 
            r.id === riskId ? { ...r, status: 'resolved' } : r
          ));
        }}
      />
    </div>
  );
};
