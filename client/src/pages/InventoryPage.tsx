import { useEffect, useState } from 'react';
import { BloodUnit, BloodGroup, ComponentType, InventoryStatus } from '../types';
import { getInventory, updateUnitStatus } from '../services/api';
import { Badge } from '../components/Badge';
import { AlertCircle, Clock } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [units, setUnits] = useState<BloodUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expiringSoonFilter, setExpiringSoonFilter] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components: ComponentType[] = ['Whole Blood', 'RBC', 'Plasma', 'Platelets'];
  const statuses: InventoryStatus[] = ['Available', 'Reserved', 'Issued', 'Expired', 'Discarded'];

  useEffect(() => {
    fetchInventory();
  }, [bloodGroupFilter, componentFilter, statusFilter, expiringSoonFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory({
        blood_group: bloodGroupFilter || undefined,
        component_type: componentFilter || undefined,
        status: statusFilter || undefined,
        expiring_soon: expiringSoonFilter ? 'true' : undefined
      });
      setUnits(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (unitId: number, newStatus: string) => {
    try {
      await updateUnitStatus(unitId, newStatus);
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update unit status');
    }
  };

  const getExpiryDays = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Blood Group Filter */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Component Type Filter */}
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Component Types</option>
            {components.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Unit Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Expiring Soon Toggle */}
          <button
            type="button"
            onClick={() => setExpiringSoonFilter(!expiringSoonFilter)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
              expiringSoonFilter
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Expiring Soon (&le; 7 Days)</span>
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Units Listed: <span className="text-slate-900 font-extrabold">{units.length}</span>
        </div>
      </div>

      {/* Inventory Units Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Unit ID</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Component</th>
                <th className="py-3.5 px-5">Volume</th>
                <th className="py-3.5 px-5">Collection Date</th>
                <th className="py-3.5 px-5">Expiry Date</th>
                <th className="py-3.5 px-5">Expiry Status</th>
                <th className="py-3.5 px-5">Unit Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading inventory units...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No blood units found matching specified filters.
                  </td>
                </tr>
              ) : (
                units.map((u) => {
                  const daysToExpiry = getExpiryDays(u.expiry_date);
                  const isExpired = daysToExpiry < 0;
                  const isExpiringSoon = daysToExpiry >= 0 && daysToExpiry <= 7;

                  return (
                    <tr
                      key={u.unit_id}
                      className={`transition-colors ${
                        isExpired
                          ? 'bg-rose-50/40 hover:bg-rose-50/80'
                          : isExpiringSoon
                          ? 'bg-amber-50/40 hover:bg-amber-50/80'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        #{u.unit_id}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="blood" value={u.blood_group} />
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="component" value={u.component_type} />
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">{u.volume_ml} ml</td>
                      <td className="py-3.5 px-5 font-medium text-slate-600">
                        {new Date(u.collection_date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {new Date(u.expiry_date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        {isExpired ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>EXPIRED</span>
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>{daysToExpiry} day(s) left</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500">
                            {daysToExpiry} days left
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="status" value={u.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <select
                          value={u.status}
                          onChange={(e) => handleStatusChange(u.unit_id, e.target.value)}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-red-500"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
