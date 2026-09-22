import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'red' | 'blue' | 'amber' | 'emerald' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'red'
}) => {
  const colorMap = {
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', iconBg: 'bg-red-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconBg: 'bg-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', iconBg: 'bg-amber-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', iconBg: 'bg-emerald-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', iconBg: 'bg-purple-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', iconBg: 'bg-rose-100' }
  }[color];

  return (
    <div className={`p-5 rounded-2xl bg-white border ${colorMap.border} shadow-sm hover:shadow-md transition-shadow flex items-start justify-between`}>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorMap.iconBg} ${colorMap.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
