import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';
import { CategoryDto } from '../types';
import { AlertCircle, Upload, ArrowLeft, ArrowRight } from 'lucide-react';

const foundSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  distinguishingCharacteristics: z.string().optional(),
  city: z.string().min(2, 'City is required').max(100),
  locationAddress: z.string().min(3, 'Location address is required').max(255),
  incidentDate: z.string().min(1, 'Date found is required'),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
});

type FoundFormData = z.infer<typeof foundSchema>;

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    categoryService.getActiveCategories().then(setCategories).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FoundFormData>({
    resolver: zodResolver(foundSchema),
    defaultValues: {
      incidentDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FoundFormData) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload = {
        ...data,
        type: 'FOUND',
      };

      const createdItem = await itemService.createReport(payload);

      if (selectedFile) {
        try {
          await itemService.uploadImage(createdItem.id, selectedFile);
        } catch {
          // non-blocking
        }
      }

      navigate(`/items/${createdItem.id}/matches`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit report. Please review your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-[#F1F5F9]">
      <Link
        to="/search"
        className="inline-flex items-center text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition gap-1 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel and return
      </Link>

      <div className="bg-[#121A2B] p-8 sm:p-10 rounded-2xl border border-[#2B3850] shadow-card">
        <div className="mb-8 pb-6 border-b border-[#2B3850]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]"></span>
            Found Item Registration
          </div>
          <h1 className="text-2xl font-extrabold text-[#F1F5F9] tracking-tight">Report a Found Belonging</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Help reconnect lost items with their rightful owners by providing location and physical characteristics.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Set of car & house keys on blue climbing carabiner"
              {...register('title')}
              className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] text-[#F1F5F9]"
              >
                <option value="" className="bg-[#182338]">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#182338]">
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-rose-400">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
                Date Found *
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('incidentDate')}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] text-[#F1F5F9]"
              />
              {errors.incidentDate && <p className="mt-1 text-xs text-rose-400">{errors.incidentDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
                City / Municipality *
              </label>
              <input
                type="text"
                placeholder="e.g. Bellevue"
                {...register('city')}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
              {errors.city && <p className="mt-1 text-xs text-rose-400">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
                Location Found *
              </label>
              <input
                type="text"
                placeholder="e.g. Bellevue Downtown Park, bench near fountain"
                {...register('locationAddress')}
                className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
              {errors.locationAddress && <p className="mt-1 text-xs text-rose-400">{errors.locationAddress.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe color, general condition, where it was discovered, and safekeeping location..."
              {...register('description')}
              className="w-full p-3.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
              Distinguishing Characteristics (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Noticeable markings, keychains, stickers, or distinctive attributes..."
              {...register('distinguishingCharacteristics')}
              className="w-full p-3.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5">
              Found Item Photo (Recommended)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-3 bg-[#182338] border border-dashed border-[#2B3850] hover:border-[#2DD4BF] rounded-xl cursor-pointer text-xs font-semibold text-[#F1F5F9] transition">
                <Upload className="w-4 h-4 text-[#2DD4BF]" />
                <span>{selectedFile ? selectedFile.name : 'Choose Image File (JPG, PNG, WebP)'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {filePreview && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#2B3850]">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2B3850] flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Stored in dedicated MySQL database.</span>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#2DD4BF] hover:bg-[#26bba7] text-[#0B1020] font-bold rounded-xl text-sm transition shadow-md shadow-[#2DD4BF]/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Publish Found Item &amp; Check Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
