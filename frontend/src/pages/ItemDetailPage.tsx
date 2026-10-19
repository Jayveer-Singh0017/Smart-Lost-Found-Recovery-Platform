import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { ItemReportResponse, CategoryDto } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Upload,
  User,
  ArrowLeft,
  Mail,
  Phone,
  FileCheck2,
  Trash2,
  CheckCircle,
  Edit3,
  X,
} from 'lucide-react';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [item, setItem] = useState<ItemReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Claim Modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [proofDescription, setProofDescription] = useState('');
  const [secretIdentifiers, setSecretIdentifiers] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Flag Modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Suspicious listing');
  const [flagDetails, setFlagDetails] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');
  const [editDistinguishingCharacteristics, setEditDistinguishingCharacteristics] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editLocationAddress, setEditLocationAddress] = useState('');
  const [editIncidentDate, setEditIncidentDate] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    categoryService.getActiveCategories().then(setCategories).catch(() => {});
  }, []);

  const openEditModal = () => {
    if (!item) return;
    setEditTitle(item.title);
    setEditCategoryId(item.categoryId);
    setEditDescription(item.description);
    setEditDistinguishingCharacteristics(item.distinguishingCharacteristics || '');
    setEditCity(item.city);
    setEditLocationAddress(item.locationAddress);
    setEditIncidentDate(item.incidentDate);
    setEditContactEmail(item.contactEmail || '');
    setEditContactPhone(item.contactPhone || '');
    setEditError(null);
    setEditSuccess(false);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      setEditSubmitting(true);
      setEditError(null);
      await itemService.updateReport(item.id, {
        title: editTitle.trim(),
        categoryId: editCategoryId,
        description: editDescription.trim(),
        distinguishingCharacteristics: editDistinguishingCharacteristics.trim() || undefined,
        city: editCity.trim(),
        locationAddress: editLocationAddress.trim(),
        incidentDate: editIncidentDate,
        contactEmail: editContactEmail.trim() || undefined,
        contactPhone: editContactPhone.trim() || undefined,
      });
      setEditSuccess(true);
      await fetchItem();
      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess(false);
      }, 1500);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update report. Please verify all inputs.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchItem = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await itemService.getReportById(Number(id));
      setItem(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0].imageUrl);
      }
    } catch {
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      setClaimSubmitting(true);
      setClaimError(null);
      await claimService.submitClaim({
        itemReportId: item.id,
        proofDescription: proofDescription.trim(),
        secretIdentifiers: secretIdentifiers.trim() || undefined,
        contactPhone: claimPhone.trim() || undefined,
      });
      setClaimSuccess(true);
      fetchItem();
    } catch (err: any) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim. Ensure all details are valid.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!item || !window.confirm('Are you sure you want to withdraw this listing? This action cannot be undone.')) {
      return;
    }
    try {
      await itemService.withdrawReport(item.id);
      fetchItem();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw report');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!item || !window.confirm('Delete this photo?')) return;
    try {
      setDeletingImageId(imageId);
      await itemService.deleteImage(item.id, imageId);
      await fetchItem();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await itemService.flagReport(item.id, flagReason, flagDetails);
      setFlagSubmitted(true);
      setTimeout(() => {
        setFlagModalOpen(false);
        setFlagSubmitted(false);
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to flag report');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!item || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setUploadingImage(true);
      await itemService.uploadImage(item.id, file);
      await fetchItem();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        <p className="text-[#94A3B8] text-sm mt-4">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#F1F5F9]">
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <p className="text-[#94A3B8] text-sm mb-6">The requested item report does not exist or has been removed.</p>
        <Link to="/search" className="px-4 py-2 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white rounded-xl text-sm font-semibold transition">
          Return to Search
        </Link>
      </div>
    );
  }

  const isOwner = item.owner;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition gap-1 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      {/* Main Grid: Images + Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Showcase */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] bg-[#121A2B] rounded-2xl overflow-hidden border border-[#2B3850] shadow-card flex items-center justify-center">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-slate-500 p-6">
                <FileCheck2 className="w-12 h-12 stroke-[1.5] mx-auto mb-2 opacity-50" />
                <span className="text-xs font-medium text-[#94A3B8]">No photos uploaded for this report</span>
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge type={item.type} />
              <Badge status={item.status} />
            </div>
          </div>

          {/* Image Thumbnails */}
          {item.images && item.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.images.map((img) => (
                <div key={img.id} className="relative group flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition block cursor-pointer ${
                      selectedImage === img.imageUrl ? 'border-[#6D5EF7] ring-2 ring-[#6D5EF7]/30' : 'border-[#2B3850]'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                  {isOwner && item.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id);
                      }}
                      disabled={deletingImageId === img.id}
                      title="Delete photo"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition shadow-sm hover:bg-rose-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Owner Photo Upload */}
          {isOwner && item.status !== 'RESOLVED' && (
            <div className="pt-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F1F5F9] bg-[#121A2B] border border-[#2B3850] hover:bg-[#182338] cursor-pointer shadow-sm transition">
                <Upload className="w-3.5 h-3.5 text-[#6D5EF7]" />
                <span>{uploadingImage ? 'Uploading...' : 'Attach Additional Photo'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Column: Key Details & Actions */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8D82F9]">
              {item.categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight mt-1">
              {item.title}
            </h1>
          </div>

          {/* Meta Info Badges */}
          <div className="bg-[#121A2B] p-5 rounded-2xl border border-[#2B3850] shadow-card space-y-3">
            <div className="flex items-center text-sm text-[#F1F5F9]">
              <MapPin className="w-4 h-4 text-[#94A3B8] mr-2 flex-shrink-0" />
              <span>
                <strong className="text-[#F1F5F9]">{item.city}</strong> • <span className="text-[#94A3B8]">{item.locationAddress}</span>
              </span>
            </div>

            <div className="flex items-center text-sm text-[#F1F5F9]">
              <Calendar className="w-4 h-4 text-[#94A3B8] mr-2 flex-shrink-0" />
              <span>Incident Date: <strong className="text-[#F1F5F9]">{item.incidentDate}</strong></span>
            </div>

            <div className="flex items-center text-sm text-[#F1F5F9]">
              <User className="w-4 h-4 text-[#94A3B8] mr-2 flex-shrink-0" />
              <span>Reported by: <strong className="text-[#F1F5F9]">{item.reporterName}</strong></span>
            </div>

            {/* Revealed contact details for owner/authorized viewer */}
            {isOwner && (
              <div className="pt-3 border-t border-[#2B3850] text-xs space-y-1 text-[#94A3B8]">
                <div className="font-semibold text-[#F1F5F9] mb-1">Your Registered Contact (Private):</div>
                {item.contactEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#94A3B8]" /> {item.contactEmail}
                  </div>
                )}
                {item.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#94A3B8]" /> {item.contactPhone}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/items/${item.id}/matches`}
              className="flex-1 min-w-[180px] py-3 px-4 bg-gradient-to-r from-[#6D5EF7] to-[#4F46E5] hover:from-[#5B4CE6] hover:to-[#4338CA] text-white font-semibold rounded-xl text-sm transition shadow-md shadow-[#6D5EF7]/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Matching Engine</span>
            </Link>

            {/* Non-owner actions */}
            {!isOwner && item.status !== 'RESOLVED' && item.status !== 'WITHDRAWN' && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setClaimModalOpen(true);
                  }
                }}
                className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            )}

            {/* Owner Actions */}
            {isOwner && item.status !== 'RESOLVED' && item.status !== 'WITHDRAWN' && (
              <>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="py-3 px-4 text-[#8D82F9] bg-[#6D5EF7]/15 hover:bg-[#6D5EF7]/25 border border-[#6D5EF7]/30 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Listing</span>
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="py-3 px-4 text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Withdraw</span>
                </button>
              </>
            )}

            {isOwner && (
              <Link
                to="/claims"
                className="py-3 px-4 text-[#F1F5F9] bg-[#182338] hover:bg-[#202E48] border border-[#2B3850] rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#6D5EF7]" />
                <span>Claims</span>
              </Link>
            )}

            {/* Flag button */}
            {!isOwner && (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setFlagModalOpen(true);
                }}
                className="p-3 text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl border border-[#2B3850] bg-[#121A2B] hover:bg-[#182338] transition cursor-pointer"
                title="Flag listing as suspicious"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description & Characteristics Section */}
      <div className="bg-[#121A2B] p-8 rounded-2xl border border-[#2B3850] shadow-card space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#F1F5F9] mb-2">Description</h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line">{item.description}</p>
        </div>

        {item.distinguishingCharacteristics && (
          <div className="pt-4 border-t border-[#2B3850]">
            <h3 className="text-base font-bold text-[#F1F5F9] mb-2">Distinguishing Characteristics</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line">
              {item.distinguishingCharacteristics}
            </p>
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      <Modal isOpen={claimModalOpen} onClose={() => setClaimModalOpen(false)} title="Submit Ownership Claim">
        {claimSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-[#F1F5F9]">Claim Submitted Successfully!</h4>
            <p className="text-xs text-[#94A3B8]">
              The poster has been notified. You can track this under My Claims in your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-[#94A3B8]">
              Provide verifiable proof that proves you own this item. The poster and administrators will evaluate these details before granting recovery.
            </p>

            {claimError && (
              <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium">
                {claimError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Proof Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain where you purchased it, how you lost it, contents, or unique physical marks..."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                className="w-full p-3 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Secret Identifiers (Private to Owner &amp; Admin)
              </label>
              <input
                type="text"
                placeholder="Serial number fragment, lockscreen image description, engravings..."
                value={secretIdentifiers}
                onChange={(e) => setSecretIdentifiers(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This verification detail is never shown to other users.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Contact Phone for Handoff (Optional)
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={claimPhone}
                onChange={(e) => setClaimPhone(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="flex-1 py-2.5 bg-[#182338] hover:bg-[#202E48] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={claimSubmitting || proofDescription.length < 10}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/25"
              >
                {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Flag Report Modal */}
      <Modal isOpen={flagModalOpen} onClose={() => setFlagModalOpen(false)} title="Report Listing">
        {flagSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-[#F1F5F9]">Report Received</h4>
            <p className="text-xs text-[#94A3B8]">Our moderators will review this listing shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleFlagSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Reason</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9]"
              >
                <option value="Suspicious listing" className="bg-[#182338]">Suspicious listing or fraudulent claim</option>
                <option value="Inappropriate content" className="bg-[#182338]">Inappropriate or prohibited content</option>
                <option value="Spam or duplicate" className="bg-[#182338]">Spam or duplicate posting</option>
                <option value="Incorrect information" className="bg-[#182338]">Misleading location or information</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Details (Optional)</label>
              <textarea
                rows={3}
                placeholder="Describe why this listing violates platform safety..."
                value={flagDetails}
                onChange={(e) => setFlagDetails(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                className="flex-1 py-2 bg-[#182338] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-rose-600/25"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Listing Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Item Report">
        {editSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-[#F1F5F9]">Listing Updated Successfully!</h4>
            <p className="text-xs text-[#94A3B8]">Your changes have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {editError && (
              <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium">
                {editError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={150}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  required
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] text-[#F1F5F9]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#182338]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Incident Date *
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={editIncidentDate}
                  onChange={(e) => setEditIncidentDate(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Location Address *
                </label>
                <input
                  type="text"
                  required
                  value={editLocationAddress}
                  onChange={(e) => setEditLocationAddress(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                required
                minLength={10}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                Distinguishing Characteristics (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Serial numbers, custom stickers, scratches, wallpapers..."
                value={editDistinguishingCharacteristics}
                onChange={(e) => setEditDistinguishingCharacteristics(e.target.value)}
                className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={editContactEmail}
                  onChange={(e) => setEditContactEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 py-2.5 bg-[#182338] hover:bg-[#202E48] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSubmitting || editTitle.length < 3 || editDescription.length < 10}
                className="flex-1 py-2.5 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#6D5EF7]/25"
              >
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
