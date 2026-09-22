// LifeLink Client-Side In-Memory Fallback Engine for GitHub Pages Deployment
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
    this.seedAll();
  }

  seedAll() {
    // 1. Centers
    this.donationCenters = [
      { center_id: 1, center_name: 'Red Cross Central Blood Bank', address: '12 MG Road, Fort', city: 'Mumbai', phone: '+91 98200 11223', operating_hours: '08:00 AM - 08:00 PM' },
      { center_id: 2, center_name: 'Apex Healthcare Donation Hub', address: '45 Park Street', city: 'Kolkata', phone: '+91 98300 22334', operating_hours: '09:00 AM - 06:00 PM' },
      { center_id: 3, center_name: 'City Care Blood Bank', address: '88 Anna Salai', city: 'Chennai', phone: '+91 98400 33445', operating_hours: '24 Hours Open' },
      { center_id: 4, center_name: 'Sanjeevani Blood Center', address: '102 Ring Road, Lajpat Nagar', city: 'Delhi', phone: '+91 98100 44556', operating_hours: '08:30 AM - 07:30 PM' },
      { center_id: 5, center_name: 'Sahyadri Life Line Center', address: '15 FC Road, Shivaji Nagar', city: 'Pune', phone: '+91 98500 55667', operating_hours: '09:00 AM - 05:00 PM' }
    ];

    // 2. Staff
    this.staff = [
      { staff_id: 1, center_id: 1, center_name: 'Red Cross Central Blood Bank', full_name: 'Dr. Ramesh Kulkarni', role: 'Medical Officer', phone: '+91 98201 10001', email: 'ramesh.kulkarni@lifelink.org' },
      { staff_id: 2, center_id: 1, center_name: 'Red Cross Central Blood Bank', full_name: 'Sunita Deshmukh', role: 'Senior Lab Technician', phone: '+91 98201 10002', email: 'sunita.d@lifelink.org' },
      { staff_id: 3, center_id: 2, center_name: 'Apex Healthcare Donation Hub', full_name: 'Subhash Chatterjee', role: 'Phlebotomist', phone: '+91 98301 20001', email: 'subhash.c@lifelink.org' },
      { staff_id: 4, center_id: 2, center_name: 'Apex Healthcare Donation Hub', full_name: 'Dr. Debjani Roy', role: 'Center Supervisor', phone: '+91 98301 20002', email: 'debjani.roy@lifelink.org' },
      { staff_id: 5, center_id: 3, center_name: 'City Care Blood Bank', full_name: 'K. Vijayaraghavan', role: 'Blood Storage Manager', phone: '+91 98401 30001', email: 'vijay.k@lifelink.org' },
      { staff_id: 6, center_id: 3, center_name: 'City Care Blood Bank', full_name: 'Meenakshi Sundaram', role: 'Phlebotomist', phone: '+91 98401 30002', email: 'meenakshi.s@lifelink.org' },
      { staff_id: 7, center_id: 4, center_name: 'Sanjeevani Blood Center', full_name: 'Dr. Ankit Verma', role: 'Medical Director', phone: '+91 98101 40001', email: 'ankit.verma@lifelink.org' },
      { staff_id: 8, center_id: 4, center_name: 'Sanjeevani Blood Center', full_name: 'Pooja Sharma', role: 'Lab Assistant', phone: '+91 98101 40002', email: 'pooja.s@lifelink.org' },
      { staff_id: 9, center_id: 5, center_name: 'Sahyadri Life Line Center', full_name: 'Sachin Tendulkar', role: 'Administrative Officer', phone: '+91 98501 50001', email: 'sachin.admin@lifelink.org' },
      { staff_id: 10, center_id: 5, center_name: 'Sahyadri Life Line Center', full_name: 'Dr. Smita Patil', role: 'Quality Assurance Specialist', phone: '+91 98501 50002', email: 'smita.patil@lifelink.org' }
    ];

    // 3. Donors (25)
    this.donors = [
      { donor_id: 1, full_name: 'Aarav Mehta', date_of_birth: '1992-05-14', gender: 'Male', blood_group: 'O+', phone: '+91 99001 11001', email: 'aarav.mehta@gmail.com', city: 'Mumbai', address: 'A-401 Green Acres, Andheri West', last_donation_date: '2026-08-15', registration_date: '2024-01-10', eligibility_status: 'Eligible' },
      { donor_id: 2, full_name: 'Priya Sharma', date_of_birth: '1995-11-20', gender: 'Female', blood_group: 'A+', phone: '+91 99001 11002', email: 'priya.sharma@yahoo.com', city: 'Delhi', address: '72 Vasundhara Enclave', last_donation_date: '2026-07-10', registration_date: '2024-02-15', eligibility_status: 'Eligible' },
      { donor_id: 3, full_name: 'Rohan Verma', date_of_birth: '1988-03-08', gender: 'Male', blood_group: 'B+', phone: '+91 99001 11003', email: 'rohan.v@hotmail.com', city: 'Pune', address: '12 Swargate Colony', last_donation_date: '2026-06-01', registration_date: '2023-11-20', eligibility_status: 'Eligible' },
      { donor_id: 4, full_name: 'Ananya Iyer', date_of_birth: '1998-09-25', gender: 'Female', blood_group: 'AB+', phone: '+91 99001 11004', email: 'ananya.iyer@gmail.com', city: 'Chennai', address: '45 T. Nagar 3rd Main Rd', last_donation_date: '2026-09-01', registration_date: '2025-03-12', eligibility_status: 'Eligible' },
      { donor_id: 5, full_name: 'Vikram Singh', date_of_birth: '1985-12-01', gender: 'Male', blood_group: 'O-', phone: '+91 99001 11005', email: 'vikram.singh@gmail.com', city: 'Delhi', address: 'C-15 Connaught Place', last_donation_date: '2026-04-12', registration_date: '2023-05-19', eligibility_status: 'Eligible' },
      { donor_id: 6, full_name: 'Sneha Reddy', date_of_birth: '2000-01-15', gender: 'Female', blood_group: 'B-', phone: '+91 99001 11006', email: 'sneha.reddy@outlook.com', city: 'Mumbai', address: '502 Sea View Apartments, Bandra', last_donation_date: '2026-08-01', registration_date: '2024-07-01', eligibility_status: 'Eligible' },
      { donor_id: 7, full_name: 'Amitav Ghosh', date_of_birth: '1990-07-19', gender: 'Male', blood_group: 'A-', phone: '+91 99001 11007', email: 'amitav.ghosh@gmail.com', city: 'Kolkata', address: '19 Salt Lake Sector 2', last_donation_date: '2026-05-22', registration_date: '2024-04-15', eligibility_status: 'Eligible' },
      { donor_id: 8, full_name: 'Deepika Padukone', date_of_birth: '1994-08-30', gender: 'Female', blood_group: 'AB-', phone: '+91 99001 11008', email: 'deepika.p@gmail.com', city: 'Bengaluru', address: '88 Indiranagar 100ft Rd', last_donation_date: null, registration_date: '2026-08-20', eligibility_status: 'Eligible' },
      { donor_id: 9, full_name: 'Rajesh Khanna', date_of_birth: '1982-04-10', gender: 'Male', blood_group: 'O+', phone: '+91 99001 11009', email: 'rajesh.k@gmail.com', city: 'Mumbai', address: '10 Juhu Beach Road', last_donation_date: '2026-08-28', registration_date: '2022-09-10', eligibility_status: 'Eligible' },
      { donor_id: 10, full_name: 'Kavita Patel', date_of_birth: '1997-02-18', gender: 'Female', blood_group: 'B+', phone: '+91 99001 11010', email: 'kavita.patel@gmail.com', city: 'Ahmedabad', address: '301 Satellite Hub', last_donation_date: '2026-07-25', registration_date: '2025-01-05', eligibility_status: 'Eligible' },
      { donor_id: 11, full_name: 'Siddharth Malhotra', date_of_birth: '1991-06-22', gender: 'Male', blood_group: 'A+', phone: '+91 99001 11011', email: 'sid.malhotra@gmail.com', city: 'Delhi', address: '90 Defense Colony', last_donation_date: '2026-08-10', registration_date: '2023-12-01', eligibility_status: 'Eligible' },
      { donor_id: 12, full_name: 'Meera Mukherjee', date_of_birth: '1996-10-05', gender: 'Female', blood_group: 'O+', phone: '+91 99001 11012', email: 'meera.m@gmail.com', city: 'Kolkata', address: '14 Gariahat Road', last_donation_date: '2026-09-05', registration_date: '2024-06-18', eligibility_status: 'Eligible' },
      { donor_id: 13, full_name: 'Karan Johar', date_of_birth: '1986-11-11', gender: 'Male', blood_group: 'AB+', phone: '+91 99001 11013', email: 'karan.johar@gmail.com', city: 'Mumbai', address: '77 Carter Road, Bandra', last_donation_date: '2026-03-15', registration_date: '2023-08-22', eligibility_status: 'Eligible' },
      { donor_id: 14, full_name: 'Neha Nair', date_of_birth: '1999-04-14', gender: 'Female', blood_group: 'A-', phone: '+91 99001 11014', email: 'neha.nair@gmail.com', city: 'Kochi', address: '22 MG Road, Ernakulam', last_donation_date: '2026-08-18', registration_date: '2025-02-14', eligibility_status: 'Eligible' },
      { donor_id: 15, full_name: 'Titus Alexander', date_of_birth: '1993-01-29', gender: 'Male', blood_group: 'B-', phone: '+91 99001 11015', email: 'titus.a@gmail.com', city: 'Chennai', address: '101 Adyar Canal Rd', last_donation_date: '2026-07-02', registration_date: '2024-09-30', eligibility_status: 'Eligible' },
      { donor_id: 16, full_name: 'Pooja Hegde', date_of_birth: '1995-10-13', gender: 'Female', blood_group: 'O-', phone: '+91 99001 11016', email: 'pooja.h@gmail.com', city: 'Hyderabad', address: '55 Jubilee Hills', last_donation_date: '2026-08-22', registration_date: '2024-10-10', eligibility_status: 'Eligible' },
      { donor_id: 17, full_name: 'Gautam Gambhir', date_of_birth: '1987-03-24', gender: 'Male', blood_group: 'B+', phone: '+91 99001 11017', email: 'gautam.g@gmail.com', city: 'Delhi', address: '12 Karol Bagh Main Rd', last_donation_date: '2026-09-12', registration_date: '2023-04-05', eligibility_status: 'Eligible' },
      { donor_id: 18, full_name: 'Shreya Ghoshal', date_of_birth: '1991-05-19', gender: 'Female', blood_group: 'A+', phone: '+91 99001 11018', email: 'shreya.g@gmail.com', city: 'Kolkata', address: '8 Ballygunge Place', last_donation_date: '2026-06-30', registration_date: '2024-03-03', eligibility_status: 'Eligible' },
      { donor_id: 19, full_name: 'Arjun Kapoor', date_of_birth: '1990-09-09', gender: 'Male', blood_group: 'O+', phone: '+91 99001 11019', email: 'arjun.k@gmail.com', city: 'Mumbai', address: '40 Lokhandwala Complex', last_donation_date: '2026-08-30', registration_date: '2023-07-12', eligibility_status: 'Eligible' },
      { donor_id: 20, full_name: 'Radhika Apte', date_of_birth: '1989-12-07', gender: 'Female', blood_group: 'B+', phone: '+91 99001 11020', email: 'radhika.a@gmail.com', city: 'Pune', address: '66 Prabhat Road', last_donation_date: '2026-09-10', registration_date: '2024-11-01', eligibility_status: 'Eligible' },
      { donor_id: 21, full_name: 'Manish Malhotra', date_of_birth: '1980-07-28', gender: 'Male', blood_group: 'AB-', phone: '+91 99001 11021', email: 'manish.m@gmail.com', city: 'Mumbai', address: '18 Worli Sea Face', last_donation_date: null, registration_date: '2026-09-15', eligibility_status: 'Eligible' },
      { donor_id: 22, full_name: 'Tanvi Shah', date_of_birth: '2001-03-17', gender: 'Female', blood_group: 'A+', phone: '+91 99001 11022', email: 'tanvi.s@gmail.com', city: 'Ahmedabad', address: '9 CG Road', last_donation_date: '2026-08-05', registration_date: '2025-05-20', eligibility_status: 'Eligible' },
      { donor_id: 23, full_name: 'Varun Dhawan', date_of_birth: '1993-04-24', gender: 'Male', blood_group: 'O+', phone: '+91 99001 11023', email: 'varun.d@gmail.com', city: 'Mumbai', address: '12 Pali Hill, Bandra', last_donation_date: '2026-09-02', registration_date: '2023-10-15', eligibility_status: 'Eligible' },
      { donor_id: 24, full_name: 'Alia Bhatt', date_of_birth: '1996-03-15', gender: 'Female', blood_group: 'B+', phone: '+91 99001 11024', email: 'alia.b@gmail.com', city: 'Mumbai', address: '88 Juhu Tara Road', last_donation_date: '2026-07-18', registration_date: '2024-05-10', eligibility_status: 'Eligible' },
      { donor_id: 25, full_name: 'Sunil Chhetri', date_of_birth: '1984-08-03', gender: 'Male', blood_group: 'O-', phone: '+91 99001 11025', email: 'sunil.c@gmail.com', city: 'Bengaluru', address: '33 Koramangala 4th Block', last_donation_date: '2026-09-14', registration_date: '2022-01-01', eligibility_status: 'Eligible' }
    ];

    // 4. Hospitals (8)
    this.hospitals = [
      { hospital_id: 1, hospital_name: 'Lilavati Hospital & Research Centre', address: 'A-791 Bandra Reclamation', city: 'Mumbai', phone: '+91 22 2675 1000', email: 'bloodbank@lilavatihospital.com', emergency_contact: '+91 98200 99991' },
      { hospital_id: 2, hospital_name: 'AIIMS New Delhi', address: 'Sri Aurobindo Marg, Ansari Nagar', city: 'Delhi', phone: '+91 11 2658 8500', email: 'emergency@aiims.edu', emergency_contact: '+91 98100 99992' },
      { hospital_id: 3, hospital_name: 'Apollo Hospitals Greams Road', address: '21 Greams Lane', city: 'Chennai', phone: '+91 44 2829 0200', email: 'bloodrequest@apollo.com', emergency_contact: '+91 98400 99993' },
      { hospital_id: 4, hospital_name: 'Ruby Hall Clinic', address: '40 Sassoon Road', city: 'Pune', phone: '+91 20 6645 5100', email: 'info@rubyhall.com', emergency_contact: '+91 98500 99994' },
      { hospital_id: 5, hospital_name: 'Fortis Memorial Research Institute', address: 'Sector 44', city: 'Gurugram', phone: '+91 124 4921 000', email: 'blooddesk@fortis.com', emergency_contact: '+91 98101 99995' },
      { hospital_id: 6, hospital_name: 'AMRI Hospitals Dhakuria', address: 'P-238 CIT Scheme', city: 'Kolkata', phone: '+91 33 2461 2100', email: 'bloodbank@amri.com', emergency_contact: '+91 98300 99996' },
      { hospital_id: 7, hospital_name: 'Yashoda Hospitals Somajiguda', address: 'Raj Bhavan Road', city: 'Hyderabad', phone: '+91 40 4567 4567', email: 'emergency@yashodamail.com', emergency_contact: '+91 98401 99997' },
      { hospital_id: 8, hospital_name: 'Manipal Hospital Old Airport Rd', address: '98 HAL Old Airport Rd', city: 'Bengaluru', phone: '+91 80 2502 4444', email: 'bloodbank@manipal.edu', emergency_contact: '+91 98800 99998' }
    ];

    // 5. Patients (20)
    this.patients = [
      { patient_id: 1, hospital_id: 1, hospital_name: 'Lilavati Hospital & Research Centre', patient_name: 'Sunil Gavaskar', date_of_birth: '1965-07-10', gender: 'Male', blood_group: 'O+', contact_number: '+91 97001 10001', medical_notes: 'Scheduled knee replacement surgery' },
      { patient_id: 2, hospital_id: 1, hospital_name: 'Lilavati Hospital & Research Centre', patient_name: 'Madhuri Dixit', date_of_birth: '1970-05-15', gender: 'Female', blood_group: 'A+', contact_number: '+91 97001 10002', medical_notes: 'Severe anemia post-chemotherapy' },
      { patient_id: 3, hospital_id: 2, hospital_name: 'AIIMS New Delhi', patient_name: 'Kapil Dev', date_of_birth: '1959-01-06', gender: 'Male', blood_group: 'B+', contact_number: '+91 97001 10003', medical_notes: 'Cardiac bypass procedure' },
      { patient_id: 4, hospital_id: 2, hospital_name: 'AIIMS New Delhi', patient_name: 'Sushmita Sen', date_of_birth: '1975-11-19', gender: 'Female', blood_group: 'O-', contact_number: '+91 97001 10004', medical_notes: 'Emergency trauma care - acute blood loss' },
      { patient_id: 5, hospital_id: 3, hospital_name: 'Apollo Hospitals Greams Road', patient_name: 'R. Madhavan', date_of_birth: '1970-06-01', gender: 'Male', blood_group: 'AB+', contact_number: '+91 97001 10005', medical_notes: 'Gastrointestinal bleeding' },
      { patient_id: 6, hospital_id: 3, hospital_name: 'Apollo Hospitals Greams Road', patient_name: 'Trisha Krishnan', date_of_birth: '1983-05-04', gender: 'Female', blood_group: 'A-', contact_number: '+91 97001 10006', medical_notes: 'High-risk maternity delivery' },
      { patient_id: 7, hospital_id: 4, hospital_name: 'Ruby Hall Clinic', patient_name: 'Vikram Gokhale', date_of_birth: '1960-10-14', gender: 'Male', blood_group: 'O+', contact_number: '+91 97001 10007', medical_notes: 'Dialysis patient low hemoglobin' },
      { patient_id: 8, hospital_id: 4, hospital_name: 'Ruby Hall Clinic', patient_name: 'Amruta Khanvilkar', date_of_birth: '1984-11-23', gender: 'Female', blood_group: 'B-', contact_number: '+91 97001 10008', medical_notes: 'Thalassemia major blood transfusion' },
      { patient_id: 9, hospital_id: 5, hospital_name: 'Fortis Memorial Research Institute', patient_name: 'Yuvraj Singh', date_of_birth: '1981-12-12', gender: 'Male', blood_group: 'A+', contact_number: '+91 97001 10009', medical_notes: 'Oncology unit routine transfusion' },
      { patient_id: 10, hospital_id: 5, hospital_name: 'Fortis Memorial Research Institute', patient_name: 'Geeta Phogat', date_of_birth: '1988-12-15', gender: 'Female', blood_group: 'O+', contact_number: '+91 97001 10010', medical_notes: 'ACL reconstruction surgery' }
    ];

    // 6. Blood Units (30)
    this.bloodUnits = [
      { unit_id: 1, donation_id: 1, donor_name: 'Aarav Mehta', blood_group: 'O+', collection_date: '2026-08-15', expiry_date: '2026-09-26', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 4, donation_id: 4, donor_name: 'Ananya Iyer', blood_group: 'AB+', collection_date: '2026-09-01', expiry_date: '2026-10-13', volume_ml: 250, component_type: 'Plasma', status: 'Available' },
      { unit_id: 6, donation_id: 6, donor_name: 'Sneha Reddy', blood_group: 'B-', collection_date: '2026-08-01', expiry_date: '2026-09-25', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 8, donation_id: 8, donor_name: 'Rajesh Khanna', blood_group: 'O+', collection_date: '2026-08-28', expiry_date: '2026-10-09', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 11, donation_id: 11, donor_name: 'Meera Mukherjee', blood_group: 'O+', collection_date: '2026-09-05', expiry_date: '2026-10-17', volume_ml: 250, component_type: 'Plasma', status: 'Available' },
      { unit_id: 13, donation_id: 13, donor_name: 'Neha Nair', blood_group: 'A-', collection_date: '2026-08-18', expiry_date: '2026-09-29', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 15, donation_id: 15, donor_name: 'Pooja Hegde', blood_group: 'O-', collection_date: '2026-08-22', expiry_date: '2026-10-03', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 16, donation_id: 16, donor_name: 'Gautam Gambhir', blood_group: 'B+', collection_date: '2026-09-12', expiry_date: '2026-10-24', volume_ml: 450, component_type: 'Whole Blood', status: 'Available' },
      { unit_id: 18, donation_id: 18, donor_name: 'Arjun Kapoor', blood_group: 'O+', collection_date: '2026-08-30', expiry_date: '2026-10-11', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 19, donation_id: 19, donor_name: 'Radhika Apte', blood_group: 'B+', collection_date: '2026-09-10', expiry_date: '2026-10-22', volume_ml: 250, component_type: 'Plasma', status: 'Available' },
      { unit_id: 21, donation_id: 21, donor_name: 'Varun Dhawan', blood_group: 'O+', collection_date: '2026-09-02', expiry_date: '2026-10-14', volume_ml: 450, component_type: 'Whole Blood', status: 'Available' },
      { unit_id: 23, donation_id: 23, donor_name: 'Sunil Chhetri', blood_group: 'O-', collection_date: '2026-09-14', expiry_date: '2026-10-26', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 24, donation_id: null, donor_name: 'Emergency Reserve', blood_group: 'O+', collection_date: '2026-09-18', expiry_date: '2026-10-30', volume_ml: 300, component_type: 'Platelets', status: 'Available' },
      { unit_id: 25, donation_id: null, donor_name: 'Emergency Reserve', blood_group: 'A+', collection_date: '2026-09-19', expiry_date: '2026-10-31', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 26, donation_id: null, donor_name: 'Emergency Reserve', blood_group: 'B+', collection_date: '2026-09-20', expiry_date: '2026-11-01', volume_ml: 250, component_type: 'Plasma', status: 'Available' },
      { unit_id: 27, donation_id: null, donor_name: 'Emergency Reserve', blood_group: 'AB-', collection_date: '2026-09-15', expiry_date: '2026-10-27', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 28, donation_id: null, donor_name: 'Emergency Reserve', blood_group: 'O-', collection_date: '2026-09-16', expiry_date: '2026-10-28', volume_ml: 250, component_type: 'Plasma', status: 'Available' },
      { unit_id: 31, donation_id: null, donor_name: 'Expiring Unit', blood_group: 'A+', collection_date: '2026-09-21', expiry_date: '2026-09-27', volume_ml: 300, component_type: 'RBC', status: 'Available' },
      { unit_id: 32, donation_id: null, donor_name: 'Expiring Unit', blood_group: 'B+', collection_date: '2026-09-20', expiry_date: '2026-09-26', volume_ml: 250, component_type: 'Platelets', status: 'Available' }
    ];

    // 7. Blood Requests (10)
    this.bloodRequests = [
      { request_id: 1, hospital_id: 1, hospital_name: 'Lilavati Hospital & Research Centre', hospital_city: 'Mumbai', emergency_contact: '+91 98200 99991', patient_id: 1, patient_name: 'Sunil Gavaskar', blood_group: 'O+', component_type: 'RBC', units_required: 2, request_date: '2026-09-20', required_by: '2026-09-23', urgency: 'Normal', request_status: 'Pending' },
      { request_id: 2, hospital_id: 1, hospital_name: 'Lilavati Hospital & Research Centre', hospital_city: 'Mumbai', emergency_contact: '+91 98200 99991', patient_id: 2, patient_name: 'Madhuri Dixit', blood_group: 'A+', component_type: 'Whole Blood', units_required: 1, request_date: '2026-09-21', required_by: '2026-09-22', urgency: 'Emergency', request_status: 'Pending' },
      { request_id: 3, hospital_id: 2, hospital_name: 'AIIMS New Delhi', hospital_city: 'Delhi', emergency_contact: '+91 98100 99992', patient_id: 3, patient_name: 'Kapil Dev', blood_group: 'B+', component_type: 'RBC', units_required: 3, request_date: '2026-09-18', required_by: '2026-09-20', urgency: 'Urgent', request_status: 'Approved' },
      { request_id: 6, hospital_id: 6, hospital_name: 'AMRI Hospitals Dhakuria', hospital_city: 'Kolkata', emergency_contact: '+91 98300 99996', patient_id: 11, patient_name: 'Sourav Ganguly', blood_group: 'B+', component_type: 'RBC', units_required: 2, request_date: '2026-09-22', required_by: '2026-09-23', urgency: 'Emergency', request_status: 'Pending' }
    ];
  }
}

export const mockStore = new MockDataStore();
