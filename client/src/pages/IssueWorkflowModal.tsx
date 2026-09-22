import React, { useState, useEffect } from 'react';
import { BloodRequest, BloodUnit } from '../types';
import { getRequestById, issueBloodUnits, getStaff } from '../services/api';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { AlertTriangle, CheckCircle2, ShieldCheck, Droplet, ArrowRight } from 'lucide-react';

interface IssueWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number | null;
  onSuccess: () => void;
}

export const IssueWorkflowModal: React.FC<IssueWorkflowModalProps> = ({
  isOpen,
  onClose,
  requestId,
  onSuccess
}) => {
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [staffName, setStaffName] = useState('Dr. Ramesh Kulkarni');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      loadRequestData();
    }
  }, [isOpen, requestId]);

  const loadRequestData = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      setSelectedUnitIds([]);
      const data = await getRequestById(requestId);
      setRequest(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = (unitId: number) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
    } else {
      if (request && selectedUnitIds.length >= request.units_required) {
        alert(`You have already selected ${request.units_required} unit(s) matching the total units required.`);
        return;
      }
      setSelectedUnitIds([...selectedUnitIds, unitId]);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!requestId || selectedUnitIds.length === 0) {
      setErrorMsg('Please select at least one compatible blood unit to issue.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await issueBloodUnits({
        request_id: requestId,
        unit_ids: selectedUnitIds,
        issued_by: staffName
      });
      setSuccessMsg(res.message || 'Blood units issued successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to issue blood units.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !requestId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Blood Issue Workflow — Request #${requestId}`}
      subtitle="Transactional assignment of available inventory to fulfilled medical requests."
      maxWidth="3xl"
    >
      {loading || !request ? (
        <div className="py-12 text-center text-slate-400">Loading request & inventory compatibility...</div>
      ) : (
        <form onSubmit={handleIssueSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Request Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Hospital</span>
              <span className="font-extrabold text-slate-900 text-sm">{request.hospital_name}</span>
              <p className="text-[11px] text-slate-500">{request.hospital_city}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block">Required Group & Component</span>
              <div className="flex items-center space-x-2 mt-1">
                <Badge type="blood" value={request.blood_group} />
                <Badge type="component" value={request.component_type} />
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block">Units Required / Urgency</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-black text-red-600 text-sm">{request.units_required} Unit(s)</span>
                <Badge type="urgency" value={request.urgency} />
              </div>
            </div>
          </div>

          {/* Staff Assigner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Issued By (Staff Member) *</label>
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-red-500"
            />
          </div>

          {/* Compatible Units Selection Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-red-600" />
                <span>Compatible Available Blood Units in Inventory</span>
              </h5>
              <span className="text-xs font-semibold text-slate-500">
                Selected: <span className="font-bold text-red-600">{selectedUnitIds.length}</span> / {request.units_required}
              </span>
            </div>

            {!request.compatible_units || request.compatible_units.length === 0 ? (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-medium">
                ⚠️ No available, unexpired blood units in stock matching {request.blood_group} or universal donor (O-) for component {request.component_type}.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4 text-center">Select</th>
                      <th className="py-2.5 px-4">Unit ID</th>
                      <th className="py-2.5 px-4">Blood Group</th>
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4">Volume</th>
                      <th className="py-2.5 px-4">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {request.compatible_units.map((unit) => {
                      const isChecked = selectedUnitIds.includes(unit.unit_id);
                      return (
                        <tr
                          key={unit.unit_id}
                          onClick={() => handleUnitToggle(unit.unit_id)}
                          className={`cursor-pointer transition-colors ${
                            isChecked ? 'bg-red-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleUnitToggle(unit.unit_id)}
                              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                            #{unit.unit_id}
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge type="blood" value={unit.blood_group} size="sm" />
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge type="component" value={unit.component_type} size="sm" />
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800">{unit.volume_ml} ml</td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {new Date(unit.expiry_date).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Uses PostgreSQL Transaction (BEGIN/COMMIT)</span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedUnitIds.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <span>Confirm & Issue Selected ({selectedUnitIds.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
