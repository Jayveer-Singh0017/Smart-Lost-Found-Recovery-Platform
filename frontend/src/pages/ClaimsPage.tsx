import React, { useState, useEffect } from 'react';
import { claimService } from '../services/claimService';
import { ClaimResponse } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  User,
  Phone,
  FileCheck2,
  Lock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const ClaimsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'submitted'>('incoming');
  const [incomingClaims, setIncomingClaims] = useState<ClaimResponse[]>([]);
  const [submittedClaims, setSubmittedClaims] = useState<ClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimResponse | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [processingReview, setProcessingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const [incoming, submitted] = await Promise.all([
        claimService.getClaimsOnMyItems(0, 30),
        claimService.getMyClaims(0, 30),
      ]);
      setIncomingClaims(incoming.content);
      setSubmittedClaims(submitted.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const openReviewModal = (claim: ClaimResponse) => {
    setSelectedClaim(claim);
    setReviewerNotes('');
    setReviewError(null);
    setReviewModalOpen(true);
  };

  const handleReviewDecision = async (approved: boolean) => {
    if (!selectedClaim) return;
    try {
      setProcessingReview(true);
      setReviewError(null);
      await claimService.reviewClaim(selectedClaim.id, {
        approved,
        reviewerNotes: reviewerNotes.trim() || undefined,
      });
      setReviewModalOpen(false);
      await fetchClaims();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to process claim review.');
    } finally {
      setProcessingReview(false);
    }
  };

  const handleWithdrawClaim = async (claimId: number) => {
    if (window.confirm('Are you sure you want to withdraw this claim?')) {
      try {
        await claimService.withdrawClaim(claimId);
        await fetchClaims();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to withdraw claim');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      <div>
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">Ownership Claims &amp; Verification</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Review incoming ownership claims on your listings or monitor your submitted claims.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2B3850]">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'incoming'
              ? 'border-[#6D5EF7] text-[#8D82F9]'
              : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <span>Incoming Claims on My Items</span>
          <span className="px-2 py-0.5 rounded-full bg-[#6D5EF7]/20 text-[#8D82F9] text-xs font-semibold border border-[#6D5EF7]/30">
            {incomingClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'submitted'
              ? 'border-[#6D5EF7] text-[#8D82F9]'
              : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <span>Claims I Submitted</span>
          <span className="px-2 py-0.5 rounded-full bg-[#182338] text-[#94A3B8] text-xs font-semibold border border-[#2B3850]">
            {submittedClaims.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activeTab === 'incoming' ? (
        incomingClaims.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Incoming Claims Yet"
            description="When another user claims one of your lost or found listings, their proof details will appear here for your review."
          />
        ) : (
          <div className="space-y-4">
            {incomingClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500">Claim #{claim.id}</span>
                      <Badge status={claim.status} size="sm" />
                    </div>
                    <h3 className="text-lg font-bold text-[#F1F5F9]">
                      Claim on &ldquo;{claim.itemTitle}&rdquo;
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                      <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>Claimant: <strong className="text-[#F1F5F9]">{claim.claimantName}</strong></span>
                      <span>•</span>
                      <span>Submitted: {new Date(claim.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {claim.status === 'PENDING' && (
                    <button
                      onClick={() => openReviewModal(claim)}
                      className="px-4 py-2 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#6D5EF7]/25 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Review &amp; Decide</span>
                    </button>
                  )}
                </div>

                {/* Proof Description */}
                <div className="bg-[#182338] p-4 rounded-xl border border-[#2B3850] text-xs space-y-2">
                  <div>
                    <span className="font-bold text-[#8D82F9] uppercase tracking-wider block mb-1">
                      Claimant's Proof of Ownership:
                    </span>
                    <p className="text-[#F1F5F9] leading-relaxed whitespace-pre-line">
                      {claim.proofDescription}
                    </p>
                  </div>

                  {claim.secretIdentifiers && (
                    <div className="pt-2 border-t border-[#2B3850] flex items-start gap-1.5 text-indigo-300">
                      <Lock className="w-3.5 h-3.5 text-[#8D82F9] mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Confidential Secret Identifier:</strong> {claim.secretIdentifiers}
                      </div>
                    </div>
                  )}

                  {claim.contactPhone && (
                    <div className="pt-1 flex items-center gap-1 text-[#94A3B8]">
                      <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>Contact phone: {claim.contactPhone}</span>
                    </div>
                  )}
                </div>

                {/* If already resolved */}
                {claim.status !== 'PENDING' && (
                  <div className="text-xs text-[#94A3B8] pt-1 flex items-center justify-between">
                    <div>
                      Resolved by: <strong className="text-[#F1F5F9]">{claim.reviewerName || 'Owner'}</strong> on{' '}
                      {claim.resolvedAt ? new Date(claim.resolvedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    {claim.reviewerNotes && (
                      <span className="italic text-[#94A3B8]">Notes: &ldquo;{claim.reviewerNotes}&rdquo;</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Submitted Claims Tab */
        submittedClaims.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="You Haven't Submitted Any Claims"
            description="When you find an item in public search that belongs to you, submit a claim to begin the recovery process."
          />
        ) : (
          <div className="space-y-4">
            {submittedClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge type={claim.itemType} size="sm" />
                      <Badge status={claim.status} size="sm" />
                    </div>
                    <h3 className="text-lg font-bold text-[#F1F5F9]">{claim.itemTitle}</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {claim.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdrawClaim(claim.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition self-start sm:self-auto flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Withdraw Claim</span>
                    </button>
                  )}
                </div>

                <div className="bg-[#182338] p-4 rounded-xl text-xs space-y-2 border border-[#2B3850]">
                  <span className="font-semibold text-[#8D82F9] block">Your Proof Description:</span>
                  <p className="text-[#94A3B8]">{claim.proofDescription}</p>

                  {claim.reviewerNotes && (
                    <div className="pt-2 border-t border-[#2B3850] text-[#F1F5F9]">
                      <strong>Reviewer Feedback:</strong> &ldquo;{claim.reviewerNotes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Review Modal */}
      {selectedClaim && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Evaluate Claim on "${selectedClaim.itemTitle}"`}
        >
          <div className="space-y-4 text-[#F1F5F9]">
            {reviewError && (
              <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium">
                {reviewError}
              </div>
            )}

            <div className="p-3.5 bg-[#182338] rounded-xl border border-[#2B3850] text-xs space-y-2">
              <div>
                <span className="font-bold text-[#8D82F9]">Claimant:</span> {selectedClaim.claimantName}
              </div>
              <div>
                <span className="font-bold text-[#8D82F9]">Proof Provided:</span>
                <p className="mt-1 text-[#F1F5F9] whitespace-pre-line">{selectedClaim.proofDescription}</p>
              </div>
              {selectedClaim.secretIdentifiers && (
                <div className="pt-2 border-t border-[#2B3850] text-indigo-300 font-semibold">
                  Secret Identifier: {selectedClaim.secretIdentifiers}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Review Decision Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Provide notes or coordinate pickup instructions..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-xs text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Approving this claim marks the item as permanently RESOLVED and closes other pending claims.
              </span>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={processingReview}
                onClick={() => handleReviewDecision(false)}
                className="py-2.5 px-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Claim</span>
              </button>

              <button
                type="button"
                disabled={processingReview}
                onClick={() => handleReviewDecision(true)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Claim</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
