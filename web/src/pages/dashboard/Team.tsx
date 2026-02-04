import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical,
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { HolographicCard } from '@/components/HolographicCard';
import { MagneticButton } from '@/components/MagneticButton';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  contracts: number;
  lastActive: string;
  avatar: string | null;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface Stat {
  name: string;
  value: number;
  color: string;
  icon?: any;
}

export const Team: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isSending, setIsSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('NexDoc_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Members
      const membersRes = await fetch('/api/v1/team/members', { headers });
      const membersData = await membersRes.json();
      setMembers(membersData);

      // Fetch Stats
      const statsRes = await fetch('/api/v1/team/stats', { headers });
      const statsData = await statsRes.json();
      // Map icons to stats
      const iconMap: Record<string, any> = {
        '团队成员': Users,
        '待审核': Clock,
        '管理员': Shield,
        '本月活跃': CheckCircle
      };
      setStats(statsData.map((s: any) => ({ ...s, icon: iconMap[s.name] || Users })));

      // Fetch Activities
      const activitiesRes = await fetch('/api/v1/team/activities', { headers });
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData);

    } catch (error) {
      console.error("Failed to fetch team data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsSending(true);
    const token = localStorage.getItem('NexDoc_token');
    
    try {
      const response = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      
      if (!response.ok) {
         const err = await response.json();
         alert(err.detail || "Invite failed");
         setIsSending(false);
         return;
      }

      setInviteSuccess(true);
      fetchData(); // Refresh data
    } catch (e) {
      console.error(e);
      alert("Invite failed");
      setIsSending(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-600',
      member: 'bg-blue-100 text-blue-600',
      viewer: 'bg-gray-100 text-gray-600',
      pending: 'bg-orange-100 text-orange-600',
    };
    const labels: Record<string, string> = {
      admin: '管理员',
      member: '成员',
      viewer: '访客',
      pending: '待审核',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const getStatusIndicator = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      inactive: 'bg-gray-400',
      pending: 'bg-orange-500',
    };
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <span className="text-sm text-gray-500">
          {status === 'active' && '在线'}
          {status === 'inactive' && '离线'}
          {status === 'pending' && '待激活'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">团队协作</h1>
          <p className="text-gray-500 mt-1">管理团队成员和协作权限</p>
        </div>
        <MagneticButton 
          variant="primary" 
          size="sm"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          邀请成员
        </MagneticButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon || Users;
          return (
            <HolographicCard key={index} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-charcoal mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
              </div>
            </HolographicCard>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索成员..."
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

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">成员</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">角色</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">部门</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">合同数</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center">
                          <span className="font-medium text-lime">{member.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{member.department}</td>
                    <td className="px-6 py-4">{getStatusIndicator(member.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{member.contracts}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Mail className="w-4 h-4 text-gray-400" />
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
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-charcoal mb-4">团队动态</h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-lime/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-lime">{activity.user[0]}</span>
                </div>
                <div>
                  <p className="text-sm text-charcoal">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2 text-sm text-lime hover:underline">
            查看全部动态
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isSending && setShowInviteModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6">
            {!inviteSuccess ? (
              <>
                <h2 className="text-xl font-bold text-charcoal mb-4">邀请团队成员</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      邮箱地址
                    </label>
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isSending}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      角色权限
                    </label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      disabled={isSending}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-gray-100"
                    >
                      <option value="member">成员 - 可上传和分析合同</option>
                      <option value="viewer">访客 - 仅可查看</option>
                      <option value="admin">管理员 - 完全权限</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <MagneticButton 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowInviteModal(false)}
                      disabled={isSending}
                    >
                      取消
                    </MagneticButton>
                    <MagneticButton 
                      variant="primary" 
                      className="flex-1"
                      onClick={handleInvite}
                      disabled={isSending || !inviteEmail}
                    >
                      {isSending ? '发送中...' : '发送邀请'}
                    </MagneticButton>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-lime flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-charcoal" />
                </div>
                <h2 className="text-xl font-bold text-charcoal mb-2">邀请已发送</h2>
                <p className="text-gray-500 mb-6">
                  邀请邮件已发送至 {inviteEmail}
                </p>
                <MagneticButton 
                  variant="primary"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteSuccess(false);
                    setInviteEmail('');
                    setInviteRole('member');
                  }}
                >
                  知道了
                </MagneticButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
