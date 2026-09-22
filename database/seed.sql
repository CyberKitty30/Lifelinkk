-- LifeLink: Blood Donation & Blood Bank Management System
-- Database Seed File with Realistic Sample Data (Indian Names & Cities)

-- 1. DONATION_CENTER SEED (5 Centers)
INSERT INTO DONATION_CENTER (center_name, address, city, phone, operating_hours) VALUES
('Red Cross Central Blood Bank', '12 MG Road, Fort', 'Mumbai', '+91 98200 11223', '08:00 AM - 08:00 PM'),
('Apex Healthcare Donation Hub', '45 Park Street', 'Kolkata', '+91 98300 22334', '09:00 AM - 06:00 PM'),
('City Care Blood Bank', '88 Anna Salai', 'Chennai', '+91 98400 33445', '24 Hours Open'),
('Sanjeevani Blood Center', '102 Ring Road, Lajpat Nagar', 'Delhi', '+91 98100 44556', '08:30 AM - 07:30 PM'),
('Sahyadri Life Line Center', '15 FC Road, Shivaji Nagar', 'Pune', '+91 98500 55667', '09:00 AM - 05:00 PM');

-- 2. STAFF SEED (10 Staff Members)
INSERT INTO STAFF (center_id, full_name, role, phone, email) VALUES
(1, 'Dr. Ramesh Kulkarni', 'Medical Officer', '+91 98201 10001', 'ramesh.kulkarni@lifelink.org'),
(1, 'Sunita Deshmukh', 'Senior Lab Technician', '+91 98201 10002', 'sunita.d@lifelink.org'),
(2, 'Subhash Chatterjee', 'Phlebotomist', '+91 98301 20001', 'subhash.c@lifelink.org'),
(2, 'Dr. Debjani Roy', 'Center Supervisor', '+91 98301 20002', 'debjani.roy@lifelink.org'),
(3, 'K. Vijayaraghavan', 'Blood Storage Manager', '+91 98401 30001', 'vijay.k@lifelink.org'),
(3, 'Meenakshi Sundaram', 'Phlebotomist', '+91 98401 30002', 'meenakshi.s@lifelink.org'),
(4, 'Dr. Ankit Verma', 'Medical Director', '+91 98101 40001', 'ankit.verma@lifelink.org'),
(4, 'Pooja Sharma', 'Lab Assistant', '+91 98101 40002', 'pooja.s@lifelink.org'),
(5, 'Sachin Tendulkar', 'Administrative Officer', '+91 98501 50001', 'sachin.admin@lifelink.org'),
(5, 'Dr. Smita Patil', 'Quality Assurance Specialist', '+91 98501 50002', 'smita.patil@lifelink.org');

-- 3. DONOR SEED (25 Donors)
INSERT INTO DONOR (full_name, date_of_birth, gender, blood_group, phone, email, city, address, last_donation_date, registration_date, eligibility_status) VALUES
('Aarav Mehta', '1992-05-14', 'Male', 'O+', '+91 99001 11001', 'aarav.mehta@gmail.com', 'Mumbai', 'A-401 Green Acres, Andheri West', '2026-08-15', '2024-01-10', 'Eligible'),
('Priya Sharma', '1995-11-20', 'Female', 'A+', '+91 99001 11002', 'priya.sharma@yahoo.com', 'Delhi', '72 Vasundhara Enclave', '2026-07-10', '2024-02-15', 'Eligible'),
('Rohan Verma', '1988-03-08', 'Male', 'B+', '+91 99001 11003', 'rohan.v@hotmail.com', 'Pune', '12 Swargate Colony', '2026-06-01', '2023-11-20', 'Eligible'),
('Ananya Iyer', '1998-09-25', 'Female', 'AB+', '+91 99001 11004', 'ananya.iyer@gmail.com', 'Chennai', '45 T. Nagar 3rd Main Rd', '2026-09-01', '2025-03-12', 'Eligible'),
('Vikram Singh', '1985-12-01', 'Male', 'O-', '+91 99001 11005', 'vikram.singh@gmail.com', 'Delhi', 'C-15 Connaught Place', '2026-04-12', '2023-05-19', 'Eligible'),
('Sneha Reddy', '2000-01-15', 'Female', 'B-', '+91 99001 11006', 'sneha.reddy@outlook.com', 'Mumbai', '502 Sea View Apartments, Bandra', '2026-08-01', '2024-07-01', 'Eligible'),
('Amitav Ghosh', '1990-07-19', 'Male', 'A-', '+91 99001 11007', 'amitav.ghosh@gmail.com', 'Kolkata', '19 Salt Lake Sector 2', '2026-05-22', '2024-04-15', 'Eligible'),
('Deepika Padukone', '1994-08-30', 'Female', 'AB-', '+91 99001 11008', 'deepika.p@gmail.com', 'Bengaluru', '88 Indiranagar 100ft Rd', NULL, '2026-08-20', 'Eligible'),
('Rajesh Khanna', '1982-04-10', 'Male', 'O+', '+91 99001 11009', 'rajesh.k@gmail.com', 'Mumbai', '10 Juhu Beach Road', '2026-08-28', '2022-09-10', 'Eligible'),
('Kavita Patel', '1997-02-18', 'Female', 'B+', '+91 99001 11010', 'kavita.patel@gmail.com', 'Ahmedabad', '301 Satellite Hub', '2026-07-25', '2025-01-05', 'Eligible'),
('Siddharth Malhotra', '1991-06-22', 'Male', 'A+', '+91 99001 11011', 'sid.malhotra@gmail.com', 'Delhi', '90 Defense Colony', '2026-08-10', '2023-12-01', 'Eligible'),
('Meera Mukherjee', '1996-10-05', 'Female', 'O+', '+91 99001 11012', 'meera.m@gmail.com', 'Kolkata', '14 Gariahat Road', '2026-09-05', '2024-06-18', 'Eligible'),
('Karan Johar', '1986-11-11', 'Male', 'AB+', '+91 99001 11013', 'karan.johar@gmail.com', 'Mumbai', '77 Carter Road, Bandra', '2026-03-15', '2023-08-22', 'Eligible'),
('Neha Nair', '1999-04-14', 'Female', 'A-', '+91 99001 11014', 'neha.nair@gmail.com', 'Kochi', '22 MG Road, Ernakulam', '2026-08-18', '2025-02-14', 'Eligible'),
('Titus Alexander', '1993-01-29', 'Male', 'B-', '+91 99001 11015', 'titus.a@gmail.com', 'Chennai', '101 Adyar Canal Rd', '2026-07-02', '2024-09-30', 'Eligible'),
('Pooja Hegde', '1995-10-13', 'Female', 'O-', '+91 99001 11016', 'pooja.h@gmail.com', 'Hyderabad', '55 Jubilee Hills', '2026-08-22', '2024-10-10', 'Eligible'),
('Gautam Gambhir', '1987-03-24', 'Male', 'B+', '+91 99001 11017', 'gautam.g@gmail.com', 'Delhi', '12 Karol Bagh Main Rd', '2026-09-12', '2023-04-05', 'Eligible'),
('Shreya Ghoshal', '1991-05-19', 'Female', 'A+', '+91 99001 11018', 'shreya.g@gmail.com', 'Kolkata', '8 Ballygunge Place', '2026-06-30', '2024-03-03', 'Eligible'),
('Arjun Kapoor', '1990-09-09', 'Male', 'O+', '+91 99001 11019', 'arjun.k@gmail.com', 'Mumbai', '40 Lokhandwala Complex', '2026-08-30', '2023-07-12', 'Eligible'),
('Radhika Apte', '1989-12-07', 'Female', 'B+', '+91 99001 11020', 'radhika.a@gmail.com', 'Pune', '66 Prabhat Road', '2026-09-10', '2024-11-01', 'Eligible'),
('Manish Malhotra', '1980-07-28', 'Male', 'AB-', '+91 99001 11021', 'manish.m@gmail.com', 'Mumbai', '18 Worli Sea Face', NULL, '2026-09-15', 'Eligible'),
('Tanvi Shah', '2001-03-17', 'Female', 'A+', '+91 99001 11022', 'tanvi.s@gmail.com', 'Ahmedabad', '9 CG Road', '2026-08-05', '2025-05-20', 'Eligible'),
('Varun Dhawan', '1993-04-24', 'Male', 'O+', '+91 99001 11023', 'varun.d@gmail.com', 'Mumbai', '12 Pali Hill, Bandra', '2026-09-02', '2023-10-15', 'Eligible'),
('Alia Bhatt', '1996-03-15', 'Female', 'B+', '+91 99001 11024', 'alia.b@gmail.com', 'Mumbai', '88 Juhu Tara Road', '2026-07-18', '2024-05-10', 'Eligible'),
('Sunil Chhetri', '1984-08-03', 'Male', 'O-', '+91 99001 11025', 'sunil.c@gmail.com', 'Bengaluru', '33 Koramangala 4th Block', '2026-09-14', '2022-01-01', 'Eligible');

-- 4. DONATION SEED (30 Donations)
INSERT INTO DONATION (donor_id, donation_date, donation_center_id, blood_volume_ml, screening_status, donation_status) VALUES
(1, '2026-08-15', 1, 450, 'Passed', 'Completed'),
(2, '2026-07-10', 4, 450, 'Passed', 'Completed'),
(3, '2026-06-01', 5, 450, 'Passed', 'Completed'),
(4, '2026-09-01', 3, 350, 'Passed', 'Completed'),
(5, '2026-04-12', 4, 450, 'Passed', 'Completed'),
(6, '2026-08-01', 1, 450, 'Passed', 'Completed'),
(7, '2026-05-22', 2, 450, 'Passed', 'Completed'),
(9, '2026-08-28', 1, 450, 'Passed', 'Completed'),
(10, '2026-07-25', 5, 450, 'Passed', 'Completed'),
(11, '2026-08-10', 4, 450, 'Passed', 'Completed'),
(12, '2026-09-05', 2, 450, 'Passed', 'Completed'),
(13, '2026-03-15', 1, 450, 'Passed', 'Completed'),
(14, '2026-08-18', 3, 450, 'Passed', 'Completed'),
(15, '2026-07-02', 3, 450, 'Passed', 'Completed'),
(16, '2026-08-22', 4, 450, 'Passed', 'Completed'),
(17, '2026-09-12', 4, 450, 'Passed', 'Completed'),
(18, '2026-06-30', 2, 450, 'Passed', 'Completed'),
(19, '2026-08-30', 1, 450, 'Passed', 'Completed'),
(20, '2026-09-10', 5, 450, 'Passed', 'Completed'),
(22, '2026-08-05', 5, 450, 'Passed', 'Completed'),
(23, '2026-09-02', 1, 450, 'Passed', 'Completed'),
(24, '2026-07-18', 1, 450, 'Passed', 'Completed'),
(25, '2026-09-14', 3, 450, 'Passed', 'Completed'),
(1, '2026-05-01', 1, 450, 'Passed', 'Completed'),
(2, '2026-03-01', 4, 450, 'Passed', 'Completed'),
(3, '2026-02-15', 5, 450, 'Passed', 'Completed'),
(5, '2025-12-10', 4, 450, 'Passed', 'Completed'),
(9, '2026-04-05', 1, 450, 'Passed', 'Completed'),
(11, '2026-04-01', 4, 450, 'Passed', 'Completed'),
(17, '2026-05-10', 4, 450, 'Passed', 'Completed');

-- 5. BLOOD_UNIT SEED (40 Blood Units derived from donations)
INSERT INTO BLOOD_UNIT (donation_id, blood_group, collection_date, expiry_date, volume_ml, component_type, status) VALUES
-- From Donation 1 (O+)
(1, 'O+', '2026-08-15', '2026-09-26', 300, 'RBC', 'Available'),
-- From Donation 2 (A+)
(2, 'A+', '2026-07-10', '2026-08-21', 450, 'Whole Blood', 'Expired'),
-- From Donation 3 (B+)
(3, 'B+', '2026-06-01', '2026-07-12', 300, 'RBC', 'Expired'),
-- From Donation 4 (AB+)
(4, 'AB+', '2026-09-01', '2026-10-13', 250, 'Plasma', 'Available'),
-- From Donation 5 (O-)
(5, 'O-', '2026-04-12', '2026-05-24', 450, 'Whole Blood', 'Issued'),
-- From Donation 6 (B-)
(6, 'B-', '2026-08-01', '2026-09-25', 300, 'RBC', 'Available'),
-- From Donation 7 (A-)
(7, 'A-', '2026-05-22', '2026-07-03', 450, 'Whole Blood', 'Issued'),
-- From Donation 8 (O+)
(8, 'O+', '2026-08-28', '2026-10-09', 300, 'RBC', 'Available'),
-- From Donation 9 (B+)
(9, 'B+', '2026-07-25', '2026-09-05', 450, 'Whole Blood', 'Expired'),
-- From Donation 10 (A+)
(10, 'A+', '2026-08-10', '2026-09-21', 300, 'RBC', 'Expired'),
-- From Donation 11 (O+)
(11, 'O+', '2026-09-05', '2026-10-17', 250, 'Plasma', 'Available'),
-- From Donation 12 (AB+)
(12, 'AB+', '2026-03-15', '2026-04-26', 450, 'Whole Blood', 'Issued'),
-- From Donation 13 (A-)
(13, 'A-', '2026-08-18', '2026-09-29', 300, 'RBC', 'Available'),
-- From Donation 14 (B-)
(14, 'B-', '2026-07-02', '2026-08-13', 450, 'Whole Blood', 'Issued'),
-- From Donation 15 (O-)
(15, 'O-', '2026-08-22', '2026-10-03', 300, 'RBC', 'Available'),
-- From Donation 16 (B+)
(16, 'B+', '2026-09-12', '2026-10-24', 450, 'Whole Blood', 'Available'),
-- From Donation 17 (A+)
(17, 'A+', '2026-06-30', '2026-08-11', 450, 'Whole Blood', 'Issued'),
-- From Donation 18 (O+)
(18, 'O+', '2026-08-30', '2026-10-11', 300, 'RBC', 'Available'),
-- From Donation 19 (B+)
(19, 'B+', '2026-09-10', '2026-10-22', 250, 'Plasma', 'Available'),
-- From Donation 20 (A+)
(20, 'A+', '2026-08-05', '2026-09-16', 300, 'RBC', 'Expired'),
-- From Donation 21 (O+)
(21, 'O+', '2026-09-02', '2026-10-14', 450, 'Whole Blood', 'Available'),
-- From Donation 22 (B+)
(22, 'B+', '2026-07-18', '2026-08-29', 450, 'Whole Blood', 'Issued'),
-- From Donation 23 (O-)
(23, 'O-', '2026-09-14', '2026-10-26', 300, 'RBC', 'Available'),
-- Additional units created from earlier batches for stock depth
(24, 'O+', '2026-09-18', '2026-10-30', 300, 'Platelets', 'Available'),
(25, 'A+', '2026-09-19', '2026-10-31', 300, 'RBC', 'Available'),
(26, 'B+', '2026-09-20', '2026-11-01', 250, 'Plasma', 'Available'),
(27, 'AB-', '2026-09-15', '2026-10-27', 300, 'RBC', 'Available'),
(28, 'O-', '2026-09-16', '2026-10-28', 250, 'Plasma', 'Available'),
(29, 'A-', '2026-09-17', '2026-10-29', 300, 'RBC', 'Available'),
(30, 'B-', '2026-09-18', '2026-10-30', 300, 'RBC', 'Available'),
(NULL, 'O+', '2026-09-21', '2026-10-02', 300, 'Platelets', 'Available'),
(NULL, 'A+', '2026-09-21', '2026-09-27', 300, 'RBC', 'Available'), -- Expiring soon
(NULL, 'B+', '2026-09-20', '2026-09-26', 250, 'Platelets', 'Available'), -- Expiring soon
(NULL, 'AB+', '2026-09-19', '2026-10-31', 300, 'RBC', 'Available'),
(NULL, 'O+', '2026-09-18', '2026-10-30', 450, 'Whole Blood', 'Available'),
(NULL, 'A+', '2026-09-17', '2026-10-29', 250, 'Plasma', 'Available'),
(NULL, 'B+', '2026-09-16', '2026-10-28', 300, 'RBC', 'Available'),
(NULL, 'O-', '2026-09-15', '2026-10-27', 450, 'Whole Blood', 'Available'),
(NULL, 'AB-', '2026-09-14', '2026-10-26', 250, 'Plasma', 'Available');

-- 6. HOSPITAL SEED (8 Hospitals)
INSERT INTO HOSPITAL (hospital_name, address, city, phone, email, emergency_contact) VALUES
('Lilavati Hospital & Research Centre', 'A-791 Bandra Reclamation', 'Mumbai', '+91 22 2675 1000', 'bloodbank@lilavatihospital.com', '+91 98200 99991'),
('AIIMS New Delhi', 'Sri Aurobindo Marg, Ansari Nagar', 'Delhi', '+91 11 2658 8500', 'emergency@aiims.edu', '+91 98100 99992'),
('Apollo Hospitals Greams Road', '21 Greams Lane', 'Chennai', '+91 44 2829 0200', 'bloodrequest@apollo.com', '+91 98400 99993'),
('Ruby Hall Clinic', '40 Sassoon Road', 'Pune', '+91 20 6645 5100', 'info@rubyhall.com', '+91 98500 99994'),
('Fortis Memorial Research Institute', 'Sector 44', 'Gurugram', '+91 124 4921 000', 'blooddesk@fortis.com', '+91 98101 99995'),
('AMRI Hospitals Dhakuria', 'P-238 CIT Scheme', 'Kolkata', '+91 33 2461 2100', 'bloodbank@amri.com', '+91 98300 99996'),
('Yashoda Hospitals Somajiguda', 'Raj Bhavan Road', 'Hyderabad', '+91 40 4567 4567', 'emergency@yashodamail.com', '+91 98401 99997'),
('Manipal Hospital Old Airport Rd', '98 HAL Old Airport Rd', 'Bengaluru', '+91 80 2502 4444', 'bloodbank@manipal.edu', '+91 98800 99998');

-- 7. PATIENT SEED (20 Patients)
INSERT INTO PATIENT (hospital_id, patient_name, date_of_birth, gender, blood_group, contact_number, medical_notes) VALUES
(1, 'Sunil Gavaskar', '1965-07-10', 'Male', 'O+', '+91 97001 10001', 'Scheduled knee replacement surgery'),
(1, 'Madhuri Dixit', '1970-05-15', 'Female', 'A+', '+91 97001 10002', 'Severe anemia post-chemotherapy'),
(2, 'Kapil Dev', '1959-01-06', 'Male', 'B+', '+91 97001 10003', 'Cardiac bypass procedure'),
(2, 'Sushmita Sen', '1975-11-19', 'Female', 'O-', '+91 97001 10004', 'Emergency trauma care - acute blood loss'),
(3, 'R. Madhavan', '1970-06-01', 'Male', 'AB+', '+91 97001 10005', 'Gastrointestinal bleeding'),
(3, 'Trisha Krishnan', '1983-05-04', 'Female', 'A-', '+91 97001 10006', 'High-risk maternity delivery'),
(4, 'Vikram Gokhale', '1960-10-14', 'Male', 'O+', '+91 97001 10007', 'Dialysis patient low hemoglobin'),
(4, 'Amruta Khanvilkar', '1984-11-23', 'Female', 'B-', '+91 97001 10008', 'Thalassemia major blood transfusion'),
(5, 'Yuvraj Singh', '1981-12-12', 'Male', 'A+', '+91 97001 10009', 'Oncology unit routine transfusion'),
(5, 'Geeta Phogat', '1988-12-15', 'Female', 'O+', '+91 97001 10010', 'ACL reconstruction surgery'),
(6, 'Sourav Ganguly', '1972-07-08', 'Male', 'B+', '+91 97001 10011', 'Angioplasty procedure support'),
(6, 'Rupali Ganguly', '1977-04-05', 'Female', 'AB-', '+91 97001 10012', 'Severe dengue fever platelet drop'),
(7, 'Sania Mirza', '1986-11-15', 'Female', 'O-', '+91 97001 10013', 'Trauma ward road accident'),
(7, 'Nagarjuna Akkineni', '1959-08-29', 'Male', 'A+', '+91 97001 10014', 'Abdominal surgery preparation'),
(8, 'Rahul Dravid', '1973-01-11', 'Male', 'O+', '+91 97001 10015', 'Orthopedic surgery'),
(8, 'Anushka Shetty', '1981-11-07', 'Female', 'B+', '+91 97001 10016', 'Chronic anemia treatment'),
(1, 'Kirron Kher', '1955-06-14', 'Female', 'A-', '+91 97001 10017', 'Bone marrow transplant support'),
(2, 'Shashi Tharoor', '1956-03-09', 'Male', 'AB+', '+91 97001 10018', 'Elective lumbar surgery'),
(3, 'Kamal Haasan', '1954-11-07', 'Male', 'O+', '+91 97001 10019', 'Post-operative recovery'),
(5, 'Mary Kom', '1982-11-24', 'Female', 'B-', '+91 97001 10020', 'Post-partum hemorrhage management');

-- 8. BLOOD_REQUEST SEED (25 Blood Requests)
INSERT INTO BLOOD_REQUEST (hospital_id, patient_id, blood_group, component_type, units_required, request_date, required_by, urgency, request_status) VALUES
(1, 1, 'O+', 'RBC', 2, '2026-09-20', '2026-09-23', 'Normal', 'Pending'),
(1, 2, 'A+', 'Whole Blood', 1, '2026-09-21', '2026-09-22', 'Emergency', 'Pending'),
(2, 3, 'B+', 'RBC', 3, '2026-09-18', '2026-09-20', 'Urgent', 'Approved'),
(2, 4, 'O-', 'Whole Blood', 2, '2026-09-21', '2026-09-21', 'Emergency', 'Fulfilled'),
(3, 5, 'AB+', 'Plasma', 2, '2026-09-15', '2026-09-18', 'Normal', 'Fulfilled'),
(3, 6, 'A-', 'Whole Blood', 1, '2026-09-10', '2026-09-12', 'Urgent', 'Fulfilled'),
(4, 7, 'O+', 'RBC', 1, '2026-09-22', '2026-09-24', 'Normal', 'Pending'),
(4, 8, 'B-', 'Whole Blood', 2, '2026-09-08', '2026-09-09', 'Emergency', 'Fulfilled'),
(5, 9, 'A+', 'Platelets', 2, '2026-09-21', '2026-09-23', 'Urgent', 'Pending'),
(5, 10, 'O+', 'RBC', 1, '2026-09-19', '2026-09-22', 'Normal', 'Approved'),
(6, 11, 'B+', 'RBC', 2, '2026-09-22', '2026-09-23', 'Emergency', 'Pending'),
(6, 12, 'AB-', 'Platelets', 3, '2026-09-21', '2026-09-22', 'Emergency', 'Pending'),
(7, 13, 'O-', 'RBC', 2, '2026-09-20', '2026-09-21', 'Emergency', 'Partially Fulfilled'),
(7, 14, 'A+', 'Plasma', 1, '2026-09-17', '2026-09-20', 'Normal', 'Fulfilled'),
(8, 15, 'O+', 'Whole Blood', 2, '2026-09-12', '2026-09-14', 'Normal', 'Fulfilled'),
(8, 16, 'B+', 'RBC', 1, '2026-09-14', '2026-09-16', 'Urgent', 'Fulfilled'),
(1, 17, 'A-', 'RBC', 2, '2026-09-21', '2026-09-23', 'Urgent', 'Pending'),
(2, 18, 'AB+', 'Whole Blood', 1, '2026-09-19', '2026-09-22', 'Normal', 'Approved'),
(3, 19, 'O+', 'Platelets', 2, '2026-09-22', '2026-09-24', 'Normal', 'Pending'),
(5, 20, 'B-', 'RBC', 2, '2026-09-16', '2026-09-18', 'Emergency', 'Fulfilled'),
(1, NULL, 'O+', 'RBC', 4, '2026-09-22', '2026-09-23', 'Emergency', 'Pending'),
(4, NULL, 'A+', 'Whole Blood', 2, '2026-09-15', '2026-09-17', 'Normal', 'Rejected'),
(6, NULL, 'B+', 'Plasma', 1, '2026-09-14', '2026-09-16', 'Normal', 'Cancelled'),
(7, NULL, 'O-', 'Whole Blood', 1, '2026-09-19', '2026-09-20', 'Urgent', 'Approved'),
(8, NULL, 'AB+', 'Platelets', 2, '2026-09-22', '2026-09-25', 'Normal', 'Pending');

-- 9. BLOOD_ISSUE SEED (15 Issue Records)
INSERT INTO BLOOD_ISSUE (request_id, unit_id, issue_date, issued_by, quantity_ml) VALUES
(4, 5, '2026-09-21 10:30:00', 'Dr. Ankit Verma', 450),
(6, 7, '2026-09-11 14:15:00', 'K. Vijayaraghavan', 450),
(5, 12, '2026-03-16 09:00:00', 'Dr. Ramesh Kulkarni', 450),
(8, 14, '2026-09-08 22:45:00', 'K. Vijayaraghavan', 450),
(14, 17, '2026-09-18 11:20:00', 'Sunita Deshmukh', 450),
(16, 22, '2026-09-15 16:40:00', 'Dr. Ramesh Kulkarni', 450),
(20, 6, '2026-09-17 18:10:00', 'Pooja Sharma', 300),
(13, 15, '2026-09-20 19:30:00', 'K. Vijayaraghavan', 300),
(15, 1, '2026-09-13 12:00:00', 'Dr. Ramesh Kulkarni', 300),
(15, 8, '2026-09-13 12:05:00', 'Dr. Ramesh Kulkarni', 300),
(5, 4, '2026-09-16 15:00:00', 'Subhash Chatterjee', 250),
(6, 13, '2026-09-11 14:20:00', 'Meenakshi Sundaram', 300),
(8, 30, '2026-09-08 22:50:00', 'Meenakshi Sundaram', 300),
(16, 16, '2026-09-15 16:45:00', 'Dr. Ramesh Kulkarni', 450),
(20, 23, '2026-09-17 18:15:00', 'Pooja Sharma', 300);
