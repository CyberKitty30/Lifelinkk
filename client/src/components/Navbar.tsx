import React from 'react';
import { Database, ShieldCheck, Activity } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
  dbStatus?: { isUsingPgMem: boolean; status: string };
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, dbStatus }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-8 py-4 flex items-center justify-between shadow-xs">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* PostgreSQL Database Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <Database className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-600">DB Engine:</span>
          <span className="font-mono text-slate-800 font-medium">PostgreSQL 3NF</span>
          <span className={`w-2 h-2 rounded-full ${dbStatus?.isUsingPgMem ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} title={dbStatus?.status || 'DB Connected'}></span>
        </div>

        {/* Security & Validation Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Parameterized SQL</span>
        </div>
      </div>
    </header>
  );
};
