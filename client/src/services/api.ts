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
  SqlQueryResult
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
    // Fallback for static GitHub Pages deployment
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
    const stockMatrix: StockSummaryItem[] = allGroups.map((bg) => {
      const avail = mockStore.bloodUnits.filter((u) => u.blood_group === bg && u.status === 'Available').length;
      return {
        blood_group: bg,
        available_units: avail,
        reserved_units: 0,
        issued_units: 5,
        expired_units: 2,
        total_available_volume_ml: avail * 350
      };
    });

    return {
      total_donors: mockStore.donors.length,
      total_donations: 30,
      available_units: mockStore.bloodUnits.filter((u) => u.status === 'Available').length,
      available_volume_ml: 12500,
      pending_requests: mockStore.bloodRequests.length,
      emergency_requests: mockStore.bloodRequests.filter((r) => r.urgency === 'Emergency').length,
      total_hospitals: mockStore.hospitals.length,
      expiring_soon_count: 2,
      stock_matrix: stockMatrix,
      recent_emergency_requests: mockStore.bloodRequests.filter((r) => r.urgency === 'Emergency'),
      expiring_units_list: mockStore.bloodUnits.slice(0, 3),
      db_status: { isUsingPgMem: true, status: 'Running on Static GitHub Pages (Client Engine)' }
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
      result = result.filter((d) => d.full_name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.phone.includes(q));
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
    const d = mockStore.donors.find((item) => item.donor_id === Number(id)) || mockStore.donors[0];
    return {
      ...d,
      donation_history: [
        { donation_id: 101, donor_id: d.donor_id, donation_date: '2026-08-15', donation_center_id: 1, center_name: 'Red Cross Central Blood Bank', blood_volume_ml: 450, screening_status: 'Passed', donation_status: 'Completed' }
      ],
      total_donations: 1
    };
  }
};

export const createDonor = async (data: Partial<Donor>): Promise<Donor> => {
  try {
    const res = await API.post('/donors', data);
    return res.data.data;
  } catch {
    const newDonor: Donor = {
      donor_id: mockStore.donors.length + 1,
      full_name: data.full_name || 'New Donor',
      date_of_birth: data.date_of_birth || '1995-01-01',
      gender: data.gender || 'Male',
      blood_group: data.blood_group || 'O+',
      phone: data.phone || '+91 99000 00000',
      email: data.email || 'donor@lifelink.org',
      city: data.city || 'Mumbai',
      address: data.address || 'Address',
      last_donation_date: null,
      registration_date: new Date().toISOString().split('T')[0],
      eligibility_status: 'Eligible'
    };
    mockStore.donors.unshift(newDonor);
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
      return mockStore.donors[idx];
    }
    return mockStore.donors[0];
  }
};

export const deleteDonor = async (id: number): Promise<void> => {
  try {
    await API.delete(`/donors/${id}`);
  } catch {
    mockStore.donors = mockStore.donors.filter((d) => d.donor_id !== Number(id));
  }
};

// Donations
export const getDonations = async (params?: any): Promise<Donation[]> => {
  try {
    const res = await API.get('/donations', { params });
    return res.data.data;
  } catch {
    return mockStore.donors.slice(0, 15).map((d, i) => ({
      donation_id: i + 1,
      donor_id: d.donor_id,
      donor_name: d.full_name,
      blood_group: d.blood_group,
      donation_date: '2026-09-01',
      donation_center_id: 1,
      center_name: 'Red Cross Central Blood Bank',
      blood_volume_ml: 450,
      screening_status: 'Passed',
      donation_status: 'Completed'
    }));
  }
};

export const recordDonation = async (data: any): Promise<any> => {
  try {
    const res = await API.post('/donations', data);
    return res.data;
  } catch {
    const donor = mockStore.donors.find((d) => d.donor_id === Number(data.donor_id));
    const newUnit: BloodUnit = {
      unit_id: mockStore.bloodUnits.length + 100,
      donation_id: 999,
      donor_name: donor?.full_name || 'Donor',
      blood_group: donor?.blood_group || 'O+',
      collection_date: data.donation_date || new Date().toISOString().split('T')[0],
      expiry_date: '2026-11-01',
      volume_ml: data.blood_volume_ml || 450,
      component_type: data.component_type || 'Whole Blood',
      status: 'Available'
    };
    mockStore.bloodUnits.unshift(newUnit);
    return { success: true, message: 'Donation recorded in static mock database' };
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
      reserved_units: 0,
      issued_units: 3,
      expired_units: 1,
      total_available_volume_ml: 1200
    }));
  }
};

export const updateUnitStatus = async (id: number, status: string): Promise<BloodUnit> => {
  try {
    const res = await API.put(`/inventory/${id}/status`, { status });
    return res.data.data;
  } catch {
    const unit = mockStore.bloodUnits.find((u) => u.unit_id === Number(id));
    if (unit) unit.status = status as any;
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
    const compatible = mockStore.bloodUnits.filter((u) => (u.blood_group === req.blood_group || u.blood_group === 'O-') && u.status === 'Available');
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
    const newReq: BloodRequest = {
      request_id: mockStore.bloodRequests.length + 10,
      hospital_id: data.hospital_id || 1,
      hospital_name: hosp?.hospital_name || 'Hospital',
      hospital_city: hosp?.city || 'Mumbai',
      emergency_contact: hosp?.emergency_contact || '+91 99999 99999',
      patient_id: data.patient_id || null,
      patient_name: 'Patient',
      blood_group: data.blood_group || 'A+',
      component_type: data.component_type || 'Whole Blood',
      units_required: data.units_required || 2,
      request_date: new Date().toISOString().split('T')[0],
      required_by: data.required_by || '2026-09-30',
      urgency: data.urgency || 'Normal',
      request_status: 'Pending'
    };
    mockStore.bloodRequests.unshift(newReq);
    return newReq;
  }
};

export const updateRequestStatus = async (id: number, request_status: string): Promise<BloodRequest> => {
  try {
    const res = await API.put(`/requests/${id}/status`, { request_status });
    return res.data.data;
  } catch {
    const req = mockStore.bloodRequests.find((r) => r.request_id === Number(id));
    if (req) req.request_status = request_status as any;
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
    const h = mockStore.hospitals.find((item) => item.hospital_id === Number(id)) || mockStore.hospitals[0];
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
    const newHosp: Hospital = {
      hospital_id: mockStore.hospitals.length + 1,
      hospital_name: data.hospital_name || 'Hospital',
      address: data.address || 'Address',
      city: data.city || 'Mumbai',
      phone: data.phone || '+91 99000 00000',
      email: data.email || 'hospital@lifelink.org',
      emergency_contact: data.emergency_contact || '+91 99999 99999'
    };
    mockStore.hospitals.unshift(newHosp);
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
      return mockStore.hospitals[idx];
    }
    return mockStore.hospitals[0];
  }
};

export const deleteHospital = async (id: number): Promise<void> => {
  try {
    await API.delete(`/hospitals/${id}`);
  } catch {
    mockStore.hospitals = mockStore.hospitals.filter((h) => h.hospital_id !== Number(id));
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
    const newPatient: Patient = {
      patient_id: mockStore.patients.length + 1,
      hospital_id: data.hospital_id || 1,
      patient_name: data.patient_name || 'Patient',
      date_of_birth: data.date_of_birth || '1990-01-01',
      gender: data.gender || 'Male',
      blood_group: data.blood_group || 'A+',
      contact_number: data.contact_number || '+91 99000 00000',
      medical_notes: data.medical_notes || ''
    };
    mockStore.patients.unshift(newPatient);
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
      return mockStore.patients[idx];
    }
    return mockStore.patients[0];
  }
};

export const deletePatient = async (id: number): Promise<void> => {
  try {
    await API.delete(`/patients/${id}`);
  } catch {
    mockStore.patients = mockStore.patients.filter((p) => p.patient_id !== Number(id));
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
    const newStaff: Staff = {
      staff_id: mockStore.staff.length + 1,
      center_id: data.center_id || 1,
      center_name: 'Center',
      full_name: data.full_name || 'Staff Member',
      role: data.role || 'Phlebotomist',
      phone: data.phone || '+91 99000 00000',
      email: data.email || 'staff@lifelink.org'
    };
    mockStore.staff.unshift(newStaff);
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
      return mockStore.staff[idx];
    }
    return mockStore.staff[0];
  }
};

export const deleteStaff = async (id: number): Promise<void> => {
  try {
    await API.delete(`/staff/${id}`);
  } catch {
    mockStore.staff = mockStore.staff.filter((s) => s.staff_id !== Number(id));
  }
};

// SQL Analytics
export const getAnalyticsQueries = async (): Promise<SqlQueryResult[]> => {
  try {
    const res = await API.get('/analytics/queries');
    return res.data.data;
  } catch {
    return PREDEFINED_QUERIES.map((q) => ({
      ...q,
      execution_time_ms: Math.floor(Math.random() * 4) + 1,
      columns: ['blood_group', 'available_units', 'total_volume_ml'],
      rows: [
        { blood_group: 'O+', available_units: 8, total_volume_ml: 2800 },
        { blood_group: 'A+', available_units: 6, total_volume_ml: 2100 },
        { blood_group: 'B+', available_units: 5, total_volume_ml: 1750 },
        { blood_group: 'AB+', available_units: 3, total_volume_ml: 900 },
        { blood_group: 'O-', available_units: 4, total_volume_ml: 1400 }
      ],
      row_count: 5
    }));
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
      row_count: 5
    };
  }
};
