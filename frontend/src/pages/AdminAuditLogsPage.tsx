import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { AuditLogDto } from '../types';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, History } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAuditLogs(0, 50)
      .then((p) => setLogs(p.content))
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
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">Security &amp; Workflow Audit Trail</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Immutable chronological ledger recording all authentication, report creation, claim decisions, and admin interventions.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Audit Records"
          description="System events will be automatically recorded here as users interact with the platform."
        />
      ) : (
        <div className="bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#182338] border-b border-[#2B3850] text-[#94A3B8] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3850] text-[#F1F5F9]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#182338]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F1F5F9]">
                      <span className="px-2 py-0.5 rounded bg-[#182338] text-[#8D82F9] border border-[#2B3850]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {log.entityName} #{log.entityId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#F1F5F9]">{log.performedBy}</td>
                    <td className="py-3.5 px-4 max-w-sm truncate text-[#94A3B8]">{log.details}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
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
