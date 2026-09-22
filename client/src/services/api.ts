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

const API = axios.create({
  baseURL: '/api'
});

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await API.get('/dashboard/stats');
  return res.data.data;
};

// Donors
export const getDonors = async (params?: any): Promise<Donor[]> => {
  const res = await API.get('/donors', { params });
  return res.data.data;
};

export const getDonorById = async (id: number): Promise<Donor> => {
  const res = await API.get(`/donors/${id}`);
  return res.data.data;
};

export const createDonor = async (data: Partial<Donor>): Promise<Donor> => {
  const res = await API.post('/donors', data);
  return res.data.data;
};

export const updateDonor = async (id: number, data: Partial<Donor>): Promise<Donor> => {
  const res = await API.put(`/donors/${id}`, data);
  return res.data.data;
};

export const deleteDonor = async (id: number): Promise<void> => {
  await API.delete(`/donors/${id}`);
};

// Donations
export const getDonations = async (params?: any): Promise<Donation[]> => {
  const res = await API.get('/donations', { params });
  return res.data.data;
};

export const recordDonation = async (data: any): Promise<any> => {
  const res = await API.post('/donations', data);
  return res.data;
};

// Inventory
export const getInventory = async (params?: any): Promise<BloodUnit[]> => {
  const res = await API.get('/inventory', { params });
  return res.data.data;
};

export const getStockSummary = async (): Promise<StockSummaryItem[]> => {
  const res = await API.get('/inventory/summary');
  return res.data.data;
};

export const updateUnitStatus = async (id: number, status: string): Promise<BloodUnit> => {
  const res = await API.put(`/inventory/${id}/status`, { status });
  return res.data.data;
};

// Requests
export const getRequests = async (params?: any): Promise<BloodRequest[]> => {
  const res = await API.get('/requests', { params });
  return res.data.data;
};

export const getRequestById = async (id: number): Promise<BloodRequest> => {
  const res = await API.get(`/requests/${id}`);
  return res.data.data;
};

export const createRequest = async (data: Partial<BloodRequest>): Promise<BloodRequest> => {
  const res = await API.post('/requests', data);
  return res.data.data;
};

export const updateRequestStatus = async (id: number, request_status: string): Promise<BloodRequest> => {
  const res = await API.put(`/requests/${id}/status`, { request_status });
  return res.data.data;
};

// Blood Issue Workflow
export const getIssues = async (params?: any): Promise<BloodIssue[]> => {
  const res = await API.get('/issues', { params });
  return res.data.data;
};

export const issueBloodUnits = async (data: { request_id: number; unit_ids: number[]; issued_by: string }): Promise<any> => {
  const res = await API.post('/issues', data);
  return res.data;
};

// Hospitals
export const getHospitals = async (params?: any): Promise<Hospital[]> => {
  const res = await API.get('/hospitals', { params });
  return res.data.data;
};

export const getHospitalById = async (id: number): Promise<any> => {
  const res = await API.get(`/hospitals/${id}`);
  return res.data.data;
};

export const createHospital = async (data: Partial<Hospital>): Promise<Hospital> => {
  const res = await API.post('/hospitals', data);
  return res.data.data;
};

export const updateHospital = async (id: number, data: Partial<Hospital>): Promise<Hospital> => {
  const res = await API.put(`/hospitals/${id}`, data);
  return res.data.data;
};

export const deleteHospital = async (id: number): Promise<void> => {
  await API.delete(`/hospitals/${id}`);
};

// Patients
export const getPatients = async (params?: any): Promise<Patient[]> => {
  const res = await API.get('/patients', { params });
  return res.data.data;
};

export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
  const res = await API.post('/patients', data);
  return res.data.data;
};

export const updatePatient = async (id: number, data: Partial<Patient>): Promise<Patient> => {
  const res = await API.put(`/patients/${id}`, data);
  return res.data.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await API.delete(`/patients/${id}`);
};

// Staff & Centers
export const getStaff = async (params?: any): Promise<Staff[]> => {
  const res = await API.get('/staff', { params });
  return res.data.data;
};

export const getDonationCenters = async (): Promise<DonationCenter[]> => {
  const res = await API.get('/centers');
  return res.data.data;
};

export const createStaff = async (data: Partial<Staff>): Promise<Staff> => {
  const res = await API.post('/staff', data);
  return res.data.data;
};

export const updateStaff = async (id: number, data: Partial<Staff>): Promise<Staff> => {
  const res = await API.put(`/staff/${id}`, data);
  return res.data.data;
};

export const deleteStaff = async (id: number): Promise<void> => {
  await API.delete(`/staff/${id}`);
};

// SQL Analytics
export const getAnalyticsQueries = async (): Promise<SqlQueryResult[]> => {
  const res = await API.get('/analytics/queries');
  return res.data.data;
};

export const executeCustomSql = async (sql: string): Promise<any> => {
  const res = await API.post('/analytics/custom', { sql });
  return res.data;
};
