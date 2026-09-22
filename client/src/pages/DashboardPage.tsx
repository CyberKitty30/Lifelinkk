import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { StockTable } from '../components/StockTable';
import { Badge } from '../components/Badge';
import { Users, HeartHandshake, Droplet, FileSpreadsheet, Building2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Alert for Emergency Requests or Expiring Stock */}
      {stats.emergency_requests > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm">
                Attention: {stats.emergency_requests} Pending Emergency Blood Request(s)
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Immediate review and blood unit issuance required for critical patients.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Process Emergency Requests</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Registered Donors"
          value={stats.total_donors}
          subtitle="Active lifetime donors"
          icon={Users}
          color="red"
        />
        <StatCard
          title="Total Donations"
          value={stats.total_donations}
          subtitle="Recorded donation history"
          icon={HeartHandshake}
          color="purple"
        />
        <StatCard
          title="Available Blood Units"
          value={stats.available_units}
          subtitle={`${(stats.available_volume_ml / 1000).toFixed(1)} Liters total volume`}
          icon={Droplet}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pending_requests}
          subtitle={`${stats.emergency_requests} Emergency level`}
          icon={FileSpreadsheet}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <StatCard
          title="Emergency Requests"
          value={stats.emergency_requests}
          subtitle="Requires priority fulfillment"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Registered Hospitals"
          value={stats.total_hospitals}
          subtitle="Partner medical facilities"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Units Expiring Soon"
          value={stats.expiring_soon_count}
          subtitle="Within next 7 days"
          icon={Droplet}
          color="amber"
        />
      </div>

      {/* Stock Summary Matrix */}
      <StockTable data={stats.stock_matrix} />

      {/* Recent Emergency Requests & Expiring Units Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Emergency Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Pending Emergency Requests</span>
            </h3>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              View All →
            </button>
          </div>

          {stats.recent_emergency_requests.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pending emergency requests at present.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_emergency_requests.map((req) => (
                <div key={req.request_id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge type="blood" value={req.blood_group} />
                      <Badge type="component" value={req.component_type} />
                      <span className="text-xs font-bold text-slate-700">{req.units_required} unit(s)</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1.5">{req.hospital_name}</p>
                    <p className="text-[11px] text-slate-500">Contact: {req.emergency_contact}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('requests')}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Issue
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Soon Watchlist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Blood Units Expiring Soon</h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              View Inventory →
            </button>
          </div>

          {stats.expiring_units_list.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No blood units expiring within the next 7 days.</p>
          ) : (
            <div className="space-y-3">
              {stats.expiring_units_list.map((unit) => (
                <div key={unit.unit_id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-800">Unit #{unit.unit_id}</span>
                      <Badge type="blood" value={unit.blood_group} />
                      <Badge type="component" value={unit.component_type} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Expiry Date: <span className="font-bold text-amber-900">{new Date(unit.expiry_date).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-200 text-amber-900 rounded-md">
                    Priority Issue
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
