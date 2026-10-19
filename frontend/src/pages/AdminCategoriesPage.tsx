import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { CategoryDto } from '../types';
import { Modal } from '../components/Modal';
import { ArrowLeft, Plus } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // New category modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Package');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategoriesAdmin();
      setCategories(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await categoryService.createCategory({ name, description, icon });
      setModalOpen(false);
      setName('');
      setDescription('');
      setIcon('Package');
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await categoryService.toggleCategory(id);
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle category');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to admin dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">Category Taxonomy</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Configure item categorization tags and icon mappings.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#6D5EF7]/25 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#2B3850] border-t-[#6D5EF7] rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-[#121A2B] p-5 rounded-2xl border border-[#2B3850] shadow-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">ID #{c.id}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      c.active
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#182338] text-[#94A3B8] border border-[#2B3850]'
                    }`}
                  >
                    {c.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9]">{c.name}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">{c.description || 'No description provided'}</p>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">Icon: {c.icon || 'Package'}</div>
              </div>

              <div className="pt-3 border-t border-[#2B3850] flex justify-end">
                <button
                  onClick={() => handleToggle(c.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    c.active
                      ? 'text-rose-300 hover:bg-rose-500/15'
                      : 'text-emerald-300 hover:bg-emerald-500/15'
                  }`}
                >
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreate} className="space-y-4 text-[#F1F5F9]">
          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sporting Goods"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe types of items included in this taxonomy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1">
              Lucide Icon Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. Package, Smartphone, Watch, Key"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 bg-[#182338] hover:bg-[#202E48] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 py-2.5 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#6D5EF7]/25"
            >
              {saving ? 'Creating...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
