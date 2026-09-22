import React, { useEffect, useState } from 'react';
import { Donor, BloodGroup } from '../types';
import { getDonors, getDonorById, createDonor, updateDonor, deleteDonor } from '../services/api';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Search, Plus, Edit2, Trash2, Eye, Calendar, MapPin, Phone, Mail, UserCheck } from 'lucide-react';

export const DonorsPage: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [viewingDonor, setViewingDonor] = useState<Donor | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    blood_group: 'O+' as BloodGroup,
    phone: '',
    email: '',
    city: '',
    address: '',
    eligibility_status: 'Eligible' as any
  });

  const [formError, setFormError] = useState('');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Pune', 'Bengaluru', 'Hyderabad', 'Ahmedabad'];

  useEffect(() => {
    fetchDonors();
  }, [search, selectedBloodGroup, selectedCity]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await getDonors({
        search: search || undefined,
        blood_group: selectedBloodGroup || undefined,
        city: selectedCity || undefined
      });
      setDonors(data);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDonor(null);
    setFormData({
      full_name: '',
      date_of_birth: '1995-01-01',
      gender: 'Male',
      blood_group: 'O+',
      phone: '',
      email: '',
      city: 'Mumbai',
      address: '',
      eligibility_status: 'Eligible'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setFormData({
      full_name: donor.full_name,
      date_of_birth: donor.date_of_birth.split('T')[0],
      gender: donor.gender,
      blood_group: donor.blood_group,
      phone: donor.phone,
      email: donor.email,
      city: donor.city,
      address: donor.address,
      eligibility_status: donor.eligibility_status
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const fullDetail = await getDonorById(id);
      setViewingDonor(fullDetail);
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Failed to load donor details:', err);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.full_name || !formData.phone || !formData.email || !formData.address) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingDonor) {
        await updateDonor(editingDonor.donor_id, formData);
      } else {
        await createDonor(formData);
      }
      setIsFormOpen(false);
      fetchDonors();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save donor');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteDonor(deletingId);
      setDeletingId(null);
      fetchDonors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete donor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Blood Group Filter */}
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
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
          <span>Register New Donor</span>
        </button>
      </div>

      {/* Donors Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Donor ID & Name</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">City</th>
                <th className="py-3.5 px-5">Last Donation</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading donors database...
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No donors matching your search criteria.
                  </td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr key={d.donor_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                          {d.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{d.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{d.donor_id} • {d.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="blood" value={d.blood_group} />
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-slate-800">{d.phone}</p>
                      <p className="text-[11px] text-slate-400">{d.email}</p>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">{d.city}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">
                      {d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="status" value={d.eligibility_status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDetail(d.donor_id)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(d)}
                        title="Edit Donor"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(d.donor_id);
                          setIsDeleteOpen(true);
                        }}
                        title="Delete Donor"
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

      {/* Add / Edit Donor Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDonor ? `Edit Donor #${editingDonor.donor_id}` : 'Register New Blood Donor'}
        subtitle="Ensure accurate donor details for database integrity."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Eligibility Status *</label>
              <select
                value={formData.eligibility_status}
                onChange={(e) => setFormData({ ...formData, eligibility_status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                <option value="Eligible">Eligible</option>
                <option value="Ineligible">Ineligible</option>
                <option value="Deferred">Deferred</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
              {editingDonor ? 'Update Donor' : 'Register Donor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Donor Details Drawer Modal */}
      {viewingDonor && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Donor Profile — ${viewingDonor.full_name}`}
          subtitle={`Donor ID #${viewingDonor.donor_id}`}
        >
          <div className="space-y-6">
            {/* Top Profile Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                  {viewingDonor.blood_group}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{viewingDonor.full_name}</h4>
                  <p className="text-xs text-slate-500">{viewingDonor.city} • Registered: {new Date(viewingDonor.registration_date).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge type="status" value={viewingDonor.eligibility_status} />
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400 font-bold block">Phone</span>
                <span className="font-bold text-slate-800">{viewingDonor.phone}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400 font-bold block">Email</span>
                <span className="font-bold text-slate-800">{viewingDonor.email}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-400 font-bold block">Total Donations</span>
                <span className="font-bold text-red-600 text-sm">{viewingDonor.total_donations || 0} times</span>
              </div>
            </div>

            {/* Donation History Table */}
            <div>
              <h5 className="font-bold text-slate-900 text-sm mb-3">Donation History</h5>
              {viewingDonor.donation_history && viewingDonor.donation_history.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Center</th>
                        <th className="py-2.5 px-4">Volume</th>
                        <th className="py-2.5 px-4">Screening</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingDonor.donation_history.map((h) => (
                        <tr key={h.donation_id}>
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            {new Date(h.donation_date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-600">{h.center_name}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-700">{h.blood_volume_ml} ml</td>
                          <td className="py-2.5 px-4">
                            <Badge type="status" value={h.screening_status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                  No recorded donation history for this donor yet.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Donor Record"
        message="Are you sure you want to delete this donor? This action cannot be undone and will cascade delete linked donation records."
      />
    </div>
  );
};
