-- LifeLink: Blood Donation & Blood Bank Management System
-- Empty Database Seed File (Ready for Custom Manual Data Entry)

-- Initial Donation Centers (Optional Starter Centers)
INSERT INTO DONATION_CENTER (center_name, address, city, phone, operating_hours) VALUES
('Red Cross Central Blood Bank', '12 MG Road, Fort', 'Mumbai', '+91 98200 11223', '08:00 AM - 08:00 PM'),
('Apex Healthcare Donation Hub', '45 Park Street', 'Kolkata', '+91 98300 22334', '09:00 AM - 06:00 PM'),
('City Care Blood Bank', '88 Anna Salai', 'Chennai', '+91 98400 33445', '24 Hours Open'),
('Sanjeevani Blood Center', '102 Ring Road, Lajpat Nagar', 'Delhi', '+91 98100 44556', '08:30 AM - 07:30 PM'),
('Sahyadri Life Line Center', '15 FC Road, Shivaji Nagar', 'Pune', '+91 98500 55667', '09:00 AM - 05:00 PM');

-- DONOR, DONATION, BLOOD_UNIT, HOSPITAL, PATIENT, BLOOD_REQUEST, BLOOD_ISSUE, STAFF tables start EMPTY.
-- Ready for manual entry via LifeLink forms and SQL INSERT statements.
