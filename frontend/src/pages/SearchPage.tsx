import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';
import { ItemSummaryResponse, CategoryDto } from '../types';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { Search, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [type, setType] = useState<string>(searchParams.get('type') || '');
  const [categoryId, setCategoryId] = useState<string>(searchParams.get('categoryId') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [page, setPage] = useState(0);

  const [items, setItems] = useState<ItemSummaryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load categories once
  useEffect(() => {
    categoryService.getActiveCategories().then(setCategories).catch(() => {});
  }, []);

  // Fetch search results whenever filters change
  const fetchResults = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: 12,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (type) params.type = type;
      if (categoryId) params.categoryId = categoryId;
      if (city.trim()) params.city = city.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const paged = await itemService.searchReports(params);
      setItems(paged.content);
      setTotalPages(paged.totalPages);
      setTotalElements(paged.totalElements);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, type, categoryId, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    const newParams = new URLSearchParams();
    if (keyword.trim()) newParams.set('keyword', keyword.trim());
    if (type) newParams.set('type', type);
    if (categoryId) newParams.set('categoryId', categoryId);
    if (city.trim()) newParams.set('city', city.trim());
    if (startDate) newParams.set('startDate', startDate);
    if (endDate) newParams.set('endDate', endDate);
    setSearchParams(newParams);
    fetchResults();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setType('');
    setCategoryId('');
    setCity('');
    setStartDate('');
    setEndDate('');
    setPage(0);
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [keyword, type, categoryId, city, startDate, endDate].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F1F5F9]">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">Public Item Discovery</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Search and filter lost and found belongings across all registered categories and regions.
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card space-y-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5" />
              <input
                type="text"
                placeholder="Search keywords (e.g. iPhone, wallet, keys)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="md:col-span-3 relative flex items-center">
              <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3.5" />
              <input
                type="text"
                placeholder="Filter by city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#182338] border border-[#2B3850] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7]"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(0);
                }}
                className="w-full py-2.5 px-3 bg-[#182338] border border-[#2B3850] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] text-[#F1F5F9]"
              >
                <option value="" className="bg-[#182338]">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#182338]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white font-semibold rounded-xl text-sm transition shadow-md shadow-[#6D5EF7]/25 cursor-pointer"
              >
                Filter
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="p-2.5 text-[#94A3B8] hover:text-[#F1F5F9] border border-[#2B3850] rounded-xl bg-[#182338] hover:bg-[#202E48] transition cursor-pointer"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Type Toggle & Advanced Date Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#2B3850] text-xs">
            <div className="flex items-center gap-1 bg-[#182338] p-1 rounded-xl border border-[#2B3850]">
              <button
                type="button"
                onClick={() => {
                  setType('');
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  type === '' ? 'bg-[#6D5EF7] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                All Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('LOST');
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  type === 'LOST' ? 'bg-rose-600 text-white shadow-sm' : 'text-[#94A3B8] hover:text-rose-400'
                }`}
              >
                Lost Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('FOUND');
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  type === 'FOUND' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#94A3B8] hover:text-emerald-400'
                }`}
              >
                Found Only
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#94A3B8]">
              <span>Incident Date Between:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-[#182338] border border-[#2B3850] rounded-lg text-xs text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#6D5EF7]"
              />
              <span>and</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-[#182338] border border-[#2B3850] rounded-lg text-xs text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#6D5EF7]"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-[#94A3B8] px-1">
        <span>
          Showing <strong className="text-[#F1F5F9]">{totalElements}</strong> matching reports
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-xs text-[#8D82F9] font-medium">
            {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-[#121A2B] rounded-2xl p-4 border border-[#2B3850] animate-pulse space-y-3">
              <div className="aspect-[16/10] bg-[#182338] rounded-xl"></div>
              <div className="h-4 bg-[#182338] rounded w-3/4"></div>
              <div className="h-3 bg-[#182338] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Matching Reports Found"
          description="Try broadening your search keywords, clearing specific filters, or checking back later as new found items are logged."
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-[#121A2B] border border-[#2B3850] rounded-xl text-sm font-semibold text-[#F1F5F9] hover:bg-[#182338] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-card cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-[#94A3B8] font-medium px-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-[#121A2B] border border-[#2B3850] rounded-xl text-sm font-semibold text-[#F1F5F9] hover:bg-[#182338] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-card cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
