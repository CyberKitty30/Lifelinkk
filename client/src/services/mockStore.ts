// LifeLink Global Real-Time Cloud Database Store with Cross-Device Synchronization
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

const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0cc676f107542';

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

  isCloudSynced: boolean = false;
  lastCloudSync: string | null = null;
  syncListeners: Array<() => void> = [];

  constructor() {
    this.seedCentersOnly();
    this.loadFromLocalStorage();
    this.fetchFromCloud();
    this.startAutoCloudPoll();
  }

  addSyncListener(cb: () => void) {
    this.syncListeners.push(cb);
  }

  notifySyncListeners() {
    this.syncListeners.forEach((cb) => cb());
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

  async fetchFromCloud() {
    try {
      const res = await fetch(CLOUD_DB_URL);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const d = json.data;
          if (Array.isArray(d.donors)) this.donors = d.donors;
          if (Array.isArray(d.donations)) this.donations = d.donations;
          if (Array.isArray(d.bloodUnits)) this.bloodUnits = d.bloodUnits;
          if (Array.isArray(d.hospitals)) this.hospitals = d.hospitals;
          if (Array.isArray(d.patients)) this.patients = d.patients;
          if (Array.isArray(d.bloodRequests)) this.bloodRequests = d.bloodRequests;
          if (Array.isArray(d.bloodIssues)) this.bloodIssues = d.bloodIssues;
          if (Array.isArray(d.staff)) this.staff = d.staff;

          this.isCloudSynced = true;
          this.lastCloudSync = new Date().toLocaleTimeString();
          this.saveToLocalStorageOnly();
          this.notifySyncListeners();
        }
      }
    } catch (e) {
      console.warn('Cloud DB fetch fallback to local:', e);
    }
  }

  async pushToCloud() {
    try {
      const payload = {
        name: 'LifeLink Shared Global Database',
        data: {
          donors: this.donors,
          donations: this.donations,
          bloodUnits: this.bloodUnits,
          hospitals: this.hospitals,
          patients: this.patients,
          bloodRequests: this.bloodRequests,
          bloodIssues: this.bloodIssues,
          staff: this.staff
        }
      };

      const res = await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.isCloudSynced = true;
        this.lastCloudSync = new Date().toLocaleTimeString();
        this.notifySyncListeners();
      }
    } catch (e) {
      console.warn('Cloud DB push failed:', e);
    }
  }

  startAutoCloudPoll() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.fetchFromCloud();
      }, 4000);
    }
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
    this.saveToLocalStorageOnly();
    this.pushToCloud();
  }

  saveToLocalStorageOnly() {
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
    this.saveToLocalStorageOnly();
    this.pushToCloud();
  }
}

export const mockStore = new MockDataStore();
