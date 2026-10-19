import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { ModerationReportDto } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { CheckCircle2, ArrowLeft, ExternalLink, Flag } from 'lucide-react';

export const AdminModerationPage: React.FC = () => {
  const [reports, setReports] = useState<ModerationReportDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ACTIONED' | 'DISMISSED' | ''>('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'APPROVE_ITEM' | 'REJECT_ITEM' | 'DISMISS_REPORT' | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const paged = await adminService.getModerationQueue(statusFilter || undefined, 0, 20);
      setReports(paged.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const initiateAction = (reportId: number, action: 'APPROVE_ITEM' | 'REJECT_ITEM' | 'DISMISS_REPORT') => {
    setSelectedReportId(reportId);
    setActionType(action);
    setActionNotes('');
    setActionModalOpen(true);
  };

  const executeAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !actionType) return;
    try {
      setProcessingAction(true);
      await adminService.takeModerationAction(selectedReportId, actionType, actionNotes.trim() || undefined);
      setActionModalOpen(false);
      setSelectedReportId(null);
      setActionType(null);
      setActionNotes('');
      await fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to execute moderation action');
    } finally {
      setProcessingAction(false);
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
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">Content Moderation Queue</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Review listings flagged by the community for safety and compliance.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#2B3850] gap-6 text-sm font-semibold">
        {(['PENDING', 'ACTIONED', 'DISMISSED', ''] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              statusFilter === s
                ? 'border-[#6D5EF7] text-[#8D82F9] font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {s === '' ? 'All Reports' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Moderation Queue Clear"
          description="There are currently no flagged items in this filter category."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">Flag #{r.id}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        r.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : r.status === 'ACTIONED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#182338] text-[#94A3B8] border border-[#2B3850]'
                      }`}
                    >
                      {r.status}
                    </span>
                    <Badge type={r.itemType} size="sm" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F1F5F9]">{r.itemTitle}</h3>
                  <div className="text-xs text-[#94A3B8] mt-0.5">
                    Flagged by: <strong className="text-[#F1F5F9]">{r.reporterName}</strong> on {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <Link
                  to={`/items/${r.itemReportId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8D82F9] hover:text-[#A79FFB]"
                >
                  Inspect item listing <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Flag reason box */}
              <div className="p-4 bg-[#182338] rounded-xl border border-[#2B3850] text-xs space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-rose-400" />
                  <span>Report Reason: {r.reason}</span>
                </div>
                {r.details && <p className="text-[#94A3B8] mt-1">{r.details}</p>}
              </div>

              {/* Action buttons if PENDING */}
              {r.status === 'PENDING' && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => initiateAction(r.id, 'APPROVE_ITEM')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/25 transition cursor-pointer"
                  >
                    Confirm &amp; Keep Approved
                  </button>

                  <button
                    onClick={() => initiateAction(r.id, 'REJECT_ITEM')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-600/25 transition cursor-pointer"
                  >
                    Remove Listing
                  </button>

                  <button
                    onClick={() => initiateAction(r.id, 'DISMISS_REPORT')}
                    className="px-4 py-2 bg-[#182338] hover:bg-[#202E48] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    Dismiss Flag
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Moderation Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={
          actionType === 'APPROVE_ITEM'
            ? 'Confirm Listing Approval'
            : actionType === 'REJECT_ITEM'
            ? 'Confirm Listing Removal'
            : 'Dismiss Flag Report'
        }
      >
        <form onSubmit={executeAction} className="space-y-4 text-[#F1F5F9]">
          <p className="text-xs text-[#94A3B8]">
            {actionType === 'APPROVE_ITEM' &&
              'The listing will remain active and public on the platform. The report will be marked as actioned.'}
            {actionType === 'REJECT_ITEM' &&
              'The listing will be immediately unlisted and rejected. All users will be shielded from viewing this content.'}
            {actionType === 'DISMISS_REPORT' &&
              'The flag report will be closed and dismissed with no penalty or change to the listing.'}
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
              Moderation Rationale / Audit Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide reason or context for audit logging (e.g. Verified legitimate receipt, Duplicate listing, Prohibited item)..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setActionModalOpen(false)}
              className="flex-1 py-2.5 bg-[#182338] hover:bg-[#202E48] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingAction}
              className={`flex-1 py-2.5 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-md ${
                actionType === 'APPROVE_ITEM'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : actionType === 'REJECT_ITEM'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : 'bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-[#6D5EF7]/25'
              }`}
            >
              {processingAction ? 'Executing...' : 'Confirm Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
