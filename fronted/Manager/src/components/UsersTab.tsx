import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ShieldOff, ShieldCheck } from 'lucide-react';
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

const roleLabels: Record<string, string> = {
  customer: '客户', merchant: '商家', rider: '骑手', admin: '管理员',
};
const roleBadge: Record<string, string> = {
  customer: 'bg-blue-50 text-blue-600',
  merchant: 'bg-orange-50 text-orange-600',
  rider:    'bg-emerald-50 text-emerald-600',
  admin:    'bg-purple-50 text-purple-600',
};

export default function UsersTab() {
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch]         = useState('');
  const [userList, setUserList]     = useState<ApiUser[]>([]);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminAPI.users();
      if (res.code === 0) setUserList(res.data.items);
    } catch {
      toast('加载用户失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = userList.filter(u => {
    if (filterRole !== 'all' && !u.roles.includes(filterRole)) return false;
    if (search && !u.phone.includes(search) && !u.email?.includes(search)) return false;
    return true;
  });

  const toggleBan = (u: ApiUser) => {
    const banning = u.status === 'active';
    showModal(
      banning ? '确认封禁' : '确认解封',
      `${banning ? '封禁' : '解封'} ${u.phone}？`,
      <p className="text-sm text-gray-500">{banning ? '封禁后该用户将无法登录平台。' : '解封后用户可正常使用平台。'}</p>,
      async () => {
        try {
          const res: any = banning ? await adminAPI.banUser(u.id) : await adminAPI.unbanUser(u.id);
          if (res.code === 0) {
            toast(banning ? '已封禁' : '已解封');
            setUserList(prev => prev.map(x => x.id === u.id ? { ...x, status: res.data.status } : x));
          } else toast(res.message || '操作失败');
        } catch (e: any) {
          toast(e.response?.data?.message || '操作失败');
        }
      },
    );
  };

  const roles = ['all', 'customer', 'merchant', 'rider', 'admin'];
  const banner  = userList.filter(u => u.status === 'banned').length;
  const active  = userList.length - banner;

  return (
    <div className="space-y-5">
      {/* Title + stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">管理平台所有注册用户</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{userList.length}</p>
            <p className="text-gray-400">总用户</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">{active}</p>
            <p className="text-gray-400">正常</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{banner}</p>
            <p className="text-gray-400">封禁</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索手机号或邮箱..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterRole === r
                  ? 'bg-[#0085FF] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r === 'all' ? '全部' : roleLabels[r]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 ml-auto">共 {filtered.length} 条</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600 w-8">#</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">手机号</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">邮箱</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">角色</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">状态</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">注册时间</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-300">
                  <Loader2 className="animate-spin mx-auto" size={28} />
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                  没有匹配的用户
                </td>
              </tr>
            )}
            {!loading && filtered.map((u, idx) => {
              const role = u.roles[0] || 'customer';
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{u.phone}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${roleBadge[role] || 'bg-gray-100 text-gray-500'}`}>
                      {roleLabels[role] || role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        正常
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        已封禁
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(u.date_joined).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleBan(u)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        u.status === 'active'
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'active'
                        ? <><ShieldOff size={13} /> 封禁</>
                        : <><ShieldCheck size={13} /> 解封</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
