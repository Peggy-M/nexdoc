import { useEffect, useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HolographicCard } from '@/components/HolographicCard';
import { MagneticButton } from '@/components/MagneticButton';

const iconMap: any = {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
};

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  
  // Dynamic Data States
  const [stats, setStats] = useState<any[]>([
      { name: '合同总数', value: '0', change: '0', changeType: 'positive', icon: 'FileText', color: 'blue' },
      { name: '待处理风险', value: '0', change: '0', changeType: 'positive', icon: 'AlertTriangle', color: 'orange' },
      { name: '已审核合同', value: '0', change: '0', changeType: 'positive', icon: 'CheckCircle', color: 'green' },
      { name: '平均处理时间', value: '0h', change: '0h', changeType: 'positive', icon: 'Clock', color: 'purple' },
  ]);
  const [recentContracts, setRecentContracts] = useState<any[]>([]);
  const [recentRisks, setRecentRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
    
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
      try {
          const token = localStorage.getItem('NexDoc_token');
          if (!token) {
              navigate('/login');
              return;
          }

          const response = await fetch('/api/v1/overview/', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.ok) {
              const data = await response.json();
              setStats(data.stats);
              setRecentContracts(data.recentContracts);
              setRecentRisks(data.recentRisks);
          }
      } catch (error) {
          console.error('Failed to fetch overview data:', error);
      } finally {
          setLoading(false);
      }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      analyzed: 'bg-orange-100 text-orange-600',
      pending: 'bg-gray-100 text-gray-600',
      completed: 'bg-green-100 text-green-600',
      uploading: 'bg-blue-100 text-blue-600',
      analyzing: 'bg-purple-100 text-purple-600',
    };
    const labels: Record<string, string> = {
      analyzed: '已分析',
      pending: '待分析',
      completed: '已完成',
      uploading: '上传中',
      analyzing: '分析中',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getRiskBadge = (level: string) => {
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level] || 'bg-gray-100'}`}>
        {labels[level] || level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">
            {greeting}，欢迎回到 NexDoc AI
          </h1>
          <p className="text-gray-500 mt-1">
            今天有 {recentContracts.length} 份合同需要您的关注
          </p>
        </div>
        <NavLink to="/dashboard/upload">
          <MagneticButton variant="primary" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            快速上传
          </MagneticButton>
        </NavLink>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon] || FileText;
          return (
            <HolographicCard key={index} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-charcoal mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-4 h-4 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-400">较上月</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
              </div>
            </HolographicCard>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-charcoal">最近合同</h2>
            <NavLink 
              to="/dashboard/contracts"
              className="text-sm text-lime hover:underline flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
          
          <div className="space-y-4">
            {recentContracts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无最近合同</p>
            ) : (
                recentContracts.map((contract) => (
                  <NavLink 
                    key={contract.id}
                    to={`/dashboard/contracts`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-lime" />
                      </div>
                      <div>
                        <h3 className="font-medium text-charcoal">{contract.name}</h3>
                        <p className="text-sm text-gray-400">{contract.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {contract.risks > 0 && (
                        <div className="flex items-center gap-1 text-orange-500 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{contract.risks} 个风险</span>
                        </div>
                      )}
                      {getStatusBadge(contract.status)}
                    </div>
                  </NavLink>
                ))
            )}
          </div>
        </div>

        {/* Recent Risks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-charcoal">待处理风险</h2>
            <NavLink 
              to="/dashboard/risks"
              className="text-sm text-lime hover:underline flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {recentRisks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无待处理风险</p>
            ) : (
                recentRisks.map((risk) => (
                  <div 
                    key={risk.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-charcoal text-sm">{risk.title}</p>
                      {getRiskBadge(risk.level)}
                    </div>
                    <p className="text-xs text-gray-400">{risk.contract}</p>
                  </div>
                ))
            )}
          </div>

          {/* AI Insight */}
          <div className="mt-6 p-4 bg-lime/5 border border-lime/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-lime" />
              <span className="text-sm font-medium text-charcoal">AI 洞察</span>
            </div>
            <p className="text-xs text-gray-500">
              本月您的合同风险识别率提升了 15%，建议关注技术服务类合同中的知识产权条款。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
