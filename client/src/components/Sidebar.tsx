import React from 'react';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Droplet,
  FileSpreadsheet,
  Building2,
  UserCheck,
  ShieldAlert,
  Database,
  HeartPulse,
  LogOut,
  User
} from 'lucide-react';
import { AuthUser } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donors', label: 'Donors', icon: Users },
    { id: 'donations', label: 'Donations', icon: HeartHandshake },
    { id: 'inventory', label: 'Blood Inventory', icon: Droplet },
    { id: 'requests', label: 'Blood Requests', icon: FileSpreadsheet },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'patients', label: 'Patients', icon: UserCheck },
    { id: 'staff', label: 'Staff', icon: ShieldAlert },
    { id: 'analytics', label: 'SQL Analytics', icon: Database, isSpecial: true }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-xl border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/30">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">LifeLink</h1>
            <p className="text-[10px] text-red-400 font-semibold tracking-wider uppercase mt-1">Blood Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          System Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? item.isSpecial
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-900/30 font-semibold'
                    : 'bg-red-600/90 text-white shadow-md shadow-red-950/40 font-semibold'
                  : item.isSpecial
                  ? 'text-red-400 hover:bg-slate-800/90 hover:text-red-300 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.isSpecial ? 'text-red-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.isSpecial && (
                <span className="ml-auto text-[10px] font-bold uppercase bg-red-950/80 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded">
                  15 Queries
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer Card */}
      {currentUser && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs border border-slate-700">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out & Switch User"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
