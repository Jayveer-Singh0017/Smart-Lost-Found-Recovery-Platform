import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { AdminDashboardStatsDto } from '../types';
import { StatCard } from '../components/StatCard';
import {
  Users,
  FileQuestion,
  FileCheck,
  CheckCircle2,
  ShieldAlert,
  History,
  Shield,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#F1F5F9]">
        <div className="w-10 h-10 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        <p className="text-[#94A3B8] text-xs mt-3">Loading administrator metrics from MySQL...</p>
      </div>
    );
  }

  // Data for charts
  const typeData = [
    { name: 'Lost Items', count: stats?.totalLostReports || 0, fill: '#f43f5e' },
    { name: 'Found Items', count: stats?.totalFoundReports || 0, fill: '#2DD4BF' },
  ];

  const statusData = [
    { name: 'Open', value: stats?.totalOpenReports || 0, color: '#38BDF8' },
    { name: 'Resolved', value: stats?.totalResolvedReports || 0, color: '#2DD4BF' },
    { name: 'Pending Claims', value: stats?.pendingClaimsCount || 0, color: '#FBBF24' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#F1F5F9]">
      {/* Top Banner */}
      <div className="bg-[#121A2B] rounded-3xl p-8 sm:p-10 border border-[#2B3850] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182338] border border-[#2B3850] text-[#FBBF24] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Administration Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F1F5F9]">System Operations &amp; Metrics</h1>
          <p className="text-xs text-[#94A3B8] max-w-xl">
            Live database aggregates, community moderation queue, verified claim resolution, and security audit logging.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link
            to="/admin/moderation"
            className="px-3.5 py-2 rounded-xl bg-[#182338] hover:bg-[#202E48] border border-[#2B3850] text-[#F1F5F9] transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
            <span>Moderation ({stats?.pendingModerationCount || 0})</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 rounded-xl bg-[#182338] hover:bg-[#202E48] border border-[#2B3850] text-[#F1F5F9] transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-[#38BDF8]" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-3.5 py-2 rounded-xl bg-[#182338] hover:bg-[#202E48] border border-[#2B3850] text-[#F1F5F9] transition flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-[#2DD4BF]" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Metrics Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          subtitle="Active community members"
          iconColor="text-[#38BDF8]"
          iconBg="bg-[#38BDF8]/15"
        />
        <StatCard
          title="Lost Belongings Reported"
          value={stats?.totalLostReports || 0}
          icon={FileQuestion}
          subtitle="Search candidates"
          iconColor="text-rose-400"
          iconBg="bg-rose-500/15"
        />
        <StatCard
          title="Found Items Logged"
          value={stats?.totalFoundReports || 0}
          icon={FileCheck}
          subtitle="Available for matching"
          iconColor="text-[#2DD4BF]"
          iconBg="bg-[#2DD4BF]/15"
        />
        <StatCard
          title="Successfully Resolved"
          value={stats?.totalResolvedReports || 0}
          icon={CheckCircle2}
          subtitle="Reunited with owners"
          iconColor="text-[#8D82F9]"
          iconBg="bg-[#6D5EF7]/15"
        />
      </div>

      {/* Charts Section using Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Lost vs Found Distribution */}
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-[#2B3850] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#2B3850] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9]">Report Ingestion Volume</h3>
              <p className="text-xs text-[#94A3B8]">Distribution between lost and found submissions</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#8D82F9]" />
          </div>

          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#182338',
                    borderRadius: '12px',
                    color: '#F1F5F9',
                    border: '1px solid #2B3850',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={48}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Distribution */}
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-[#2B3850] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#2B3850] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9]">Platform Status Ratio</h3>
              <p className="text-xs text-[#94A3B8]">Breakdown of listings by resolution lifecycle</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
          </div>

          <div className="h-64 pt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#182338',
                    borderRadius: '12px',
                    color: '#F1F5F9',
                    border: '1px solid #2B3850',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/moderation"
          className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F1F5F9] group-hover:text-[#8D82F9] transition">
              Moderation Queue
            </h4>
            <p className="text-xs text-[#94A3B8]">
              {stats?.pendingModerationCount || 0} flagged items require decision
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#8D82F9] transition" />
        </Link>

        <Link
          to="/admin/categories"
          className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F1F5F9] group-hover:text-[#8D82F9] transition">
              Category Taxonomy
            </h4>
            <p className="text-xs text-[#94A3B8]">Add categories, customize icons, and manage taxonomy</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#8D82F9] transition" />
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F1F5F9] group-hover:text-[#8D82F9] transition">
              Audit History Trail
            </h4>
            <p className="text-xs text-[#94A3B8]">Immutable chronological record of critical system actions</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#8D82F9] transition" />
        </Link>
      </div>
    </div>
  );
};
