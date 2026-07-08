import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { adminAPI } from '../api';
import { showModal, toast } from '@shared';

interface ApiUser {
  id: number;
  phone: string;
  email: string;
  status: 'active' | 'banned';
  roles: string[];
  date_joined: string;
}

const roleLabels: Record<string, string> = { customer: '客户', merchant: '商家', rider: '骑手', admin: '管理员' };
const roleColors: Record<string, string> = { customer: 'bg-blue-50 text-[#0085FF]', merchant: 'bg-orange-50 text-[#FF5000]', rider: 'bg-green-50 text-[#00B578]', admin: 'bg-purple-50 text-purple-600' };

export default function UsersTab() {
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');
  const [userList, setUserList] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await adminAPI.users();
      if (response.code === 0) setUserList(response.data.items);
    } catch {
      toast('加载用户失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = userList.filter(u => {
    if (filterRole !== 'all' && !u.roles.includes(filterRole)) return false;
    if (search && !u.phone.includes(search)) return false;
    return true;
  });

  const toggleBan = (u: ApiUser) => {
    const isBanning = u.status === 'active';
    showModal(
      isBanning ? '封禁用户' : '解封用户',
      `确定要${isBanning ? '封禁' : '解封'}用户 ${u.phone} 吗？`,
      <p className="text-[13px] text-gray-500">{isBanning ? '封禁后用户将无法登录。' : '解封后用户可正常使用平台。'}</p>,
      async () => {
        try {
          const response: any = isBanning ? await adminAPI.banUser(u.id) : await adminAPI.unbanUser(u.id);
          if (response.code === 0) {
            toast(isBanning ? '用户已封禁' : '用户已解封');
            setUserList(prev => prev.map(x => x.id === u.id ? { ...x, status: response.data.status } : x));
          } else {
            toast(response.message || '操作失败');
          }
        } catch (e: any) {
          toast(e.response?.data?.message || '操作失败');
        }
      }
    );
  };

  const roles = ['all', 'customer', 'merchant', 'rider', 'admin'];
  const primaryRole = (u: ApiUser) => u.roles[0] || 'customer';

  return (
    <div className="space-y-4">
      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="搜索手机号"
            className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-[14px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 flex gap-2 overflow-x-auto hide-scrollbar">
        {roles.map(r => (
          <button key={r} onClick={() => setFilterRole(r)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filterRole === r ? 'bg-[#0085FF] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {r === 'all' ? '全部' : roleLabels[r]}
          </button>
        ))}
      </div>

      {!loading && (
        <div className="px-4 grid grid-cols-3 gap-2.5">
          {[
            { label: '总用户', value: userList.length, color: 'text-[#0085FF]' },
            { label: '已封禁', value: userList.filter(u => u.status === 'banned').length, color: 'text-[#FF5000]' },
            { label: '活跃率', value: Math.round(userList.filter(u => u.status === 'active').length / Math.max(userList.length, 1) * 100) + '%', color: 'text-[#00B578]' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[16px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 text-center">
              <div className={`text-[22px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 space-y-3 pb-4">
        {loading && <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" size={28} /></div>}
        {!loading && filtered.map(user => {
          const role = primaryRole(user);
          return (
            <div key={user.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${roleColors[role] || 'bg-gray-50 text-gray-400'}`}>
                  {user.phone.slice(-4, -2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-gray-900">{user.phone}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleColors[role] || 'bg-gray-50 text-gray-400'}`}>{roleLabels[role] || '用户'}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(user.date_joined).toLocaleDateString('zh-CN')} 注册
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.status === 'banned' && <span className="text-[11px] text-[#FF5000] font-medium bg-red-50 px-2 py-0.5 rounded-full">已封禁</span>}
                <button onClick={() => toggleBan(user)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${user.status === 'active' ? 'border border-red-200 text-red-500' : 'border border-[#0085FF] text-[#0085FF]'}`}>
                  {user.status === 'active' ? '封禁' : '解封'}
                </button>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-[14px]">没有匹配的用户</div>}
      </div>
    </div>
  );
}
