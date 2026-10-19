import React from 'react';
import { ItemType, ItemStatus, ClaimStatus } from '../types';

interface BadgeProps {
  type?: ItemType;
  status?: ItemStatus | ClaimStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  if (type) {
    if (type === 'LOST') {
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold tracking-wide ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse"></span>
          LOST
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold tracking-wide ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1.5"></span>
        FOUND
      </span>
    );
  }

  if (status) {
    switch (status) {
      case 'OPEN':
        return (
          <span className={`inline-flex items-center rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium ${sizeClasses}`}>
            OPEN
          </span>
        );
      case 'CLAIM_PENDING':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium ${sizeClasses}`}>
            CLAIM PENDING
          </span>
        );
      case 'RESOLVED':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium ${sizeClasses}`}>
            RESOLVED / RECOVERED
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-700/40 text-slate-400 border border-slate-600/40 font-medium ${sizeClasses}`}>
            WITHDRAWN
          </span>
        );
      case 'PENDING':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium ${sizeClasses}`}>
            PENDING REVIEW
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium ${sizeClasses}`}>
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium ${sizeClasses}`}>
            REJECTED
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-[#2B3850] font-medium ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  return null;
};
