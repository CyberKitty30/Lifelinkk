import React, { useEffect, useState } from 'react';
import { Staff, DonationCenter } from '../types';
import { getStaff, createStaff, updateStaff, deleteStaff, getDonationCenters } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Search, Plus, Edit2, Trash2, ShieldAlert, Building2 } from 'lucide-react';

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [centerFilter, setCenterFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    center_id: 0,
    full_name: '',
    role: 'Phlebotomist',
    phone: '',
    email: ''
  });

  const [formError, setFormError] = useState('');
  const roles = ['Medical Officer', 'Phlebotomist', 'Senior Lab Technician', 'Center Supervisor', 'Blood Storage Manager', 'Quality Assurance Specialist'];

  useEffect(() => {
    fetchStaff();
    fetchCenters();
  }, [search, centerFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff({
        search: search || undefined,
        center_id: centerFilter || undefined
      });
      setStaffList(data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const cData = await getDonationCenters();
      setCenters(cData);
      if (cData.length > 0) setFormData(prev => ({ ...prev, center_id: cData[0].center_id }));
    } catch (err) {
      console.error('Failed to fetch centers:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      center_id: centers.length > 0 ? centers[0].center_id : 0,
      full_name: '',
      role: 'Phlebotomist',
      phone: '',
      email: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      center_id: s.center_id || (centers.length > 0 ? centers[0].center_id : 0),
      full_name: s.full_name,
      role: s.role,
      phone: s.phone,
      email: s.email
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.full_name || !formData.phone || !formData.email || !formData.role) {
      setFormError('Please fill in all staff details.');
      return;
    }

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.staff_id, formData);
      } else {
        await createStaff(formData);
      }
      setIsFormOpen(false);
      fetchStaff();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save staff member');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteStaff(deletingId);
      setDeletingId(null);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff name, role, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500 max-w-[220px]"
          >
            <option value="">All Donation Centers</option>
            {centers.map((c) => (
              <option key={c.center_id} value={c.center_id}>{c.center_name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Staff ID & Name</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Assigned Donation Center</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading staff records...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No staff members found.</td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s.staff_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{s.staff_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-red-700">{s.role}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">{s.center_name || 'Unassigned'}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">{s.phone}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono">{s.email}</td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(s.staff_id);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStaff ? `Edit Staff Member #${editingStaff.staff_id}` : 'Add New Staff Member'}
        subtitle="Manage donation center medical officers and phlebotomists."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Donation Center *</label>
              <select
                required
                value={formData.center_id}
                onChange={(e) => setFormData({ ...formData, center_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {centers.map((c) => (
                  <option key={c.center_id} value={c.center_id}>{c.center_name} ({c.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-red-600 rounded-xl">{editingStaff ? 'Update Staff' : 'Save Staff'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff record?"
      />
    </div>
  );
};
