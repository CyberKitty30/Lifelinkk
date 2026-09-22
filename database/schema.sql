-- LifeLink: Blood Donation & Blood Bank Management System
-- Database Schema (PostgreSQL 3NF Compliant)

DROP VIEW IF EXISTS pending_emergency_requests CASCADE;
DROP VIEW IF EXISTS available_blood_stock CASCADE;

DROP TABLE IF EXISTS BLOOD_ISSUE CASCADE;
DROP TABLE IF EXISTS BLOOD_REQUEST CASCADE;
DROP TABLE IF EXISTS PATIENT CASCADE;
DROP TABLE IF EXISTS HOSPITAL CASCADE;
DROP TABLE IF EXISTS BLOOD_UNIT CASCADE;
DROP TABLE IF EXISTS DONATION CASCADE;
DROP TABLE IF EXISTS STAFF CASCADE;
DROP TABLE IF EXISTS DONATION_CENTER CASCADE;
DROP TABLE IF EXISTS DONOR CASCADE;

-- 1. DONOR TABLE
CREATE TABLE DONOR (
    donor_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    last_donation_date DATE,
    registration_date DATE DEFAULT CURRENT_DATE,
    eligibility_status VARCHAR(20) DEFAULT 'Eligible' CHECK (eligibility_status IN ('Eligible', 'Ineligible', 'Deferred', 'Pending'))
);

-- 2. DONATION_CENTER TABLE
CREATE TABLE DONATION_CENTER (
    center_id SERIAL PRIMARY KEY,
    center_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    operating_hours VARCHAR(50) DEFAULT '9:00 AM - 5:00 PM'
);

-- 3. STAFF TABLE
CREATE TABLE STAFF (
    staff_id SERIAL PRIMARY KEY,
    center_id INT REFERENCES DONATION_CENTER(center_id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- 4. DONATION TABLE
CREATE TABLE DONATION (
    donation_id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL REFERENCES DONOR(donor_id) ON DELETE CASCADE,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    donation_center_id INT NOT NULL REFERENCES DONATION_CENTER(center_id) ON DELETE RESTRICT,
    blood_volume_ml INT NOT NULL CHECK (blood_volume_ml > 0 AND blood_volume_ml <= 600),
    screening_status VARCHAR(20) DEFAULT 'Passed' CHECK (screening_status IN ('Passed', 'Failed', 'Pending')),
    donation_status VARCHAR(20) DEFAULT 'Completed' CHECK (donation_status IN ('Completed', 'Incomplete', 'Rejected'))
);

-- 5. BLOOD_UNIT TABLE
CREATE TABLE BLOOD_UNIT (
    unit_id SERIAL PRIMARY KEY,
    donation_id INT UNIQUE REFERENCES DONATION(donation_id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    volume_ml INT NOT NULL CHECK (volume_ml > 0),
    component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('Whole Blood', 'RBC', 'Plasma', 'Platelets')),
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Issued', 'Expired', 'Discarded')),
    CONSTRAINT chk_expiry_after_collection CHECK (expiry_date >= collection_date)
);

-- 6. HOSPITAL TABLE
CREATE TABLE HOSPITAL (
    hospital_id SERIAL PRIMARY KEY,
    hospital_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    emergency_contact VARCHAR(20) NOT NULL
);

-- 7. PATIENT TABLE
CREATE TABLE PATIENT (
    patient_id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES HOSPITAL(hospital_id) ON DELETE CASCADE,
    patient_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    contact_number VARCHAR(20) NOT NULL,
    medical_notes TEXT
);

-- 8. BLOOD_REQUEST TABLE
CREATE TABLE BLOOD_REQUEST (
    request_id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL REFERENCES HOSPITAL(hospital_id) ON DELETE CASCADE,
    patient_id INT REFERENCES PATIENT(patient_id) ON DELETE SET NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('Whole Blood', 'RBC', 'Plasma', 'Platelets')),
    units_required INT NOT NULL CHECK (units_required > 0),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_by DATE NOT NULL,
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('Normal', 'Urgent', 'Emergency')),
    request_status VARCHAR(20) DEFAULT 'Pending' CHECK (request_status IN ('Pending', 'Approved', 'Partially Fulfilled', 'Fulfilled', 'Rejected', 'Cancelled'))
);

-- 9. BLOOD_ISSUE TABLE
CREATE TABLE BLOOD_ISSUE (
    issue_id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES BLOOD_REQUEST(request_id) ON DELETE CASCADE,
    unit_id INT NOT NULL UNIQUE REFERENCES BLOOD_UNIT(unit_id) ON DELETE RESTRICT,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_by VARCHAR(100) NOT NULL,
    quantity_ml INT NOT NULL CHECK (quantity_ml > 0)
);

-- SQL VIEWS FOR DBMS DEMONSTRATION

-- VIEW 1: Available Blood Stock Aggregated by Blood Group & Component
CREATE OR REPLACE VIEW available_blood_stock AS
SELECT 
    blood_group,
    component_type,
    COUNT(unit_id) AS available_units,
    SUM(volume_ml) AS total_volume_ml
FROM BLOOD_UNIT
WHERE status = 'Available' AND expiry_date >= CURRENT_DATE
GROUP BY blood_group, component_type;

-- VIEW 2: Pending Emergency Requests with Hospital & Patient details
CREATE OR REPLACE VIEW pending_emergency_requests AS
SELECT 
    br.request_id,
    h.hospital_name,
    h.city AS hospital_city,
    h.emergency_contact,
    p.patient_name,
    br.blood_group,
    br.component_type,
    br.units_required,
    br.request_date,
    br.required_by,
    br.urgency,
    br.request_status
FROM BLOOD_REQUEST br
JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
LEFT JOIN PATIENT p ON br.patient_id = p.patient_id
WHERE br.urgency = 'Emergency' AND br.request_status IN ('Pending', 'Approved');
