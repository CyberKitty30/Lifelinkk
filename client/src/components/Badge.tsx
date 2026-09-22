import React from 'react';

interface BadgeProps {
  type?: 'blood' | 'status' | 'urgency' | 'component';
  value: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type = 'status', value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-xs font-bold';

  if (type === 'blood') {
    return (
      <span className={`inline-flex items-center rounded-md bg-red-100 text-red-800 border border-red-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
        {value}
      </span>
    );
  }

  if (type === 'urgency') {
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (value === 'Emergency') {
      colorClass = 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-sm';
    } else if (value === 'Urgent') {
      colorClass = 'bg-amber-500 text-white border-amber-600';
    } else {
      colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return <span className={`inline-flex items-center rounded-md border ${colorClass} ${sizeClasses}`}>{value}</span>;
  }

  if (type === 'component') {
    let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    if (value === 'Platelets') colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    if (value === 'Plasma') colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    if (value === 'RBC') colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    return <span className={`inline-flex items-center rounded-md border ${colorClass} ${sizeClasses}`}>{value}</span>;
  }

  // Status badges
  let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
  switch (value) {
    case 'Available':
    case 'Eligible':
    case 'Passed':
    case 'Completed':
    case 'Fulfilled':
    case 'Approved':
      statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Pending':
    case 'Partially Fulfilled':
    case 'Reserved':
      statusClass = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Expired':
    case 'Discarded':
    case 'Rejected':
    case 'Ineligible':
    case 'Failed':
    case 'Cancelled':
      statusClass = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'Issued':
      statusClass = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-md border ${statusClass} ${sizeClasses}`}>
      {value}
    </span>
  );
};
