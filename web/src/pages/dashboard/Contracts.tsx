import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContractDetailModal } from '@/components/ContractDetailModal';

const contracts = [
  { 
    id: 1, 
    name: '技术服务合同-2024-001', 
    type: '技术服务',
    status: 'analyzed', 
    risks: { high: 1, medium: 2, low: 0 },
    date: '2024-01-15',
    size: '2.3 MB'
  },
  { 
    id: 2, 
    name: '采购协议-供应商A', 
    type: '采购',
    status: 'pending', 
    risks: { high: 0, medium: 0, low: 0 },
    date: '2024-01-14',
    size: '1.8 MB'
  },
  { 
    id: 3, 
    name: '劳动合同-张三', 
    type: '人力资源',
    status: 'completed', 
    risks: { high: 0, medium: 0, low: 0 },
    date: '2024-01-13',
    size: '856 KB'
  },
  { 
    id: 4, 
    name: '保密协议-合作方B', 
    type: '保密',
    status: 'analyzed', 
    risks: { high: 0, medium: 1, low: 2 },
    date: '2024-01-12',
    size: '1.2 MB'
  },
  { 
    id: 5, 
    name: '房屋租赁合同-办公室', 
    type: '租赁',
    status: 'completed', 
    risks: { high: 0, medium: 0, low: 0 },
    date: '2024-01-10',
    size: '3.1 MB'
  },
  { 
    id: 6, 
    name: '软件许可协议-厂商C', 
    type: '许可',
    status: 'analyzed', 
    risks: { high: 2, medium: 3, low: 1 },
    date: '2024-01-08',
    size: '4.5 MB'
  },
];

const filters = [
  { name: '全部', value: 'all' },
  { name: '待分析', value: 'pending' },
  { name: '已分析', value: 'analyzed' },
  { name: '已完成', value: 'completed' },
];

export const Contracts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);
  const [selectedContract, setSelectedContract] = useState<typeof contracts[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || contract.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleSelection = (id: number) => {
    setSelectedContracts(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

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

  const getRiskSummary = (risks: { high: number; medium: number; low: number }) => {
    const total = risks.high + risks.medium + risks.low;
    if (total === 0) return <span className="text-green-500 text-sm">无风险</span>;
    return (
      <div className="flex items-center gap-2">
        {risks.high > 0 && (
          <span className="flex items-center gap-1 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {risks.high}
          </span>
        )}
        {risks.medium > 0 && (
          <span className="flex items-center gap-1 text-orange-500 text-sm">
            <Clock className="w-4 h-4" />
            {risks.medium}
          </span>
        )}
        {risks.low > 0 && (
          <span className="flex items-center gap-1 text-green-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            {risks.low}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">合同管理</h1>
        <div className="flex items-center gap-3">
          {selectedContracts.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />
              删除选中 ({selectedContracts.length})
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索合同名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-400" />
          筛选
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              activeFilter === filter.value
                ? "bg-lime text-charcoal"
                : "bg-white text-gray-600 hover:bg-gray-100"
            )}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedContracts(filteredContracts.map(c => c.id));
                    } else {
                      setSelectedContracts([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">合同名称</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">类型</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">风险</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">日期</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">大小</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((contract) => (
              <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox"
                    checked={selectedContracts.includes(contract.id)}
                    onChange={() => toggleSelection(contract.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-lime" />
                    </div>
                    <span className="font-medium text-charcoal">{contract.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{contract.type}</td>
                <td className="px-6 py-4">{getStatusBadge(contract.status)}</td>
                <td className="px-6 py-4">{getRiskSummary(contract.risks)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{contract.date}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{contract.size}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setSelectedContract(contract);
                        setIsDetailOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => alert('下载功能演示')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContracts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">暂无合同</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          显示 {filteredContracts.length} 条，共 {contracts.length} 条
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
            上一页
          </button>
          <button className="px-4 py-2 bg-lime text-charcoal rounded-xl text-sm font-medium">
            1
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            下一页
          </button>
        </div>
      </div>

      {/* Contract Detail Modal */}
      <ContractDetailModal 
        contract={selectedContract}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
