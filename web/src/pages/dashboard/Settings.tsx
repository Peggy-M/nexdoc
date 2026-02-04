import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Key,
  Mail,
  Smartphone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

const tabs = [
  { id: 'profile', name: '个人资料', icon: User },
  { id: 'notifications', name: '通知设置', icon: Bell },
  { id: 'security', name: '安全设置', icon: Shield },
  { id: 'api', name: 'API 密钥', icon: Key },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    riskAlert: true,
    weeklyReport: true,
    teamActivity: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCopy = (key: string, type: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-lime">测</span>
        </div>
        <div>
          <h3 className="font-semibold text-charcoal">测试用户</h3>
          <p className="text-sm text-gray-400">test@company.com</p>
          <p className="text-sm text-gray-400">测试公司 · 法务部</p>
        </div>
        <MagneticButton variant="outline" className="ml-auto">
          更换头像
        </MagneticButton>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            姓名
          </label>
          <input
            type="text"
            defaultValue="测试用户"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            邮箱
          </label>
          <input
            type="email"
            defaultValue="test@company.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            部门
          </label>
          <input
            type="text"
            defaultValue="法务部"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            职位
          </label>
          <input
            type="text"
            defaultValue="法务经理"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
      </div>

      <div className="flex justify-end items-center gap-4">
        {showSuccess && (
          <span className="text-green-500 text-sm flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            保存成功
          </span>
        )}
        <MagneticButton 
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存更改'}
        </MagneticButton>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { key: 'email', label: '邮件通知', description: '接收合同分析完成、风险提醒等邮件通知' },
          { key: 'push', label: '推送通知', description: '接收浏览器推送通知' },
          { key: 'riskAlert', label: '风险警报', description: '当检测到高风险条款时立即通知' },
          { key: 'weeklyReport', label: '周报', description: '每周一接收上周合同审查报告' },
          { key: 'teamActivity', label: '团队动态', description: '当团队成员上传或审核合同时通知' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-charcoal">{item.label}</p>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                notifications[item.key as keyof typeof notifications] ? "bg-lime" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                notifications[item.key as keyof typeof notifications] ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <p className="font-medium text-green-700">账户安全</p>
          <p className="text-sm text-green-600">您的账户目前安全，上次登录：2024-01-15 14:30</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-lime" />
              </div>
              <div>
                <p className="font-medium text-charcoal">登录密码</p>
                <p className="text-sm text-gray-400">上次修改：3 个月前</p>
              </div>
            </div>
            <MagneticButton variant="outline">修改密码</MagneticButton>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-lime" />
              </div>
              <div>
                <p className="font-medium text-charcoal">手机绑定</p>
                <p className="text-sm text-gray-400">138****8888</p>
              </div>
            </div>
            <MagneticButton variant="outline">更换手机</MagneticButton>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-lime" />
              </div>
              <div>
                <p className="font-medium text-charcoal">邮箱绑定</p>
                <p className="text-sm text-gray-400">test@company.com</p>
              </div>
            </div>
            <MagneticButton variant="outline">更换邮箱</MagneticButton>
          </div>
        </div>

        <div className="p-4 border border-orange-200 rounded-xl bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium text-orange-700">双重验证未开启</p>
              <p className="text-sm text-orange-600">建议开启双重验证以提高账户安全性</p>
            </div>
            <MagneticButton variant="primary" className="ml-auto">
              立即开启
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600">
          API 密钥用于将 NexDoc AI 集成到您的系统中。
          请妥善保管，不要泄露给他人。
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-charcoal">生产环境密钥</p>
              <p className="text-sm text-gray-400">创建于 2024-01-01</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">活跃</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm font-mono">
              lg_live_****************************xyz
            </code>
            <MagneticButton 
              variant="outline"
              onClick={() => handleCopy('lg_live_****************************xyz', 'live')}
            >
              {copiedKey === 'live' ? '已复制' : '复制'}
            </MagneticButton>
            <MagneticButton variant="outline">重新生成</MagneticButton>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-charcoal">测试环境密钥</p>
              <p className="text-sm text-gray-400">创建于 2024-01-01</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">活跃</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm font-mono">
              lg_test_****************************abc
            </code>
            <MagneticButton 
              variant="outline"
              onClick={() => handleCopy('lg_test_****************************abc', 'test')}
            >
              {copiedKey === 'test' ? '已复制' : '复制'}
            </MagneticButton>
            <MagneticButton variant="outline">重新生成</MagneticButton>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-lime/5 rounded-xl border border-lime/20">
        <div>
          <p className="font-medium text-charcoal">API 文档</p>
          <p className="text-sm text-gray-500">查看完整的 API 接口文档和示例代码</p>
        </div>
        <MagneticButton variant="primary">查看文档</MagneticButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal">设置</h1>
        <p className="text-gray-500 mt-1">管理您的账户和系统设置</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-lime text-charcoal"
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-charcoal mb-6">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'api' && renderAPI()}
          </div>
        </div>
      </div>
    </div>
  );
};
