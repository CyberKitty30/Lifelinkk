export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ComponentType = 'Whole Blood' | 'RBC' | 'Plasma' | 'Platelets';
export type InventoryStatus = 'Available' | 'Reserved' | 'Issued' | 'Expired' | 'Discarded';
export type UrgencyLevel = 'Normal' | 'Urgent' | 'Emergency';
export type RequestStatus = 'Pending' | 'Approved' | 'Partially Fulfilled' | 'Fulfilled' | 'Rejected' | 'Cancelled';

export interface Donor {
  donor_id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: BloodGroup;
  phone: string;
  email: string;
  city: string;
  address: string;
  last_donation_date: string | null;
  registration_date: string;
  eligibility_status: 'Eligible' | 'Ineligible' | 'Deferred' | 'Pending';
  donation_history?: Donation[];
  total_donations?: number;
}

export interface DonationCenter {
  center_id: number;
  center_name: string;
  address: string;
  city: string;
  phone: string;
  operating_hours: string;
}

export interface Staff {
  staff_id: number;
  center_id: number | null;
  center_name?: string;
  full_name: string;
  role: string;
  phone: string;
  email: string;
}

export interface Donation {
  donation_id: number;
  donor_id: number;
  donor_name?: string;
  blood_group?: BloodGroup;
  donation_date: string;
  donation_center_id: number;
  center_name?: string;
  blood_volume_ml: number;
  screening_status: 'Passed' | 'Failed' | 'Pending';
  donation_status: 'Completed' | 'Incomplete' | 'Rejected';
}

export interface BloodUnit {
  unit_id: number;
  donation_id: number | null;
  donor_name?: string;
  blood_group: BloodGroup;
  collection_date: string;
  expiry_date: string;
  volume_ml: number;
  component_type: ComponentType;
  status: InventoryStatus;
}

export interface Hospital {
  hospital_id: number;
  hospital_name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  emergency_contact: string;
}

export interface Patient {
  patient_id: number;
  hospital_id: number;
  hospital_name?: string;
  patient_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: BloodGroup;
  contact_number: string;
  medical_notes: string;
}

export interface BloodRequest {
  request_id: number;
  hospital_id: number;
  hospital_name?: string;
  hospital_city?: string;
  emergency_contact?: string;
  patient_id: number | null;
  patient_name?: string;
  blood_group: BloodGroup;
  component_type: ComponentType;
  units_required: number;
  request_date: string;
  required_by: string;
  urgency: UrgencyLevel;
  request_status: RequestStatus;
  compatible_units?: BloodUnit[];
  issued_records?: BloodIssue[];
}

export interface BloodIssue {
  issue_id: number;
  request_id: number;
  unit_id: number;
  issue_date: string;
  issued_by: string;
  quantity_ml: number;
  blood_group?: BloodGroup;
  component_type?: ComponentType;
  hospital_name?: string;
}

export interface StockSummaryItem {
  blood_group: BloodGroup;
  available_units: number;
  reserved_units: number;
  issued_units: number;
  expired_units: number;
  total_available_volume_ml?: number;
}

export interface DashboardStats {
  total_donors: number;
  total_donations: number;
  available_units: number;
  available_volume_ml: number;
  pending_requests: number;
  emergency_requests: number;
  total_hospitals: number;
  expiring_soon_count: number;
  stock_matrix: StockSummaryItem[];
  recent_emergency_requests: BloodRequest[];
  expiring_units_list: BloodUnit[];
  db_status: { isUsingPgMem: boolean; status: string };
}

export interface SqlQueryResult {
  id: number;
  title: string;
  category: string;
  sqlConcepts: string[];
  description: string;
  sql: string;
  execution_time_ms: number;
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  error?: string;
}
