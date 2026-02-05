import { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Contract {
  id: number;
  name: string;
  type: string;
  status: string;
  risks: {
    high: number;
    medium: number;
    low: number;
  };
  date: string;
  size: string;
}

const filters = [
  { name: '全部', value: 'all' },
  { name: '待分析', value: 'pending' },
  { name: '已分析', value: 'analyzed' },
  { name: '已完成', value: 'completed' },
];

export const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractsToDelete, setContractsToDelete] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('NexDoc_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/v1/contracts/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const formattedContracts = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.contract_type || '未知类型',
          status: item.status,
          risks: item.risk_summary || { high: 0, medium: 0, low: 0 },
          date: new Date(item.upload_date + 'Z').toLocaleString('zh-CN', { hour12: false }),
          size: item.file_size
        }));
        setContracts(formattedContracts);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = activeFilter === 'all' || contract.status === activeFilter;
    
    // Map backend statuses to filter categories if needed
    if (activeFilter === 'pending' && (contract.status === 'uploading' || contract.status === 'analyzing')) {
      matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const toggleSelection = (id: number) => {
    setSelectedContracts(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (status: string, contract: Contract) => {
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
    
    const badge = (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );

    if (status === 'pending') {
      return (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/upload?id=${contract.id}&name=${encodeURIComponent(contract.name)}`);
          }}
          className="group relative cursor-pointer"
          title="点击开始分析"
        >
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-lime group-hover:text-charcoal transition-colors duration-200">
            {labels[status]}
          </span>
        </button>
      );
    }

    return badge;
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

  const handleDelete = (ids: number[]) => {
    setContractsToDelete(ids);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('NexDoc_token');
      if (!token) {
        navigate('/login');
        return;
      }

      for (const id of contractsToDelete) {
        await fetch(`/api/v1/contracts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Refresh list
      fetchContracts();
      setSelectedContracts([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete contracts:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleDownload = async (contract: Contract) => {
    try {
      const token = localStorage.getItem('NexDoc_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // 如果已分析完成，下载 PDF 报告，否则下载原始文件
      // 或者这里默认下载原始文件？
      // 用户需求倾向于“下载功能”是真实的。
      // 通常下载图标是下载原始文件，而“导出”是下载报告。
      // 但为了方便，我们可以先尝试下载报告，如果状态不是 analyzed，则下载原始文件。
      // 实际上，为了明确，我们让这个按钮下载生成的报告（因为这是 LexGuard 的核心价值），
      // 但如果用户想要原始文件怎么办？
      // 让我们简单点：默认下载生成的 PDF 报告（如果可用），否则下载原始文件。
      // 或者给用户一个选择？
      // 既然用户之前强调“导出审查报告”，那我们优先下载报告。
      
      let url = `/api/v1/contracts/${contract.id}/download`; // Default to original
      let filename = contract.name;

      if (contract.status === 'analyzed' || contract.status === 'completed') {
         // Prefer report if available
         url = `/api/v1/contracts/${contract.id}/export/pdf`;
         filename = `审查报告_${contract.name}.pdf`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      alert('下载失败，请稍后重试');
    }
  };

  const fetchContractDetails = async (id: number) => {
    try {
      const token = localStorage.getItem('NexDoc_token');
      const response = await fetch(`/api/v1/contracts/${id}/analysis`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure we always return an array, even if results are null/undefined
        return Array.isArray(data.results) ? data.results : [];
      }
    } catch (error) {
      console.error('Failed to fetch analysis details:', error);
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">合同管理</h1>
        <div className="flex items-center gap-3">
          {selectedContracts.length > 0 && (
            <button 
              onClick={() => handleDelete(selectedContracts)}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除选中 ({selectedContracts.length})
            </button>
          )}
          {/* 
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
          */}
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
                <td className="px-6 py-4">{ getStatusBadge(contract.status, contract) }</td>
                <td className="px-6 py-4">{getRiskSummary(contract.risks)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{contract.date}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{contract.size}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation(); // Stop row click
                        const details = await fetchContractDetails(contract.id);
                        setSelectedContract({
                            ...contract,
                            analysis_results: details
                        });
                        setIsDetailOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDownload(contract)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={contract.status === 'analyzed' ? "下载审查报告" : "下载原始文件"}
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDelete([contract.id])}
                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
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

      <ContractDetailModal 
        contract={selectedContract}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除选中的 {contractsToDelete.length} 个合同吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
