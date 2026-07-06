import { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { users, User } from '../store';
import { toast } from '@shared';

const roleLabels: Record<string, string> = { customer: '客户', merchant: '商家', rider: '骑手', admin: '管理员' };
const roleColors: Record<string, string> = { customer: 'bg-blue-50 text-[#0085FF]', merchant: 'bg-orange-50 text-[#FF5000]', rider: 'bg-green-50 text-[#00B578]', admin: 'bg-purple-50 text-purple-600' };

export default function UsersTab() {
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');
  const [userList, setUserList] = useState(users);

  const filtered = userList.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (search && !u.name.includes(search) && !u.phone.includes(search)) return false;
    return true;
  });

  const toggleBan = (id: number) => {
    const target = userList.find(u => u.id === id);
    const nextStatus = target?.status === 'active' ? 'banned' as const : 'active' as const;
    setUserList(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    toast(nextStatus === 'banned' ? '用户已封禁' : '用户已解封');
  };

  const roles = ['all', 'customer', 'merchant', 'rider', 'admin'];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="搜索用户名称或手机号"
            className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-[14px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Role Filter */}
      <div className="px-4 flex gap-2 overflow-x-auto hide-scrollbar">
        {roles.map(r => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filterRole === r ? 'bg-[#0085FF] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#0085FF]'}`}
          >
            {r === 'all' ? '全部' : roleLabels[r]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="px-4 grid grid-cols-3 gap-2.5">
        {[
          { label: '总用户', value: userList.length, color: 'text-[#0085FF]' },
          { label: '已封禁', value: userList.filter(u => u.status === 'banned').length, color: 'text-[#FF5000]' },
          { label: '活跃率', value: Math.round(userList.filter(u => u.status === 'active').length / userList.length * 100) + '%', color: 'text-[#00B578]' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[16px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 text-center">
            <div className={`text-[22px] font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* User List */}
      <div className="px-4 space-y-3 pb-4">
        {filtered.map(user => (
          <div key={user.id} className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${roleColors[user.role]}`}>
                {user.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px] text-gray-900">{user.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${roleColors[user.role]}`}>{roleLabels[user.role]}</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{user.phone} · {user.registeredAt} 注册{user.orderCount !== undefined ? ` · ${user.orderCount}单` : ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.status === 'banned' && <span className="text-[11px] text-[#FF5000] font-medium bg-red-50 px-2 py-0.5 rounded-full">已封禁</span>}
              <button
                onClick={() => toggleBan(user.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${user.status === 'active' ? 'border border-red-200 text-red-500 hover:bg-red-50' : 'border border-[#0085FF] text-[#0085FF] hover:bg-blue-50'}`}
              >
                {user.status === 'active' ? '封禁' : '解封'}
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-[14px]">没有匹配的用户</div>
        )}
      </div>
    </div>
  );
}
