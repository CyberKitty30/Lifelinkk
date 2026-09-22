import React, { useEffect, useState } from 'react';
import { Donation, Donor, DonationCenter, ComponentType } from '../types';
import { getDonations, recordDonation, getDonors, getDonationCenters } from '../services/api';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Search, Plus, HeartHandshake, Calendar, Droplet, Building2, CheckCircle2 } from 'lucide-react';

export const DonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningFilter, setScreeningFilter] = useState('');
  const [donorFilter, setDonorFilter] = useState('');

  // Form & Dropdown Data
  const [donorsList, setDonorsList] = useState<Donor[]>([]);
  const [centersList, setCentersList] = useState<DonationCenter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    donor_id: 0,
    donation_center_id: 0,
    donation_date: new Date().toISOString().split('T')[0],
    blood_volume_ml: 450,
    screening_status: 'Passed' as 'Passed' | 'Failed' | 'Pending',
    component_type: 'Whole Blood' as ComponentType
  });

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDonations();
    fetchOptions();
  }, [screeningFilter, donorFilter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await getDonations({
        screening_status: screeningFilter || undefined,
        donor_id: donorFilter || undefined
      });
      setDonations(data);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [dList, cList] = await Promise.all([getDonors(), getDonationCenters()]);
      setDonorsList(dList);
      setCentersList(cList);
      if (dList.length > 0) setFormData(prev => ({ ...prev, donor_id: dList[0].donor_id }));
      if (cList.length > 0) setFormData(prev => ({ ...prev, donation_center_id: cList[0].center_id }));
    } catch (err) {
      console.error('Failed to fetch dropdown options:', err);
    }
  };

  const handleOpenRecord = () => {
    setFormError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.donor_id || !formData.donation_center_id || !formData.blood_volume_ml) {
      setFormError('Please select a donor, center, and volume.');
      return;
    }

    try {
      const res = await recordDonation(formData);
      setSuccessMsg(`Donation recorded successfully! Blood unit generated in inventory.`);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchDonations();
      }, 1200);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to record donation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Screening Filter */}
          <select
            value={screeningFilter}
            onChange={(e) => setScreeningFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Screening Statuses</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Donor Filter */}
          <select
            value={donorFilter}
            onChange={(e) => setDonorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500 max-w-[240px]"
          >
            <option value="">All Registered Donors</option>
            {donorsList.map((d) => (
              <option key={d.donor_id} value={d.donor_id}>
                {d.full_name} ({d.blood_group})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenRecord}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Donation</span>
        </button>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Donation ID & Donor</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Donation Center</th>
                <th className="py-3.5 px-5">Volume (ml)</th>
                <th className="py-3.5 px-5">Donation Date</th>
                <th className="py-3.5 px-5">Screening Status</th>
                <th className="py-3.5 px-5">Donation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading donation history...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No donation records found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.donation_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          #{d.donation_id}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{d.donor_name}</p>
                          <p className="text-[10px] text-slate-400">Donor ID: #{d.donor_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="blood" value={d.blood_group || 'N/A'} />
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">{d.center_name}</td>
                    <td className="py-3.5 px-5 font-bold text-red-600">{d.blood_volume_ml} ml</td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">
                      {new Date(d.donation_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="status" value={d.screening_status} />
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="status" value={d.donation_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Donation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Blood Donation"
        subtitle="Creating a donation record automatically generates an active blood unit in inventory."
      >
        <form onSubmit={handleSubmitDonation} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Donor *</label>
              <select
                required
                value={formData.donor_id}
                onChange={(e) => setFormData({ ...formData, donor_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {donorsList.map((d) => (
                  <option key={d.donor_id} value={d.donor_id}>
                    {d.full_name} ({d.blood_group}) — {d.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Donation Center *</label>
              <select
                required
                value={formData.donation_center_id}
                onChange={(e) => setFormData({ ...formData, donation_center_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {centersList.map((c) => (
                  <option key={c.center_id} value={c.center_id}>
                    {c.center_name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Donation Date *</label>
              <input
                type="date"
                required
                value={formData.donation_date}
                onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Volume (ml) *</label>
              <input
                type="number"
                required
                min={100}
                max={600}
                value={formData.blood_volume_ml}
                onChange={(e) => setFormData({ ...formData, blood_volume_ml: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Component Type *</label>
              <select
                value={formData.component_type}
                onChange={(e) => setFormData({ ...formData, component_type: e.target.value as ComponentType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                <option value="Whole Blood">Whole Blood (+42 days expiry)</option>
                <option value="RBC">RBC (+42 days expiry)</option>
                <option value="Plasma">Plasma (+365 days expiry)</option>
                <option value="Platelets">Platelets (+7 days expiry)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Screening Status *</label>
              <select
                value={formData.screening_status}
                onChange={(e) => setFormData({ ...formData, screening_status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                <option value="Passed">Passed (Generates Blood Unit)</option>
                <option value="Failed">Failed (Discarded)</option>
                <option value="Pending">Pending Lab Test</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
            >
              Record Donation & Create Unit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
