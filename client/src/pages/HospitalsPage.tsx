import React, { useEffect, useState } from 'react';
import { Hospital, BloodRequest, Patient } from '../types';
import { getHospitals, getHospitalById, createHospital, updateHospital, deleteHospital } from '../services/api';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Search, Plus, Edit2, Trash2, Eye, Building2, Phone, Mail, AlertTriangle, Users } from 'lucide-react';

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [viewingHospital, setViewingHospital] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    hospital_name: '',
    address: '',
    city: 'Mumbai',
    phone: '',
    email: '',
    emergency_contact: ''
  });

  const [formError, setFormError] = useState('');
  const cities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Pune', 'Gurugram', 'Hyderabad', 'Bengaluru'];

  useEffect(() => {
    fetchHospitals();
  }, [search, cityFilter]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await getHospitals({
        search: search || undefined,
        city: cityFilter || undefined
      });
      setHospitals(data);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingHospital(null);
    setFormData({
      hospital_name: '',
      address: '',
      city: 'Mumbai',
      phone: '',
      email: '',
      emergency_contact: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (h: Hospital) => {
    setEditingHospital(h);
    setFormData({
      hospital_name: h.hospital_name,
      address: h.address,
      city: h.city,
      phone: h.phone,
      email: h.email,
      emergency_contact: h.emergency_contact
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const full = await getHospitalById(id);
      setViewingHospital(full);
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Failed to load hospital details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.hospital_name || !formData.phone || !formData.email || !formData.emergency_contact) {
      setFormError('Please fill in all required hospital details.');
      return;
    }

    try {
      if (editingHospital) {
        await updateHospital(editingHospital.hospital_id, formData);
      } else {
        await createHospital(formData);
      }
      setIsFormOpen(false);
      fetchHospitals();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save hospital');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteHospital(deletingId);
      setDeletingId(null);
      fetchHospitals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete hospital');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital name, city, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hospital</span>
        </button>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Hospital ID & Name</th>
                <th className="py-3.5 px-5">City & Address</th>
                <th className="py-3.5 px-5">Phone & Email</th>
                <th className="py-3.5 px-5">Emergency Contact</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading hospital directory...
                  </td>
                </tr>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No hospitals found matching your criteria.
                  </td>
                </tr>
              ) : (
                hospitals.map((h) => (
                  <tr key={h.hospital_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{h.hospital_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{h.hospital_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-800">{h.city}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{h.address}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-800">{h.phone}</p>
                      <p className="text-[11px] text-slate-400">{h.email}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                        {h.emergency_contact}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDetail(h.hospital_id)}
                        title="View Linked Requests & Patients"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(h)}
                        title="Edit Hospital"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(h.hospital_id);
                          setIsDeleteOpen(true);
                        }}
                        title="Delete Hospital"
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

      {/* Add / Edit Hospital Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingHospital ? `Edit Hospital #${editingHospital.hospital_id}` : 'Add New Hospital'}
        subtitle="Maintain hospital contact numbers and emergency desks."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Name *</label>
              <input
                type="text"
                required
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">24/7 Emergency Contact Hotline *</label>
              <input
                type="text"
                required
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700 focus:bg-white focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
            >
              {editingHospital ? 'Update Hospital' : 'Save Hospital'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Hospital Detail Drawer */}
      {viewingHospital && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Hospital Directory — ${viewingHospital.hospital_name}`}
          subtitle={`City: ${viewingHospital.city} • Hotline: ${viewingHospital.emergency_contact}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Linked Requests Section */}
            <div>
              <h5 className="font-bold text-slate-900 text-sm mb-3">Submitted Blood Requests</h5>
              {viewingHospital.blood_requests?.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Req ID</th>
                        <th className="py-2.5 px-4">Patient</th>
                        <th className="py-2.5 px-4">Blood Group</th>
                        <th className="py-2.5 px-4">Units</th>
                        <th className="py-2.5 px-4">Urgency</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingHospital.blood_requests.map((r: BloodRequest) => (
                        <tr key={r.request_id}>
                          <td className="py-2 px-4 font-mono font-bold">#{r.request_id}</td>
                          <td className="py-2 px-4">{r.patient_name || 'N/A'}</td>
                          <td className="py-2 px-4"><Badge type="blood" value={r.blood_group} size="sm" /></td>
                          <td className="py-2 px-4 font-bold">{r.units_required}</td>
                          <td className="py-2 px-4"><Badge type="urgency" value={r.urgency} size="sm" /></td>
                          <td className="py-2 px-4"><Badge type="status" value={r.request_status} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No blood requests submitted by this hospital yet.</p>
              )}
            </div>

            {/* Linked Patients Section */}
            <div>
              <h5 className="font-bold text-slate-900 text-sm mb-3">Admitted Patients</h5>
              {viewingHospital.patients?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingHospital.patients.map((p: Patient) => (
                    <div key={p.patient_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{p.patient_name}</span>
                        <Badge type="blood" value={p.blood_group} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Contact: {p.contact_number}</p>
                      <p className="text-[11px] text-slate-600 mt-1 italic">{p.medical_notes}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No patients registered for this hospital.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Hospital Record"
        message="Are you sure you want to delete this hospital? This will also remove associated patient and blood request records."
      />
    </div>
  );
};
