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
import { NavLink } from 'react-router-dom';
import { HolographicCard } from '@/components/HolographicCard';
import { MagneticButton } from '@/components/MagneticButton';

const stats = [
  { 
    name: '合同总数', 
    value: '128', 
    change: '+12', 
    changeType: 'positive',
    icon: FileText,
    color: 'blue'
  },
  { 
    name: '待处理风险', 
    value: '23', 
    change: '-5', 
    changeType: 'positive',
    icon: AlertTriangle,
    color: 'orange'
  },
  { 
    name: '已审核合同', 
    value: '96', 
    change: '+8', 
    changeType: 'positive',
    icon: CheckCircle,
    color: 'green'
  },
  { 
    name: '平均处理时间', 
    value: '2.3h', 
    change: '-0.5h', 
    changeType: 'positive',
    icon: Clock,
    color: 'purple'
  },
];

const recentContracts = [
  { id: 1, name: '技术服务合同-2024-001', status: 'analyzed', risks: 3, date: '2024-01-15' },
  { id: 2, name: '采购协议-供应商A', status: 'pending', risks: 0, date: '2024-01-14' },
  { id: 3, name: '劳动合同-张三', status: 'completed', risks: 0, date: '2024-01-13' },
  { id: 4, name: '保密协议-合作方B', status: 'analyzed', risks: 1, date: '2024-01-12' },
];

const recentRisks = [
  { id: 1, title: '违约金比例过高', level: 'high', contract: '技术服务合同-2024-001' },
  { id: 2, title: '争议解决条款缺失', level: 'medium', contract: '保密协议-合作方B' },
  { id: 3, title: '知识产权归属不明', level: 'medium', contract: '技术服务合同-2024-001' },
];

export const Overview: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level]}`}>
        {labels[level]}
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
            今天有 3 份合同需要您的关注
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
          const Icon = stat.icon;
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

          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div 
                key={contract.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-lime" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{contract.name}</p>
                    <p className="text-sm text-gray-400">{contract.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {contract.risks > 0 && (
                    <span className="flex items-center gap-1 text-sm text-orange-500">
                      <AlertTriangle className="w-4 h-4" />
                      {contract.risks} 个风险
                    </span>
                  )}
                  {getStatusBadge(contract.status)}
                </div>
              </div>
            ))}
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
            {recentRisks.map((risk) => (
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
            ))}
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
