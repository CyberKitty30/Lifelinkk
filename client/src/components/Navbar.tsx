import React from 'react';
import { Database, ShieldCheck, LogOut, UserCheck, Crown, Stethoscope, Building2, Users } from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface NavbarProps {
  title: string;
  subtitle?: string;
  dbStatus?: { isUsingPgMem: boolean; status: string };
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, dbStatus, currentUser, onLogout }) => {
  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'hospital':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'donor':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3.5 h-3.5 text-amber-600" />;
      case 'staff':
        return <Stethoscope className="w-3.5 h-3.5 text-blue-600" />;
      case 'hospital':
        return <Building2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'donor':
        return <Users className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3.5">
        {/* PostgreSQL Database Status Badge */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <Database className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-600">DB Engine:</span>
          <span className="font-mono text-slate-800 font-medium">PostgreSQL 3NF</span>
          <span
            className={`w-2 h-2 rounded-full ${dbStatus?.isUsingPgMem ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}
            title={dbStatus?.status || 'DB Connected'}
          ></span>
        </div>

        {/* Security & Validation Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Parameterized SQL</span>
        </div>

        {/* Active User Profile Pill */}
        {currentUser && (
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 pl-3 pr-2 py-1.5 rounded-2xl">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs text-slate-900 leading-tight">{currentUser.name}</span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border flex items-center space-x-1 ${getRoleBadgeStyle(
                    currentUser.role
                  )}`}
                >
                  {getRoleIcon(currentUser.role)}
                  <span>{currentUser.role}</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-mono">{currentUser.email}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Log Out & Switch User Role"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
