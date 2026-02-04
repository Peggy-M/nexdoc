import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Plus,
  Clock,
  Eye,
  Tag,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  author_name: string;
  created_at: string;
  views: number;
}

const categories = ['全部', '合同法', '公司法', '劳动法', '知识产权', '合规指南'];

export const Knowledge: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New article form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('合同法');

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('NexDoc_token');
      if (!token) {
        navigate('/login');
        return;
      }

      let url = '/api/v1/knowledge/?limit=100';
      if (selectedCategory !== '全部') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('NexDoc_token');
      const response = await fetch('/api/v1/knowledge/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory
        })
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewContent('');
        fetchArticles(); // Refresh
      }
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">知识库</h1>
          <p className="text-gray-500 mt-1">法律法规、合规指南与内部知识沉淀</p>
        </div>
        <MagneticButton 
          variant="primary" 
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          新建文章
        </MagneticButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文章标题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
            className="flex-1 bg-transparent focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === category
                  ? "bg-lime text-charcoal"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">暂无文章</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div 
              key={article.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="px-3 py-1 rounded-full bg-lime/10 text-lime-700 text-xs font-medium">
                  {article.category}
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-charcoal mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                {article.content}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3 h-3" />
                  <span>{article.author_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-charcoal mb-6">新建文章</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
                  placeholder="请输入文章标题"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
                >
                  {categories.filter(c => c !== '全部').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime h-48 resize-none"
                  placeholder="请输入文章内容..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <MagneticButton
                variant="primary"
                onClick={handleCreate}
                disabled={!newTitle || !newContent}
              >
                发布
              </MagneticButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
