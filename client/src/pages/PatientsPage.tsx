import React, { useEffect, useState } from 'react';
import { Patient, Hospital, BloodGroup } from '../types';
import { getPatients, createPatient, updatePatient, deletePatient, getHospitals } from '../services/api';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Search, Plus, Edit2, Trash2, UserCheck, Building2 } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    hospital_id: 0,
    patient_name: '',
    date_of_birth: '1990-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    blood_group: 'A+' as BloodGroup,
    contact_number: '',
    medical_notes: ''
  });

  const [formError, setFormError] = useState('');
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchPatients();
    fetchHospitalsList();
  }, [search, bloodGroupFilter, hospitalFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients({
        search: search || undefined,
        blood_group: bloodGroupFilter || undefined,
        hospital_id: hospitalFilter || undefined
      });
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalsList = async () => {
    try {
      const hData = await getHospitals();
      setHospitals(hData);
      if (hData.length > 0) setFormData(prev => ({ ...prev, hospital_id: hData[0].hospital_id }));
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({
      hospital_id: hospitals.length > 0 ? hospitals[0].hospital_id : 0,
      patient_name: '',
      date_of_birth: '1990-01-01',
      gender: 'Male',
      blood_group: 'A+',
      contact_number: '',
      medical_notes: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setFormData({
      hospital_id: p.hospital_id,
      patient_name: p.patient_name,
      date_of_birth: p.date_of_birth.split('T')[0],
      gender: p.gender,
      blood_group: p.blood_group,
      contact_number: p.contact_number,
      medical_notes: p.medical_notes || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.patient_name || !formData.hospital_id || !formData.contact_number) {
      setFormError('Please fill in required fields.');
      return;
    }

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.patient_id, formData);
      } else {
        await createPatient(formData);
      }
      setIsFormOpen(false);
      fetchPatients();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save patient');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deletePatient(deletingId);
      setDeletingId(null);
      fetchPatients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete patient');
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
              placeholder="Search patient name, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

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

          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500 max-w-[200px]"
          >
            <option value="">All Hospitals</option>
            {hospitals.map((h) => (
              <option key={h.hospital_id} value={h.hospital_id}>{h.hospital_name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Patient ID & Name</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Admitted Hospital</th>
                <th className="py-3.5 px-5">Contact Number</th>
                <th className="py-3.5 px-5">Medical Notes</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No patients registered.</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                          {p.patient_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.patient_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{p.patient_id} • {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge type="blood" value={p.blood_group} />
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{p.hospital_name}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">{p.contact_number}</td>
                    <td className="py-3.5 px-5 text-slate-600 italic max-w-xs truncate">{p.medical_notes || '—'}</td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(p.patient_id);
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

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPatient ? `Edit Patient #${editingPatient.patient_id}` : 'Register New Patient'}
        subtitle="Associate patient with hospital record and blood group requirement."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital *</label>
              <select
                required
                value={formData.hospital_id}
                onChange={(e) => setFormData({ ...formData, hospital_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {hospitals.map((h) => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.hospital_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
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
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value as BloodGroup })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-red-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number *</label>
              <input
                type="text"
                required
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medical Diagnosis Notes</label>
            <textarea
              rows={2}
              value={formData.medical_notes}
              onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-red-600 rounded-xl">{editingPatient ? 'Update Patient' : 'Save Patient'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient record?"
      />
    </div>
  );
};
