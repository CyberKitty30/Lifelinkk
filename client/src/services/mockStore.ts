// LifeLink Client-Side Empty Database Store for Manual Data Entry
import {
  Donor,
  Donation,
  BloodUnit,
  BloodRequest,
  BloodIssue,
  Hospital,
  Patient,
  Staff,
  DonationCenter
} from '../types';

export class MockDataStore {
  donors: Donor[] = [];
  donationCenters: DonationCenter[] = [];
  staff: Staff[] = [];
  donations: Donation[] = [];
  bloodUnits: BloodUnit[] = [];
  hospitals: Hospital[] = [];
  patients: Patient[] = [];
  bloodRequests: BloodRequest[] = [];
  bloodIssues: BloodIssue[] = [];

  constructor() {
    this.seedCentersOnly();
  }

  seedCentersOnly() {
    // Keep initial donation centers as options for dropdowns
    this.donationCenters = [
      { center_id: 1, center_name: 'Red Cross Central Blood Bank', address: '12 MG Road, Fort', city: 'Mumbai', phone: '+91 98200 11223', operating_hours: '08:00 AM - 08:00 PM' },
      { center_id: 2, center_name: 'Apex Healthcare Donation Hub', address: '45 Park Street', city: 'Kolkata', phone: '+91 98300 22334', operating_hours: '09:00 AM - 06:00 PM' },
      { center_id: 3, center_name: 'City Care Blood Bank', address: '88 Anna Salai', city: 'Chennai', phone: '+91 98400 33445', operating_hours: '24 Hours Open' },
      { center_id: 4, center_name: 'Sanjeevani Blood Center', address: '102 Ring Road, Lajpat Nagar', city: 'Delhi', phone: '+91 98100 44556', operating_hours: '08:30 AM - 07:30 PM' },
      { center_id: 5, center_name: 'Sahyadri Life Line Center', address: '15 FC Road, Shivaji Nagar', city: 'Pune', phone: '+91 98500 55667', operating_hours: '09:00 AM - 05:00 PM' }
    ];

    // All entity lists start empty (0 donors, 0 hospitals, 0 patients, 0 units, 0 requests)
    this.donors = [];
    this.staff = [];
    this.donations = [];
    this.bloodUnits = [];
    this.hospitals = [];
    this.patients = [];
    this.bloodRequests = [];
    this.bloodIssues = [];
  }
}

export const mockStore = new MockDataStore();
