import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { ClaimResponse } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const AdminClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAllClaims(0, 30)
      .then((p) => setClaims(p.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition gap-1 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to admin dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">System-Wide Claims Oversight</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Review all active, approved, and rejected claims across all items.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        </div>
      ) : claims.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Claims Found"
          description="There are currently no claims submitted in the database."
        />
      ) : (
        <div className="bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182338] border-b border-[#2B3850] text-[#94A3B8] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Claim ID</th>
                  <th className="py-3.5 px-4">Item Report</th>
                  <th className="py-3.5 px-4">Claimant</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Proof Summary</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3850] text-[#F1F5F9]">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-[#182338]/60 transition">
                    <td className="py-3.5 px-4 font-bold text-[#F1F5F9]">#{c.id}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/items/${c.itemReportId}`}
                        className="font-semibold text-[#8D82F9] hover:underline line-clamp-1"
                      >
                        {c.itemTitle}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{c.claimantName}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[#94A3B8]">
                      {c.proofDescription}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
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
