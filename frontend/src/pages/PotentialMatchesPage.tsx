import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchingService } from '../services/matchingService';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { useAuth } from '../context/AuthContext';
import { MatchResultDto, ItemReportResponse } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  FileCheck2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const PotentialMatchesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sourceItem, setSourceItem] = useState<ItemReportResponse | null>(null);
  const [matches, setMatches] = useState<MatchResultDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Claim modal on a candidate
  const [selectedCandidate, setSelectedCandidate] = useState<MatchResultDto | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [proofDescription, setProofDescription] = useState('');
  const [secretIdentifiers, setSecretIdentifiers] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [itemData, matchData] = await Promise.all([
          itemService.getReportById(Number(id)),
          matchingService.getMatchesForItem(Number(id)),
        ]);
        setSourceItem(itemData);
        setMatches(matchData);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [id]);

  const handleOpenClaimModal = (candidate: MatchResultDto) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedCandidate(candidate);
    setProofDescription('');
    setSecretIdentifiers('');
    setClaimPhone('');
    setClaimSuccess(false);
    setClaimError(null);
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    try {
      setSubmittingClaim(true);
      setClaimError(null);
      await claimService.submitClaim({
        itemReportId: selectedCandidate.matchedItem.id,
        proofDescription,
        secretIdentifiers: secretIdentifiers.trim() || undefined,
        contactPhone: claimPhone.trim() || undefined,
      });
      setClaimSuccess(true);
      setTimeout(() => {
        setClaimModalOpen(false);
        setClaimSuccess(false);
      }, 2000);
    } catch (err: any) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim on this candidate.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#2DD4BF] bg-[#2DD4BF]/15 border-[#2DD4BF]/30';
    if (score >= 60) return 'text-[#8D82F9] bg-[#6D5EF7]/15 border-[#6D5EF7]/30';
    return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-[#F1F5F9]">
        <div className="w-12 h-12 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        <h3 className="text-base font-bold mt-4">Running Deterministic Matching Engine...</h3>
        <p className="text-xs text-[#94A3B8] mt-1">Comparing categories, keywords, coordinates, and dates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      {/* Back button */}
      <Link
        to={sourceItem ? `/items/${sourceItem.id}` : '/search'}
        className="inline-flex items-center text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition gap-1 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to item details
      </Link>

      {/* Source Item Context Banner */}
      {sourceItem && (
        <div className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge type={sourceItem.type} size="sm" />
              <span className="text-xs font-bold text-[#8D82F9] uppercase tracking-wider">
                {sourceItem.categoryName}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#F1F5F9]">{sourceItem.title}</h2>
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <span>{sourceItem.city} • {sourceItem.locationAddress}</span>
              <span>•</span>
              <span>Incident: {sourceItem.incidentDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#182338] text-[#94A3B8] border border-[#2B3850]">
              Searching opposite {sourceItem.type === 'LOST' ? 'FOUND' : 'LOST'} listings
            </span>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6D5EF7]" />
            <h1 className="text-2xl font-extrabold text-[#F1F5F9] tracking-tight">
              Potential Matches ({matches.length})
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Ranked by multi-factor deterministic scoring (0 - 100)
          </p>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="p-4 rounded-xl bg-[#6D5EF7]/10 border border-[#6D5EF7]/30 text-[#8D82F9] text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#6D5EF7] mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-[#F1F5F9]">Verification Notice:</strong> Algorithmic scores calculate mathematical text and coordinate proximity.
          They do not prove ownership. Formal claim submission and human verification are required before recovery is granted.
        </div>
      </div>

      {/* Candidate Matches List */}
      {matches.length === 0 ? (
        <div className="bg-[#121A2B] p-12 rounded-2xl border border-[#2B3850] text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-500 mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#F1F5F9]">No High-Confidence Matches Found Yet</h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Our background matching engine will automatically generate an in-app alert when a new compatible listing is posted by another user.
          </p>
          <div className="pt-2">
            <Link
              to="/search"
              className="inline-flex px-4 py-2 text-xs font-semibold text-[#8D82F9] bg-[#6D5EF7]/15 hover:bg-[#6D5EF7]/25 border border-[#6D5EF7]/30 rounded-xl transition"
            >
              Browse all items manually
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, idx) => (
            <div
              key={match.matchedItem.id}
              className="bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/40 transition duration-200 p-6 space-y-5"
            >
              {/* Header: Score + Candidate Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Photo or placeholder */}
                  <div className="w-20 h-20 rounded-xl bg-[#182338] overflow-hidden flex-shrink-0 border border-[#2B3850]">
                    {match.matchedItem.primaryImageUrl ? (
                      <img
                        src={match.matchedItem.primaryImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <FileCheck2 className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500">Rank #{idx + 1}</span>
                      <Badge type={match.matchedItem.type} size="sm" />
                      <span className="text-xs font-bold text-[#8D82F9] uppercase tracking-wider">
                        {match.matchedItem.categoryName}
                      </span>
                    </div>
                    <Link
                      to={`/items/${match.matchedItem.id}`}
                      className="text-lg font-bold text-[#F1F5F9] hover:text-[#8D82F9] transition"
                    >
                      {match.matchedItem.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{match.matchedItem.city} • {match.matchedItem.locationAddress}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>Incident: {match.matchedItem.incidentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 flex-shrink-0">
                  <div className={`px-4 py-2 rounded-2xl border font-extrabold text-base flex items-center gap-1.5 shadow-sm ${getScoreColor(match.score)}`}>
                    <Sparkles className="w-4 h-4" />
                    <span>{match.score}% Match</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Confidence Score</span>
                </div>
              </div>

              {/* Score Factor Breakdown Progress Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#182338] rounded-xl border border-[#2B3850] text-xs">
                <div>
                  <div className="flex justify-between text-[#94A3B8] font-semibold mb-1">
                    <span>Category</span>
                    <span className="text-[#F1F5F9]">{match.explanation.categoryScore}/35</span>
                  </div>
                  <div className="h-1.5 bg-[#121A2B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6D5EF7]"
                      style={{ width: `${(match.explanation.categoryScore / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#94A3B8] font-semibold mb-1">
                    <span>Keyword Overlap</span>
                    <span className="text-[#F1F5F9]">{match.explanation.textScore}/30</span>
                  </div>
                  <div className="h-1.5 bg-[#121A2B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8D82F9]"
                      style={{ width: `${(match.explanation.textScore / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#94A3B8] font-semibold mb-1">
                    <span>Location Proximity</span>
                    <span className="text-[#F1F5F9]">{match.explanation.locationScore}/20</span>
                  </div>
                  <div className="h-1.5 bg-[#121A2B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2DD4BF]"
                      style={{ width: `${(match.explanation.locationScore / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#94A3B8] font-semibold mb-1">
                    <span>Date Proximity</span>
                    <span className="text-[#F1F5F9]">{match.explanation.dateProximityScore}/15</span>
                  </div>
                  <div className="h-1.5 bg-[#121A2B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(match.explanation.dateProximityScore / 15) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Explanatory Reasons List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#8D82F9] uppercase tracking-wider block mb-2">
                  Match Justifications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {match.explanation.matchReasons.map((reason, i) => (
                    <div key={i} className="flex items-center text-xs text-[#F1F5F9] gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#2B3850] flex items-center justify-between gap-3">
                <Link
                  to={`/items/${match.matchedItem.id}`}
                  className="text-xs font-semibold text-[#8D82F9] hover:text-[#A79FFB] transition flex items-center gap-1"
                >
                  Inspect Candidate Report <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {match.matchedItem.type === 'FOUND' && (
                  <button
                    onClick={() => handleOpenClaimModal(match)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Claim This Found Item</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal on Candidate */}
      {selectedCandidate && (
        <Modal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          title={`Submit Claim on "${selectedCandidate.matchedItem.title}"`}
        >
          {claimSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-[#F1F5F9]">Claim Submitted!</h4>
              <p className="text-xs text-[#94A3B8]">
                The finder has been alerted and will review your ownership details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleClaimSubmit} className="space-y-4 text-[#F1F5F9]">
              {claimError && (
                <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium">
                  {claimError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Proof of Ownership *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail purchase history, unique markings, or loss context..."
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  className="w-full p-3 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Secret Identifier (Confidential)
                </label>
                <input
                  type="text"
                  placeholder="Lockscreen passcode pattern, serial number, engraved initials..."
                  value={secretIdentifiers}
                  onChange={(e) => setSecretIdentifiers(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="flex-1 py-2 bg-[#182338] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim || proofDescription.length < 10}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/25"
                >
                  {submittingClaim ? 'Submitting...' : 'Confirm Claim'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
