import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Upload, 
  AlertTriangle, 
  Users, 
  Database,
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { name: '概览', path: '/dashboard', icon: Shield },
  { name: '合同管理', path: '/dashboard/contracts', icon: FileText },
  { name: '上传合同', path: '/dashboard/upload', icon: Upload },
  { name: '风险中心', path: '/dashboard/risks', icon: AlertTriangle },
  { name: '团队协作', path: '/dashboard/team', icon: Users },
  { name: '档案库', path: '/dashboard/archive', icon: Database },
  { name: '设置', path: '/dashboard/settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('NexDoc_user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('NexDoc_user');
    localStorage.removeItem('NexDoc_token');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-charcoal transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-0 lg:w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <Link to="/" className="h-16 flex items-center px-6 border-b border-white/10 hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-charcoal" />
            </div>
            {isSidebarOpen && (
              <span className="ml-3 text-lg font-bold text-white whitespace-nowrap">
                NexDoc AI
              </span>
            )}
          </Link>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-lime text-charcoal" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors",
                !isSidebarOpen && "justify-center"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-lime" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.company}</p>
                </div>
              )}
              {isSidebarOpen && <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && isSidebarOpen && (
              <div className="mt-2 py-2 bg-white/5 rounded-xl">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  个人资料
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索合同、风险..."
                className="bg-transparent text-sm focus:outline-none w-48"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Quick Upload */}
            <NavLink
              to="/dashboard/upload"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-lime hover:bg-lime/90 text-charcoal font-medium rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" />
              上传合同
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
