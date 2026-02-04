import { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Calendar, 
  FileText,
  Download,
  Trash2,
  Folder,
  Tag,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HolographicCard } from '@/components/HolographicCard';

const archiveStats = [
  { name: '总存储量', value: '128.5 GB', icon: Database },
  { name: '合同数量', value: '1,256', icon: FileText },
  { name: '本月新增', value: '86', icon: Calendar },
  { name: '平均保存', value: '2.3 年', icon: Clock },
];

const folders = [
  { id: 1, name: '技术服务合同', count: 45, size: '23.5 MB' },
  { id: 2, name: '采购协议', count: 32, size: '18.2 MB' },
  { id: 3, name: '劳动合同', count: 128, size: '45.6 MB' },
  { id: 4, name: '保密协议', count: 56, size: '12.3 MB' },
  { id: 5, name: '租赁合同', count: 18, size: '8.9 MB' },
];

const archivedContracts = [
  { id: 1, name: '技术服务合同-2023-089', folder: '技术服务合同', date: '2023-12-15', size: '2.3 MB', tags: ['已完成', '年度'] },
  { id: 2, name: '采购协议-供应商B-2023', folder: '采购协议', date: '2023-11-20', size: '1.8 MB', tags: ['已完成'] },
  { id: 3, name: '劳动合同-批量-2023-Q4', folder: '劳动合同', date: '2023-10-01', size: '15.6 MB', tags: ['批量', 'Q4'] },
  { id: 4, name: '保密协议-合作方C', folder: '保密协议', date: '2023-09-15', size: '1.2 MB', tags: ['已到期'] },
  { id: 5, name: '办公室租赁合同-2023', folder: '租赁合同', date: '2023-08-01', size: '3.5 MB', tags: ['长期'] },
];

const tags = ['全部', '已完成', '年度', '批量', 'Q4', '已到期', '长期'];

export const Archive: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [contracts, setContracts] = useState(archivedContracts);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleDownload = (contractName: string) => {
    alert(`下载合同: ${contractName}`);
  };

  const handleDelete = (id: number) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '全部' || contract.tags.includes(selectedTag);
    const matchesFolder = selectedFolder === null || contract.folder === folders.find(f => f.id === selectedFolder)?.name;
    return matchesSearch && matchesTag && matchesFolder;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">档案库</h1>
          <p className="text-gray-500 mt-1">管理和检索历史合同档案</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {archiveStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <HolographicCard key={index} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-lime" />
                </div>
              </div>
            </HolographicCard>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-lime" />
              文件夹
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                  selectedFolder === null ? "bg-lime/10 text-charcoal" : "hover:bg-gray-50 text-gray-600"
                )}
              >
                <span>全部文件</span>
                <span className="text-sm text-gray-400">{folders.reduce((acc, f) => acc + f.count, 0)}</span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                    selectedFolder === folder.id ? "bg-lime/10 text-charcoal" : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  <span>{folder.name}</span>
                  <span className="text-sm text-gray-400">{folder.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-lime" />
              标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-colors",
                    selectedTag === tag
                      ? "bg-charcoal text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索档案..."
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

          {/* Archive List */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">文件名</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">文件夹</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">日期</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">大小</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">标签</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-lime" />
                        </div>
                        <span className="font-medium text-charcoal">{contract.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{contract.folder}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{contract.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{contract.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {contract.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(contract.name)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="下载"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(contract.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
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
                  <Database className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500">暂无档案</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6">
            <h3 className="text-lg font-bold text-charcoal mb-2">确认删除</h3>
            <p className="text-gray-500 mb-6">
              确定要删除这份合同吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
