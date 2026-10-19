import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  iconColor = 'text-[#6D5EF7]',
  iconBg = 'bg-[#6D5EF7]/15 border border-[#6D5EF7]/30',
}) => {
  return (
    <div className="bg-[#121A2B] p-6 rounded-2xl border border-[#2B3850] shadow-card hover:border-[#6D5EF7]/50 transition duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#94A3B8]">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-[#F1F5F9]">{value}</div>
      {subtitle && <p className="mt-1 text-xs text-[#94A3B8]">{subtitle}</p>}
    </div>
  );
};
