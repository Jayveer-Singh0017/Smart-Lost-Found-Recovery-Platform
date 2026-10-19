import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Lock,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';
import { ItemSummaryResponse, CategoryDto } from '../types';
import { ItemCard } from '../components/ItemCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recentItems, setRecentItems] = useState<ItemSummaryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [items, cats] = await Promise.all([
          itemService.getRecentItems(),
          categoryService.getActiveCategories(),
        ]);
        setRecentItems(items);
        setCategories(cats);
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (city.trim()) params.append('city', city.trim());
    if (categoryId) params.append('categoryId', categoryId);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-16 bg-[#0B1020] text-[#F1F5F9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-[#121A2B] via-[#0B1020] to-[#0B1020] border-b border-[#2B3850]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6D5EF7]/15 border border-[#6D5EF7]/30 text-[#8D82F9] text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#6D5EF7]" />
            <span>Deterministic Multi-Factor Recovery Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#F1F5F9] tracking-tight max-w-4xl mx-auto leading-tight md:leading-[1.15]">
            Lost Something Valuable?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5EF7] via-[#8D82F9] to-[#2DD4BF]">
              Recover It With Proof.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            A secure lost and found platform matching lost belongings with found reports through deterministic keyword similarity, date proximity, and verified ownership claims.
          </p>

          {/* Quick Search Entry Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-4xl mx-auto bg-[#121A2B] p-3 rounded-2xl shadow-2xl border border-[#2B3850] grid grid-cols-1 md:grid-cols-12 gap-3 text-left"
          >
            <div className="md:col-span-5 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="What did you lose or find? (e.g. iPhone, wallet)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#182338] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] border border-[#2B3850]"
              />
            </div>

            <div className="md:col-span-3 relative flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="City or area (e.g. Seattle)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#182338] rounded-xl text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] border border-[#2B3850]"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full py-3 px-3 bg-[#182338] rounded-xl text-sm text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#6D5EF7] border border-[#2B3850]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#182338] text-[#F1F5F9]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full h-full py-3 px-4 bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white font-semibold rounded-xl transition shadow-md shadow-[#6D5EF7]/25 text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
            <Link
              to="/report-lost"
              className="px-6 py-3 rounded-xl text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition shadow-sm"
            >
              Report a Lost Belonging
            </Link>
            <Link
              to="/report-found"
              className="px-6 py-3 rounded-xl text-[#2DD4BF] bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 border border-[#2DD4BF]/30 transition shadow-sm"
            >
              Report a Found Item
            </Link>
            <Link
              to="/search"
              className="px-6 py-3 rounded-xl text-[#F1F5F9] bg-[#182338] hover:bg-[#1F2C45] border border-[#2B3850] transition shadow-sm"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-[#6D5EF7] mb-2">
            Why Smart Lost &amp; Found
          </h2>
          <h3 className="text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
            Engineered for Security, Privacy, and Accuracy
          </h3>
          <p className="mt-3 text-[#94A3B8] text-sm leading-relaxed">
            Unlike informal social forums, our platform features verified proof protocols, deterministic matching algorithms, and automated audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#121A2B] p-8 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 transition duration-200">
            <div className="w-12 h-12 rounded-xl bg-[#6D5EF7]/15 border border-[#6D5EF7]/30 text-[#6D5EF7] flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Deterministic Match Engine</h4>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Calculates objective similarity scores (0-100) across category compatibility, token-level text overlap, date proximity, and city coordinates.
            </p>
          </div>

          <div className="bg-[#121A2B] p-8 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#2DD4BF]/50 transition duration-200">
            <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Verified Claim Protocol</h4>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Prevents fraudulent pickups. Claimants must provide secret identifiers and proof description before the owner or moderator approves handoff.
            </p>
          </div>

          <div className="bg-[#121A2B] p-8 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 transition duration-200">
            <div className="w-12 h-12 rounded-xl bg-[#6D5EF7]/15 border border-[#6D5EF7]/30 text-[#8D82F9] flex items-center justify-center mb-5">
              <Lock className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Zero Public Contact Exposure</h4>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Personal emails and phone numbers are never exposed on public listing cards. Communication is shielded until a valid claim is approved.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#121A2B] text-white py-20 border-y border-[#2B3850]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#6D5EF7] tracking-widest uppercase">Simple 4-Step Recovery</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-[#F1F5F9]">How The Platform Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-2xl bg-[#182338] border border-[#2B3850]">
              <div className="text-4xl font-extrabold text-[#6D5EF7]/30 mb-3">01</div>
              <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Report the Belonging</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Post detailed lost or found information with location, incident date, category, and optional photos.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-[#182338] border border-[#2B3850]">
              <div className="text-4xl font-extrabold text-[#6D5EF7]/30 mb-3">02</div>
              <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Automated Matching</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Our algorithm scores candidates and alerts users when high-confidence matches are discovered.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-[#182338] border border-[#2B3850]">
              <div className="text-4xl font-extrabold text-[#6D5EF7]/30 mb-3">03</div>
              <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Submit Ownership Claim</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                The true owner submits private verification details (serials, engravings, wallpapers) that only they know.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-[#182338] border border-[#2B3850]">
              <div className="text-4xl font-extrabold text-[#6D5EF7]/30 mb-3">04</div>
              <h4 className="text-lg font-bold text-[#F1F5F9] mb-2">Verified Handoff</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Upon owner approval, the item transitions to Resolved, and direct contact details are securely shared.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Reported Items Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#F1F5F9] tracking-tight">Recently Reported Belongings</h2>
            <p className="text-xs text-[#94A3B8] mt-1">Live listings from the MySQL database</p>
          </div>
          <Link
            to="/search"
            className="text-sm font-semibold text-[#6D5EF7] hover:text-[#8D82F9] flex items-center gap-1 transition"
          >
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#121A2B] rounded-2xl p-4 border border-[#2B3850] animate-pulse space-y-3">
                <div className="aspect-[16/10] bg-[#182338] rounded-xl"></div>
                <div className="h-4 bg-[#182338] rounded w-3/4"></div>
                <div className="h-3 bg-[#182338] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#121A2B] rounded-2xl border border-[#2B3850]">
            <p className="text-[#94A3B8] text-sm">No items reported yet. Be the first to report!</p>
          </div>
        )}
      </section>
    </div>
  );
};
