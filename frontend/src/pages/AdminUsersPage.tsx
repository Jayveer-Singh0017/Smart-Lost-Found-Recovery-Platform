import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { UserAdminDto } from '../types';
import { ArrowLeft, Search, Shield } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAdminDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const paged = await adminService.getUsers(search.trim() || undefined, 0, 30);
      setUsers(paged.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await adminService.toggleUserStatus(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleToggleRole = async (user: UserAdminDto) => {
    const nextRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    if (window.confirm(`Are you sure you want to change ${user.fullName}'s role to ${nextRole}?`)) {
      try {
        await adminService.updateUserRole(user.id, nextRole as any);
        await fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to update user role');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition gap-1 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to admin dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">User Account Directory</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Manage platform members, permission roles, and account statuses.</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="max-w-md flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#182338] border border-[#2B3850] rounded-xl text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#6D5EF7] text-white font-semibold text-xs rounded-xl hover:bg-[#5B4CE6] transition cursor-pointer shadow-md shadow-[#6D5EF7]/25"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182338] border-b border-[#2B3850] text-[#94A3B8] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3850] text-[#F1F5F9]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#182338]/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#F1F5F9]">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">{u.phoneNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                          u.role === 'ROLE_ADMIN'
                            ? 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30'
                            : 'bg-[#182338] text-[#94A3B8] border border-[#2B3850]'
                        }`}
                      >
                        {u.role === 'ROLE_ADMIN' && <Shield className="w-3 h-3 text-[#FBBF24]" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold ${
                          u.enabled
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {u.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#8D82F9] bg-[#6D5EF7]/15 hover:bg-[#6D5EF7]/25 border border-[#6D5EF7]/30 rounded-lg transition cursor-pointer"
                      >
                        {u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                          u.enabled
                            ? 'text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30'
                            : 'text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30'
                        }`}
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
