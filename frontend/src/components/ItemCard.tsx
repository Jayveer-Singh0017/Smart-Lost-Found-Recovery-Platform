import React from 'react';
import { Link } from 'react-router-dom';
import { ItemSummaryResponse } from '../types';
import { Badge } from './Badge';
import { MapPin, Calendar, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ItemCardProps {
  item: ItemSummaryResponse;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className="group bg-[#121A2B] rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 hover:shadow-glow-indigo transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Image / Header Banner */}
      <div className="relative aspect-[16/10] bg-[#182338] overflow-hidden flex items-center justify-center">
        {item.primaryImageUrl ? (
          <img
            src={item.primaryImageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#94A3B8]">
            <ImageIcon className="w-10 h-10 stroke-[1.5] mb-1 opacity-40 text-slate-400" />
            <span className="text-xs font-medium text-slate-400">{item.categoryName}</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <Badge type={item.type} size="sm" />
          <Badge status={item.status} size="sm" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-[#6D5EF7] uppercase tracking-wider mb-1">
            {item.categoryName}
          </div>
          <Link to={`/items/${item.id}`} className="block">
            <h4 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#8D82F9] transition-colors line-clamp-1">
              {item.title}
            </h4>
          </Link>

          <div className="mt-3 space-y-1.5 text-xs text-[#94A3B8]">
            <div className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{item.city} • {item.locationAddress}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
              <span>Incident: {item.incidentDate}</span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="mt-5 pt-3 border-t border-[#2B3850] flex items-center justify-between gap-2">
          <Link
            to={`/items/${item.id}`}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition py-1"
          >
            View Details →
          </Link>
          <Link
            to={`/items/${item.id}/matches`}
            className="inline-flex items-center text-xs font-semibold text-[#6D5EF7] bg-[#6D5EF7]/15 hover:bg-[#6D5EF7]/25 border border-[#6D5EF7]/30 px-2.5 py-1.5 rounded-lg transition"
            title="Search deterministic match algorithm"
          >
            <Sparkles className="w-3 h-3 mr-1 text-[#6D5EF7]" />
            Check Matches
          </Link>
        </div>
      </div>
    </div>
  );
};
