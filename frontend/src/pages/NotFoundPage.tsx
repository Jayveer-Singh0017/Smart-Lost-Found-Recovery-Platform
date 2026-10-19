import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center text-[#F1F5F9]">
      <div className="w-16 h-16 rounded-2xl bg-[#121A2B] border border-[#2B3850] text-[#8D82F9] flex items-center justify-center mb-6 shadow-card">
        <FileQuestion className="w-8 h-8 stroke-[2]" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#F1F5F9] tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-[#94A3B8] max-w-md">
        The page or item you are looking for does not exist or may have been relocated.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="px-4 py-2 text-xs font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] rounded-xl transition shadow-md shadow-[#6D5EF7]/25 flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
        <Link
          to="/search"
          className="px-4 py-2 text-xs font-semibold text-[#F1F5F9] bg-[#182338] border border-[#2B3850] rounded-xl hover:bg-[#202E48] transition"
        >
          Search Items
        </Link>
      </div>
    </div>
  );
};
