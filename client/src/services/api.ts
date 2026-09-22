import axios from 'axios';
import {
  Donor,
  Donation,
  BloodUnit,
  BloodRequest,
  BloodIssue,
  Hospital,
  Patient,
  Staff,
  DonationCenter,
  StockSummaryItem,
  DashboardStats,
  SqlQueryResult,
  AuthUser,
  UserRole
} from '../types';
import { mockStore } from './mockStore';
import { PREDEFINED_QUERIES } from './analyticsCatalog';

const API = axios.create({
  baseURL: '/api'
});

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const res = await API.get('/dashboard/stats');
    return res.data.data;
  } catch (err) {
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
    const stockMatrix: StockSummaryItem[] = allGroups.map((bg) => {
      const avail = mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Available').length;
      const res = mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Reserved').length;
      const iss = mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Issued').length;
      const exp = mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Expired').length;
      const vol = mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Available').reduce((acc, curr) => acc + (curr.volume_ml || 0), 0);
      return {
        blood_group: bg,
        available_units: avail,
        reserved_units: res,
        issued_units: iss,
        expired_units: exp,
        total_available_volume_ml: vol
      };
    });

    const availUnits = mockStore.bloodUnits.filter((u) => u.status === 'Available');
    const totalVol = availUnits.reduce((acc, curr) => acc + (curr.volume_ml || 0), 0);

    return {
      total_donors: mockStore.donors.length,
      total_donations: mockStore.donations.length,
      available_units: availUnits.length,
      available_volume_ml: totalVol,
      pending_requests: mockStore.bloodRequests.filter((r) => r.request_status === 'Pending' || r.request_status === 'Approved').length,
      emergency_requests: mockStore.bloodRequests.filter((r) => r.urgency === 'Emergency' && (r.request_status === 'Pending' || r.request_status === 'Approved')).length,
      total_hospitals: mockStore.hospitals.length,
      expiring_soon_count: 0,
      stock_matrix: stockMatrix,
      recent_emergency_requests: mockStore.bloodRequests.filter((r) => r.urgency === 'Emergency'),
      expiring_units_list: [],
      db_status: { isUsingPgMem: true, status: 'Running on Static Engine (Ready for Manual Entry)' }
    };
  }
};

// Donors
export const getDonors = async (params?: any): Promise<Donor[]> => {
  try {
    const res = await API.get('/donors', { params });
    return res.data.data;
  } catch {
    let result = [...mockStore.donors];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((d) => d.full_name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q) || d.phone?.includes(q));
    }
    if (params?.blood_group) {
      result = result.filter((d) => d.blood_group === params.blood_group);
    }
    if (params?.city) {
      result = result.filter((d) => d.city === params.city);
    }
    return result;
  }
};

export const getDonorById = async (id: number): Promise<Donor> => {
  try {
    const res = await API.get(`/donors/${id}`);
    return res.data.data;
  } catch {
    const d = mockStore.donors.find((item) => item.donor_id === Number(id));
    if (!d) {
      return {
        donor_id: id,
        full_name: 'Unknown Donor',
        date_of_birth: '',
        gender: 'Male',
        blood_group: 'O+',
        phone: '',
        email: '',
        city: '',
        address: '',
        last_donation_date: null,
        registration_date: '',
        eligibility_status: 'Eligible',
        donation_history: [],
        total_donations: 0
      };
    }
    const donorDonations = mockStore.donations.filter((dn) => dn.donor_id === d.donor_id);
    return {
      ...d,
      donation_history: donorDonations,
      total_donations: donorDonations.length
    };
  }
};

export const createDonor = async (data: Partial<Donor>): Promise<Donor> => {
  try {
    const res = await API.post('/donors', data);
    return res.data.data;
  } catch {
    const newId = mockStore.donors.length > 0 ? Math.max(...mockStore.donors.map((d) => d.donor_id)) + 1 : 1;
    const newDonor: Donor = {
      donor_id: newId,
      full_name: data.full_name || 'New Donor',
      date_of_birth: data.date_of_birth || '1995-01-01',
      gender: data.gender || 'Male',
      blood_group: data.blood_group || 'O+',
      phone: data.phone || '',
      email: data.email || '',
      city: data.city || 'Mumbai',
      address: data.address || '',
      last_donation_date: null,
      registration_date: new Date().toISOString().split('T')[0],
      eligibility_status: 'Eligible'
    };
    mockStore.donors.unshift(newDonor);
    mockStore.saveToLocalStorage();
    return newDonor;
  }
};

export const updateDonor = async (id: number, data: Partial<Donor>): Promise<Donor> => {
  try {
    const res = await API.put(`/donors/${id}`, data);
    return res.data.data;
  } catch {
    const idx = mockStore.donors.findIndex((d) => d.donor_id === Number(id));
    if (idx !== -1) {
      mockStore.donors[idx] = { ...mockStore.donors[idx], ...data };
      mockStore.saveToLocalStorage();
      return mockStore.donors[idx];
    }
    throw new Error('Donor not found');
  }
};

export const deleteDonor = async (id: number): Promise<void> => {
  try {
    await API.delete(`/donors/${id}`);
  } catch {
    mockStore.donors = mockStore.donors.filter((d) => d.donor_id !== Number(id));
    mockStore.saveToLocalStorage();
  }
};

// Donations
export const getDonations = async (params?: any): Promise<Donation[]> => {
  try {
    const res = await API.get('/donations', { params });
    return res.data.data;
  } catch {
    let list = [...mockStore.donations];
    if (params?.screening_status) {
      list = list.filter((d) => d.screening_status === params.screening_status);
    }
    if (params?.donor_id) {
      list = list.filter((d) => d.donor_id === Number(params.donor_id));
    }
    return list;
  }
};

export const recordDonation = async (data: any): Promise<any> => {
  try {
    const res = await API.post('/donations', data);
    return res.data;
  } catch {
    const donor = mockStore.donors.find((d) => d.donor_id === Number(data.donor_id));
    const center = mockStore.donationCenters.find((c) => c.center_id === Number(data.donation_center_id));
    
    const donationId = mockStore.donations.length > 0 ? Math.max(...mockStore.donations.map((d) => d.donation_id)) + 1 : 1;
    
    const newDonation: Donation = {
      donation_id: donationId,
      donor_id: Number(data.donor_id),
      donor_name: donor?.full_name || 'Donor',
      blood_group: donor?.blood_group || 'O+',
      donation_date: data.donation_date || new Date().toISOString().split('T')[0],
      donation_center_id: Number(data.donation_center_id),
      center_name: center?.center_name || 'Red Cross Central Blood Bank',
      blood_volume_ml: Number(data.blood_volume_ml) || 450,
      screening_status: data.screening_status || 'Passed',
      donation_status: 'Completed'
    };

    mockStore.donations.unshift(newDonation);

    if (donor) {
      donor.last_donation_date = newDonation.donation_date;
    }

    if (data.screening_status === 'Passed') {
      const unitId = mockStore.bloodUnits.length > 0 ? Math.max(...mockStore.bloodUnits.map((u) => u.unit_id)) + 100 : 101;
      let days = 42;
      if (data.component_type === 'Platelets') days = 7;
      if (data.component_type === 'Plasma') days = 365;

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + days);

      const newUnit: BloodUnit = {
        unit_id: unitId,
        donation_id: newDonation.donation_id,
        donor_name: donor?.full_name || 'Donor',
        blood_group: donor?.blood_group || 'O+',
        collection_date: newDonation.donation_date,
        expiry_date: expDate.toISOString().split('T')[0],
        volume_ml: newDonation.blood_volume_ml,
        component_type: data.component_type || 'Whole Blood',
        status: 'Available'
      };
      mockStore.bloodUnits.unshift(newUnit);
    }

    mockStore.saveToLocalStorage();
    return { success: true, message: 'Donation recorded successfully!' };
  }
};

// Inventory
export const getInventory = async (params?: any): Promise<BloodUnit[]> => {
  try {
    const res = await API.get('/inventory', { params });
    return res.data.data;
  } catch {
    let res = [...mockStore.bloodUnits];
    if (params?.blood_group) res = res.filter((u) => u.blood_group === params.blood_group);
    if (params?.component_type) res = res.filter((u) => u.component_type === params.component_type);
    if (params?.status) res = res.filter((u) => u.status === params.status);
    return res;
  }
};

export const getStockSummary = async (): Promise<StockSummaryItem[]> => {
  try {
    const res = await API.get('/inventory/summary');
    return res.data.data;
  } catch {
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
    return allGroups.map((bg) => ({
      blood_group: bg,
      available_units: mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Available').length,
      reserved_units: mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Reserved').length,
      issued_units: mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Issued').length,
      expired_units: mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Expired').length,
      total_available_volume_ml: mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Available').reduce((acc, curr) => acc + (curr.volume_ml || 0), 0)
    }));
  }
};

export const updateUnitStatus = async (id: number, status: string): Promise<BloodUnit> => {
  try {
    const res = await API.put(`/inventory/${id}/status`, { status });
    return res.data.data;
  } catch {
    const unit = mockStore.bloodUnits.find((u) => u.unit_id === Number(id));
    if (unit) {
      unit.status = status as any;
      mockStore.saveToLocalStorage();
    }
    return unit || mockStore.bloodUnits[0];
  }
};

// Requests
export const getRequests = async (params?: any): Promise<BloodRequest[]> => {
  try {
    const res = await API.get('/requests', { params });
    return res.data.data;
  } catch {
    let res = [...mockStore.bloodRequests];
    if (params?.blood_group) res = res.filter((r) => r.blood_group === params.blood_group);
    if (params?.urgency) res = res.filter((r) => r.urgency === params.urgency);
    if (params?.request_status) res = res.filter((r) => r.request_status === params.request_status);
    return res;
  }
};

export const getRequestById = async (id: number): Promise<BloodRequest> => {
  try {
    const res = await API.get(`/requests/${id}`);
    return res.data.data;
  } catch {
    const req = mockStore.bloodRequests.find((r) => r.request_id === Number(id)) || mockStore.bloodRequests[0];
    const compatible = req ? mockStore.bloodUnits.filter((u) => (u.blood_group === req.blood_group || u.blood_group === 'O-') && u.status === 'Available') : [];
    return {
      ...req,
      compatible_units: compatible,
      issued_records: []
    };
  }
};

export const createRequest = async (data: Partial<BloodRequest>): Promise<BloodRequest> => {
  try {
    const res = await API.post('/requests', data);
    return res.data.data;
  } catch {
    const hosp = mockStore.hospitals.find((h) => h.hospital_id === Number(data.hospital_id));
    const reqId = mockStore.bloodRequests.length > 0 ? Math.max(...mockStore.bloodRequests.map((r) => r.request_id)) + 1 : 1;
    const newReq: BloodRequest = {
      request_id: reqId,
      hospital_id: data.hospital_id || 1,
      hospital_name: hosp?.hospital_name || 'Hospital',
      hospital_city: hosp?.city || 'Mumbai',
      emergency_contact: hosp?.emergency_contact || '+91 99999 99999',
      patient_id: data.patient_id || null,
      patient_name: data.patient_name || 'Patient',
      blood_group: data.blood_group || 'A+',
      component_type: data.component_type || 'Whole Blood',
      units_required: data.units_required || 2,
      request_date: new Date().toISOString().split('T')[0],
      required_by: data.required_by || '2026-09-30',
      urgency: data.urgency || 'Normal',
      request_status: 'Pending'
    };
    mockStore.bloodRequests.unshift(newReq);
    mockStore.saveToLocalStorage();
    return newReq;
  }
};

export const updateRequestStatus = async (id: number, request_status: string): Promise<BloodRequest> => {
  try {
    const res = await API.put(`/requests/${id}/status`, { request_status });
    return res.data.data;
  } catch {
    const req = mockStore.bloodRequests.find((r) => r.request_id === Number(id));
    if (req) {
      req.request_status = request_status as any;
      mockStore.saveToLocalStorage();
    }
    return req || mockStore.bloodRequests[0];
  }
};

// Blood Issue Workflow
export const getIssues = async (params?: any): Promise<BloodIssue[]> => {
  try {
    const res = await API.get('/issues', { params });
    return res.data.data;
  } catch {
    return mockStore.bloodIssues;
  }
};

export const issueBloodUnits = async (data: { request_id: number; unit_ids: number[]; issued_by: string }): Promise<any> => {
  try {
    const res = await API.post('/issues', data);
    return res.data;
  } catch {
    const req = mockStore.bloodRequests.find((r) => r.request_id === data.request_id);
    if (req) req.request_status = 'Fulfilled';

    data.unit_ids.forEach((uid) => {
      const u = mockStore.bloodUnits.find((unit) => unit.unit_id === uid);
      if (u) u.status = 'Issued';
    });

    const issueId = mockStore.bloodIssues.length > 0 ? Math.max(...mockStore.bloodIssues.map((i) => i.issue_id)) + 1 : 1;
    const unit = mockStore.bloodUnits.find((u) => u.unit_id === data.unit_ids[0]);
    mockStore.bloodIssues.unshift({
      issue_id: issueId,
      request_id: data.request_id,
      unit_id: data.unit_ids[0] || 1,
      issue_date: new Date().toISOString().split('T')[0],
      issued_by: data.issued_by || 'Staff',
      quantity_ml: unit?.volume_ml || 450,
      blood_group: unit?.blood_group || 'O+',
      component_type: unit?.component_type || 'Whole Blood',
      hospital_name: req?.hospital_name || 'Hospital'
    });

    mockStore.saveToLocalStorage();

    return {
      success: true,
      message: `Successfully issued ${data.unit_ids.length} unit(s). Request updated to Fulfilled.`,
      data: { request_status: 'Fulfilled' }
    };
  }
};

// Hospitals
export const getHospitals = async (params?: any): Promise<Hospital[]> => {
  try {
    const res = await API.get('/hospitals', { params });
    return res.data.data;
  } catch {
    let res = [...mockStore.hospitals];
    if (params?.search) {
      const q = params.search.toLowerCase();
      res = res.filter((h) => h.hospital_name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q));
    }
    return res;
  }
};

export const getHospitalById = async (id: number): Promise<any> => {
  try {
    const res = await API.get(`/hospitals/${id}`);
    return res.data.data;
  } catch {
    const h = mockStore.hospitals.find((item) => item.hospital_id === Number(id));
    if (!h) {
      return { hospital_id: id, hospital_name: 'Unknown Hospital', address: '', city: '', phone: '', email: '', emergency_contact: '', patients: [], blood_requests: [] };
    }
    const p = mockStore.patients.filter((item) => item.hospital_id === h.hospital_id);
    const reqs = mockStore.bloodRequests.filter((item) => item.hospital_id === h.hospital_id);
    return { ...h, patients: p, blood_requests: reqs };
  }
};

export const createHospital = async (data: Partial<Hospital>): Promise<Hospital> => {
  try {
    const res = await API.post('/hospitals', data);
    return res.data.data;
  } catch {
    const hospId = mockStore.hospitals.length > 0 ? Math.max(...mockStore.hospitals.map((h) => h.hospital_id)) + 1 : 1;
    const newHosp: Hospital = {
      hospital_id: hospId,
      hospital_name: data.hospital_name || 'Hospital',
      address: data.address || 'Address',
      city: data.city || 'Mumbai',
      phone: data.phone || '+91 99000 00000',
      email: data.email || 'hospital@lifelink.org',
      emergency_contact: data.emergency_contact || '+91 99999 99999'
    };
    mockStore.hospitals.unshift(newHosp);
    mockStore.saveToLocalStorage();
    return newHosp;
  }
};

export const updateHospital = async (id: number, data: Partial<Hospital>): Promise<Hospital> => {
  try {
    const res = await API.put(`/hospitals/${id}`, data);
    return res.data.data;
  } catch {
    const idx = mockStore.hospitals.findIndex((h) => h.hospital_id === Number(id));
    if (idx !== -1) {
      mockStore.hospitals[idx] = { ...mockStore.hospitals[idx], ...data };
      mockStore.saveToLocalStorage();
      return mockStore.hospitals[idx];
    }
    throw new Error('Hospital not found');
  }
};

export const deleteHospital = async (id: number): Promise<void> => {
  try {
    await API.delete(`/hospitals/${id}`);
  } catch {
    mockStore.hospitals = mockStore.hospitals.filter((h) => h.hospital_id !== Number(id));
    mockStore.saveToLocalStorage();
  }
};

// Patients
export const getPatients = async (params?: any): Promise<Patient[]> => {
  try {
    const res = await API.get('/patients', { params });
    return res.data.data;
  } catch {
    let res = [...mockStore.patients];
    if (params?.search) {
      const q = params.search.toLowerCase();
      res = res.filter((p) => p.patient_name.toLowerCase().includes(q));
    }
    return res;
  }
};

export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
  try {
    const res = await API.post('/patients', data);
    return res.data.data;
  } catch {
    const patId = mockStore.patients.length > 0 ? Math.max(...mockStore.patients.map((p) => p.patient_id)) + 1 : 1;
    const newPatient: Patient = {
      patient_id: patId,
      hospital_id: data.hospital_id || 1,
      patient_name: data.patient_name || 'Patient',
      date_of_birth: data.date_of_birth || '1990-01-01',
      gender: data.gender || 'Male',
      blood_group: data.blood_group || 'A+',
      contact_number: data.contact_number || '+91 99000 00000',
      medical_notes: data.medical_notes || ''
    };
    mockStore.patients.unshift(newPatient);
    mockStore.saveToLocalStorage();
    return newPatient;
  }
};

export const updatePatient = async (id: number, data: Partial<Patient>): Promise<Patient> => {
  try {
    const res = await API.put(`/patients/${id}`, data);
    return res.data.data;
  } catch {
    const idx = mockStore.patients.findIndex((p) => p.patient_id === Number(id));
    if (idx !== -1) {
      mockStore.patients[idx] = { ...mockStore.patients[idx], ...data };
      mockStore.saveToLocalStorage();
      return mockStore.patients[idx];
    }
    throw new Error('Patient not found');
  }
};

export const deletePatient = async (id: number): Promise<void> => {
  try {
    await API.delete(`/patients/${id}`);
  } catch {
    mockStore.patients = mockStore.patients.filter((p) => p.patient_id !== Number(id));
    mockStore.saveToLocalStorage();
  }
};

// Staff & Centers
export const getStaff = async (params?: any): Promise<Staff[]> => {
  try {
    const res = await API.get('/staff', { params });
    return res.data.data;
  } catch {
    return mockStore.staff;
  }
};

export const getDonationCenters = async (): Promise<DonationCenter[]> => {
  try {
    const res = await API.get('/centers');
    return res.data.data;
  } catch {
    return mockStore.donationCenters;
  }
};

export const createStaff = async (data: Partial<Staff>): Promise<Staff> => {
  try {
    const res = await API.post('/staff', data);
    return res.data.data;
  } catch {
    const staffId = mockStore.staff.length > 0 ? Math.max(...mockStore.staff.map((s) => s.staff_id)) + 1 : 1;
    const newStaff: Staff = {
      staff_id: staffId,
      center_id: data.center_id || 1,
      center_name: 'Center',
      full_name: data.full_name || 'Staff Member',
      role: data.role || 'Phlebotomist',
      phone: data.phone || '+91 99000 00000',
      email: data.email || 'staff@lifelink.org'
    };
    mockStore.staff.unshift(newStaff);
    mockStore.saveToLocalStorage();
    return newStaff;
  }
};

export const updateStaff = async (id: number, data: Partial<Staff>): Promise<Staff> => {
  try {
    const res = await API.put(`/staff/${id}`, data);
    return res.data.data;
  } catch {
    const idx = mockStore.staff.findIndex((s) => s.staff_id === Number(id));
    if (idx !== -1) {
      mockStore.staff[idx] = { ...mockStore.staff[idx], ...data };
      mockStore.saveToLocalStorage();
      return mockStore.staff[idx];
    }
    throw new Error('Staff member not found');
  }
};

export const deleteStaff = async (id: number): Promise<void> => {
  try {
    await API.delete(`/staff/${id}`);
  } catch {
    mockStore.staff = mockStore.staff.filter((s) => s.staff_id !== Number(id));
    mockStore.saveToLocalStorage();
  }
};

// SQL Analytics
export const getAnalyticsQueries = async (): Promise<SqlQueryResult[]> => {
  try {
    const res = await API.get('/analytics/queries');
    return res.data.data;
  } catch {
    return PREDEFINED_QUERIES.map((q) => {
      let rows: any[] = [];
      if (q.id === 1) {
        const groups: Record<string, { count: number; volume: number }> = {};
        mockStore.bloodUnits.filter((u) => u.status === 'Available').forEach((u) => {
          const key = `${u.blood_group}_${u.component_type}`;
          if (!groups[key]) groups[key] = { count: 0, volume: 0 };
          groups[key].count++;
          groups[key].volume += u.volume_ml;
        });
        rows = Object.entries(groups).map(([key, val]) => {
          const [bg, comp] = key.split('_');
          return { blood_group: bg, component_type: comp, available_units: val.count, total_volume_ml: val.volume };
        });
      } else if (q.id === 2) {
        const groups: Record<string, { total: number; eligible: number }> = {};
        mockStore.donors.forEach((d) => {
          if (!groups[d.blood_group]) groups[d.blood_group] = { total: 0, eligible: 0 };
          groups[d.blood_group].total++;
          if (d.eligibility_status === 'Eligible') groups[d.blood_group].eligible++;
        });
        rows = Object.entries(groups).map(([bg, val]) => ({ blood_group: bg, total_donors: val.total, eligible_donors: val.eligible }));
      } else if (q.id === 5) {
        const counts: Record<number, number> = {};
        mockStore.donations.forEach((d) => {
          counts[d.donor_id] = (counts[d.donor_id] || 0) + 1;
        });
        rows = mockStore.donors
          .filter((d) => counts[d.donor_id] > 1)
          .map((d) => ({ donor_id: d.donor_id, full_name: d.full_name, blood_group: d.blood_group, phone: d.phone, total_donations: counts[d.donor_id], last_donation: d.last_donation_date || 'N/A' }));
      } else if (q.id === 6) {
        rows = mockStore.bloodRequests
          .filter((r) => r.urgency === 'Emergency' && (r.request_status === 'Pending' || r.request_status === 'Approved'))
          .map((r) => ({ request_id: r.request_id, hospital_name: r.hospital_name, emergency_contact: r.emergency_contact, patient_name: r.patient_name || 'N/A', blood_group: r.blood_group, units_required: r.units_required }));
      }
      return {
        ...q,
        execution_time_ms: 1,
        rows,
        row_count: rows.length
      };
    });
  }
};

export const executeCustomSql = async (sql: string): Promise<any> => {
  try {
    const res = await API.post('/analytics/custom', { sql });
    return res.data;
  } catch {
    return {
      success: true,
      execution_time_ms: 2,
      columns: ['donor_id', 'full_name', 'blood_group', 'city'],
      rows: mockStore.donors.slice(0, 5).map((d) => ({
        donor_id: d.donor_id,
        full_name: d.full_name,
        blood_group: d.blood_group,
        city: d.city
      })),
      row_count: mockStore.donors.length
    };
  }
};

// Auth & Session Management
export const DEMO_USERS: AuthUser[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Dr. Rajesh Verma',
    email: 'admin@lifelink.org',
    role: 'admin',
    badgeTitle: 'System Administrator'
  },
  {
    id: 2,
    username: 'staff',
    name: 'Pooja Sharma',
    email: 'staff@lifelink.org',
    role: 'staff',
    badgeTitle: 'Senior Phlebotomist'
  },
  {
    id: 3,
    username: 'hospital',
    name: 'Apex Healthcare Hub',
    email: 'hospital@apex.org',
    role: 'hospital',
    badgeTitle: 'Hospital Representative'
  },
  {
    id: 4,
    username: 'donor',
    name: 'Ananya Iyer',
    email: 'donor@lifelink.org',
    role: 'donor',
    badgeTitle: 'Registered Blood Donor'
  }
];

export const getCurrentUserSession = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem('lifelink_current_user');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed reading user session:', e);
  }
  return null;
};

export const setCurrentUserSession = (user: AuthUser | null): void => {
  if (user) {
    localStorage.setItem('lifelink_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('lifelink_current_user');
  }
};

export const loginUser = async (emailStr: string, passwordStr: string, requestedRole?: UserRole): Promise<AuthUser> => {
  try {
    const res = await API.post('/auth/login', { email: emailStr, password: passwordStr, role: requestedRole });
    const user: AuthUser = res.data.data;
    setCurrentUserSession(user);
    return user;
  } catch {
    const targetEmail = (emailStr || '').toLowerCase().trim();
    const found = DEMO_USERS.find(
      (u) => (u.email.toLowerCase() === targetEmail || u.username.toLowerCase() === targetEmail)
    );

    if (!found) {
      const customUser: AuthUser = {
        id: Date.now(),
        username: emailStr.split('@')[0] || 'user',
        name: emailStr.split('@')[0] || 'User',
        email: emailStr,
        role: requestedRole || 'admin',
        badgeTitle: (requestedRole || 'admin').toUpperCase()
      };
      setCurrentUserSession(customUser);
      return customUser;
    }

    const finalUser = requestedRole && found.role === 'admin' ? { ...found, role: requestedRole } : found;
    setCurrentUserSession(finalUser);
    return finalUser;
  }
};

export const logoutUser = (): void => {
  setCurrentUserSession(null);
};
