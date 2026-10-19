import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { ItemSummaryResponse, ClaimResponse } from '../types';
import { StatCard } from '../components/StatCard';
import { ItemCard } from '../components/ItemCard';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState<ItemSummaryResponse[]>([]);
  const [myClaims, setMyClaims] = useState<ClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [reportsData, claimsData] = await Promise.all([
          itemService.getMyReports(0, 8),
          claimService.getMyClaims(0, 5),
        ]);
        setMyReports(reportsData.content);
        setMyClaims(claimsData.content);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const openCount = myReports.filter((r) => r.status === 'OPEN' || r.status === 'CLAIM_PENDING').length;
  const resolvedCount = myReports.filter((r) => r.status === 'RESOLVED').length;
  const pendingClaimsCount = myClaims.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#F1F5F9]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#121A2B] via-[#182338] to-[#121A2B] rounded-3xl p-8 sm:p-10 border border-[#2B3850] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#8D82F9] uppercase tracking-widest">User Dashboard</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-xl">
            Manage your reported belongings, inspect potential deterministic matches, and review ownership recovery claims.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 text-[#2DD4BF] border border-[#2DD4BF]/30 font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports Posted"
          value={myReports.length}
          icon={FileText}
          subtitle="All-time listings"
          iconColor="text-[#6D5EF7]"
          iconBg="bg-[#6D5EF7]/15"
        />
        <StatCard
          title="Active Open Listings"
          value={openCount}
          icon={Clock}
          subtitle="Currently open for claims"
          iconColor="text-[#38BDF8]"
          iconBg="bg-[#38BDF8]/15"
        />
        <StatCard
          title="Recovered / Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          subtitle="Successful returns"
          iconColor="text-[#2DD4BF]"
          iconBg="bg-[#2DD4BF]/15"
        />
        <StatCard
          title="Pending Claims"
          value={pendingClaimsCount}
          icon={ShieldCheck}
          subtitle="Under evaluation"
          iconColor="text-[#FBBF24]"
          iconBg="bg-[#FBBF24]/15"
        />
      </div>

      {/* My Reports Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#F1F5F9]">My Belonging Reports</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Listings you have created</p>
          </div>
          <Link
            to="/report-lost"
            className="text-xs font-semibold text-[#8D82F9] hover:text-[#A79FFB] transition flex items-center gap-1"
          >
            Create new report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#121A2B] rounded-2xl p-4 border border-[#2B3850] animate-pulse space-y-3">
                <div className="aspect-[16/10] bg-[#182338] rounded-xl"></div>
                <div className="h-4 bg-[#182338] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : myReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {myReports.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="You haven't posted any items yet"
            description="Report an item you lost or found to start receiving automated match recommendations."
            actionText="Report Lost Item"
            actionLink="/report-lost"
          />
        )}
      </div>

      {/* Recent Claims Overview Section */}
      <div className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#2B3850] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#F1F5F9]">Recent Claims Activity</h3>
            <p className="text-xs text-[#94A3B8]">Ownership claims you submitted on found items</p>
          </div>
          <Link to="/claims" className="text-xs font-semibold text-[#8D82F9] hover:text-[#A79FFB]">
            View all claims →
          </Link>
        </div>

        {myClaims.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No active claims on other items.</p>
        ) : (
          <div className="divide-y divide-[#2B3850]">
            {myClaims.map((claim) => (
              <div key={claim.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#F1F5F9]">{claim.itemTitle}</span>
                  <span className="text-[#94A3B8] ml-2">
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Badge status={claim.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
