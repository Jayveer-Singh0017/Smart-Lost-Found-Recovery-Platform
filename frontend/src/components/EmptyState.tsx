import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#121A2B] rounded-xl border border-[#2B3850] shadow-card my-6">
      <div className="w-14 h-14 rounded-full bg-[#182338] border border-[#2B3850] flex items-center justify-center text-[#94A3B8] mb-4">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-semibold text-[#F1F5F9] mb-1">{title}</h3>
      <p className="text-sm text-[#94A3B8] max-w-md mb-6">{description}</p>
      {actionText && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] rounded-xl transition shadow-md shadow-[#6D5EF7]/25"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] rounded-xl transition shadow-md shadow-[#6D5EF7]/25 cursor-pointer"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
