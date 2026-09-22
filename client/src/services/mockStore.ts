// LifeLink Client-Side Database Store with LocalStorage Persistence for Static Hosting
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
    this.checkVersionAndPurgeLegacy();
    this.seedCentersOnly();
    this.loadFromLocalStorage();
  }

  checkVersionAndPurgeLegacy() {
    try {
      const VERSION_TAG = 'lifelink_clean_db_v3';
      if (typeof localStorage !== 'undefined') {
        const storedVer = localStorage.getItem('lifelink_version_tag');
        if (storedVer !== VERSION_TAG) {
          this.clearAllData();
          localStorage.setItem('lifelink_version_tag', VERSION_TAG);
        }
      }
    } catch (e) {
      console.error('Failed version check:', e);
    }
  }

  seedCentersOnly() {
    this.donationCenters = [
      { center_id: 1, center_name: 'Red Cross Central Blood Bank', address: '12 MG Road, Fort', city: 'Mumbai', phone: '+91 98200 11223', operating_hours: '08:00 AM - 08:00 PM' },
      { center_id: 2, center_name: 'Apex Healthcare Donation Hub', address: '45 Park Street', city: 'Kolkata', phone: '+91 98300 22334', operating_hours: '09:00 AM - 06:00 PM' },
      { center_id: 3, center_name: 'City Care Blood Bank', address: '88 Anna Salai', city: 'Chennai', phone: '+91 98400 33445', operating_hours: '24 Hours Open' },
      { center_id: 4, center_name: 'Sanjeevani Blood Center', address: '102 Ring Road, Lajpat Nagar', city: 'Delhi', phone: '+91 98100 44556', operating_hours: '08:30 AM - 07:30 PM' },
      { center_id: 5, center_name: 'Sahyadri Life Line Center', address: '15 FC Road, Shivaji Nagar', city: 'Pune', phone: '+91 98500 55667', operating_hours: '09:00 AM - 05:00 PM' }
    ];
  }

  loadFromLocalStorage() {
    try {
      const storedDonors = localStorage.getItem('lifelink_donors');
      if (storedDonors) this.donors = JSON.parse(storedDonors);

      const storedHospitals = localStorage.getItem('lifelink_hospitals');
      if (storedHospitals) this.hospitals = JSON.parse(storedHospitals);

      const storedPatients = localStorage.getItem('lifelink_patients');
      if (storedPatients) this.patients = JSON.parse(storedPatients);

      const storedDonations = localStorage.getItem('lifelink_donations');
      if (storedDonations) this.donations = JSON.parse(storedDonations);

      const storedUnits = localStorage.getItem('lifelink_units');
      if (storedUnits) this.bloodUnits = JSON.parse(storedUnits);

      const storedRequests = localStorage.getItem('lifelink_requests');
      if (storedRequests) this.bloodRequests = JSON.parse(storedRequests);

      const storedIssues = localStorage.getItem('lifelink_issues');
      if (storedIssues) this.bloodIssues = JSON.parse(storedIssues);

      const storedStaff = localStorage.getItem('lifelink_staff');
      if (storedStaff) this.staff = JSON.parse(storedStaff);
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('lifelink_donors', JSON.stringify(this.donors));
      localStorage.setItem('lifelink_hospitals', JSON.stringify(this.hospitals));
      localStorage.setItem('lifelink_patients', JSON.stringify(this.patients));
      localStorage.setItem('lifelink_donations', JSON.stringify(this.donations));
      localStorage.setItem('lifelink_units', JSON.stringify(this.bloodUnits));
      localStorage.setItem('lifelink_requests', JSON.stringify(this.bloodRequests));
      localStorage.setItem('lifelink_issues', JSON.stringify(this.bloodIssues));
      localStorage.setItem('lifelink_staff', JSON.stringify(this.staff));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  clearAllData() {
    this.donors = [];
    this.staff = [];
    this.donations = [];
    this.bloodUnits = [];
    this.hospitals = [];
    this.patients = [];
    this.bloodRequests = [];
    this.bloodIssues = [];
    localStorage.removeItem('lifelink_donors');
    localStorage.removeItem('lifelink_hospitals');
    localStorage.removeItem('lifelink_patients');
    localStorage.removeItem('lifelink_donations');
    localStorage.removeItem('lifelink_units');
    localStorage.removeItem('lifelink_requests');
    localStorage.removeItem('lifelink_issues');
    localStorage.removeItem('lifelink_staff');
  }
}

export const mockStore = new MockDataStore();
