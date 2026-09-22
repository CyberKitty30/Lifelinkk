import React, { useEffect, useState } from 'react';
import { BloodRequest, BloodGroup, ComponentType, UrgencyLevel, RequestStatus, Hospital, Patient } from '../types';
import { getRequests, createRequest, updateRequestStatus, getHospitals, getPatients } from '../services/api';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { IssueWorkflowModal } from './IssueWorkflowModal';
import { Search, Plus, FileSpreadsheet, Check, X, ArrowUpRight, AlertTriangle } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dropdowns for create request form
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIssueRequestId, setSelectedIssueRequestId] = useState<number | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    hospital_id: 0,
    patient_id: 0,
    blood_group: 'A+' as BloodGroup,
    component_type: 'Whole Blood' as ComponentType,
    units_required: 1,
    required_by: new Date().toISOString().split('T')[0],
    urgency: 'Normal' as UrgencyLevel
  });

  const [formError, setFormError] = useState('');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components: ComponentType[] = ['Whole Blood', 'RBC', 'Plasma', 'Platelets'];
  const urgencies: UrgencyLevel[] = ['Normal', 'Urgent', 'Emergency'];
  const statuses: RequestStatus[] = ['Pending', 'Approved', 'Partially Fulfilled', 'Fulfilled', 'Rejected', 'Cancelled'];

  useEffect(() => {
    fetchRequests();
    fetchDropdowns();
  }, [search, bloodGroupFilter, urgencyFilter, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getRequests({
        search: search || undefined,
        blood_group: bloodGroupFilter || undefined,
        urgency: urgencyFilter || undefined,
        request_status: statusFilter || undefined
      });
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [hList, pList] = await Promise.all([getHospitals(), getPatients()]);
      setHospitalsList(hList);
      setPatientsList(pList);
      if (hList.length > 0) setFormData(prev => ({ ...prev, hospital_id: hList[0].hospital_id }));
    } catch (err) {
      console.error('Failed to fetch hospital/patient dropdowns:', err);
    }
  };

  const handleOpenCreate = () => {
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.hospital_id || !formData.units_required || formData.units_required <= 0) {
      setFormError('Hospital and positive units required value are mandatory.');
      return;
    }

    try {
      await createRequest({
        ...formData,
        patient_id: formData.patient_id || undefined as any
      });
      setIsCreateOpen(false);
      fetchRequests();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to submit request');
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateRequestStatus(id, status);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

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

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Urgencies</option>
            {urgencies.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Blood Request</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Request ID & Hospital</th>
                <th className="py-3.5 px-5">Patient Name</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Component</th>
                <th className="py-3.5 px-5">Units Req</th>
                <th className="py-3.5 px-5">Required By</th>
                <th className="py-3.5 px-5">Urgency</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading blood requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No blood requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const isEmergency = r.urgency === 'Emergency';
                  const canIssue = ['Pending', 'Approved', 'Partially Fulfilled'].includes(r.request_status);

                  return (
                    <tr
                      key={r.request_id}
                      className={`transition-colors ${
                        isEmergency && r.request_status !== 'Fulfilled'
                          ? 'bg-rose-50/50 hover:bg-rose-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono font-bold text-slate-900">#{r.request_id}</span>
                          <div>
                            <p className="font-bold text-slate-900">{r.hospital_name}</p>
                            <p className="text-[10px] text-slate-400">{r.hospital_city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {r.patient_name || 'General Emergency Stock'}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="blood" value={r.blood_group} />
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="component" value={r.component_type} />
                      </td>
                      <td className="py-3.5 px-5 font-bold text-red-600 text-sm">
                        {r.units_required}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-600">
                        {new Date(r.required_by).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="urgency" value={r.urgency} />
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge type="status" value={r.request_status} />
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        {canIssue && (
                          <button
                            onClick={() => setSelectedIssueRequestId(r.request_id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                          >
                            Issue Blood
                          </button>
                        )}

                        {r.request_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(r.request_id, 'Approved')}
                              title="Approve Request"
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(r.request_id, 'Rejected')}
                              title="Reject Request"
                              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Blood Request"
        subtitle="Submit a formal hospital blood request into the BLOOD_REQUEST table."
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Requesting Hospital *</label>
              <select
                required
                value={formData.hospital_id}
                onChange={(e) => setFormData({ ...formData, hospital_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {hospitalsList.map((h) => (
                  <option key={h.hospital_id} value={h.hospital_id}>
                    {h.hospital_name} ({h.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient (Optional)</label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                <option value={0}>General Hospital Emergency Stock</option>
                {patientsList.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.patient_name} ({p.blood_group}) — {p.hospital_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value as BloodGroup })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Component Type *</label>
              <select
                value={formData.component_type}
                onChange={(e) => setFormData({ ...formData, component_type: e.target.value as ComponentType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {components.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Units Required *</label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={formData.units_required}
                onChange={(e) => setFormData({ ...formData, units_required: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required By Date *</label>
              <input
                type="date"
                required
                value={formData.required_by}
                onChange={(e) => setFormData({ ...formData, required_by: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level *</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency (High Priority)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
            >
              Submit Blood Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Blood Issue Workflow Modal Launcher */}
      <IssueWorkflowModal
        isOpen={!!selectedIssueRequestId}
        onClose={() => setSelectedIssueRequestId(null)}
        requestId={selectedIssueRequestId}
        onSuccess={fetchRequests}
      />
    </div>
  );
};
