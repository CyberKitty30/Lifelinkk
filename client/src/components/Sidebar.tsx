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
  HeartPulse
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
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
      <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/30">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">LifeLink</h1>
          <p className="text-[10px] text-red-400 font-semibold tracking-wider uppercase mt-1">Blood Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
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

      {/* Academic Viva Footer Banner */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-1">
          <Database className="w-4 h-4 text-red-400" />
          <span>DBMS Viva Project</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Relational 3NF PostgreSQL DB with parameterized SQL queries.
        </p>
      </div>
    </aside>
  );
};
