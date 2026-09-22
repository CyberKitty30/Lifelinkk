import React from 'react';
import { StockSummaryItem } from '../types';
import { Badge } from './Badge';

interface StockTableProps {
  data: StockSummaryItem[];
}

export const StockTable: React.FC<StockTableProps> = ({ data }) => {
  const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  // Merge response data with missing groups if any
  const fullDataMap = new Map<string, StockSummaryItem>();
  data.forEach((item) => fullDataMap.set(item.blood_group, item));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Blood Group Inventory Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live aggregated count across all 8 ABO / Rh blood groups</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-lg border border-red-200">
          8 Standard Groups
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-6">Blood Group</th>
              <th className="py-3 px-6">Available Units</th>
              <th className="py-3 px-6">Reserved Units</th>
              <th className="py-3 px-6">Issued Units</th>
              <th className="py-3 px-6">Expired Units</th>
              <th className="py-3 px-6 text-right">Inventory Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allGroups.map((bg) => {
              const item = fullDataMap.get(bg as any) || {
                blood_group: bg as any,
                available_units: 0,
                reserved_units: 0,
                issued_units: 0,
                expired_units: 0
              };

              const availCount = Number(item.available_units);
              let statusLabel = 'Optimal';
              let statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              if (availCount === 0) {
                statusLabel = 'Critical Deficit';
                statusClass = 'bg-red-600 text-white font-bold animate-pulse';
              } else if (availCount < 3) {
                statusLabel = 'Low Stock';
                statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
              }

              return (
                <tr key={bg} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    <Badge type="blood" value={bg} />
                  </td>
                  <td className="py-3.5 px-6 font-bold text-emerald-700 text-base">
                    {availCount}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-amber-700">
                    {item.reserved_units}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-blue-700">
                    {item.issued_units}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-rose-600">
                    {item.expired_units}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
