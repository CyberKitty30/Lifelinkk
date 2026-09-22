-- LifeLink: Blood Donation & Blood Bank Management System
-- SQL Analytics Query Catalog (15 Core Queries for College DBMS Viva & Demonstration)

-- -----------------------------------------------------------------------------
-- QUERY 1: Find all available blood units by blood group
-- -----------------------------------------------------------------------------
SELECT 
    blood_group, 
    component_type, 
    COUNT(unit_id) AS available_units, 
    SUM(volume_ml) AS total_volume_ml
FROM BLOOD_UNIT
WHERE status = 'Available' AND expiry_date >= CURRENT_DATE
GROUP BY blood_group, component_type
ORDER BY blood_group, component_type;

-- -----------------------------------------------------------------------------
-- QUERY 2: Count donors by blood group
-- -----------------------------------------------------------------------------
SELECT 
    blood_group, 
    COUNT(donor_id) AS total_donors,
    COUNT(CASE WHEN eligibility_status = 'Eligible' THEN 1 END) AS eligible_donors
FROM DONOR
GROUP BY blood_group
ORDER BY total_donors DESC;

-- -----------------------------------------------------------------------------
-- QUERY 3: Find the blood group with the highest number of available units
-- -----------------------------------------------------------------------------
SELECT 
    blood_group, 
    COUNT(unit_id) AS total_available_units
FROM BLOOD_UNIT
WHERE status = 'Available' AND expiry_date >= CURRENT_DATE
GROUP BY blood_group
ORDER BY total_available_units DESC
LIMIT 1;

-- -----------------------------------------------------------------------------
-- QUERY 4: Find hospitals with the highest number of blood requests
-- -----------------------------------------------------------------------------
SELECT 
    h.hospital_id, 
    h.hospital_name, 
    h.city, 
    COUNT(br.request_id) AS total_requests,
    SUM(CASE WHEN br.urgency = 'Emergency' THEN 1 ELSE 0 END) AS emergency_requests
FROM HOSPITAL h
LEFT JOIN BLOOD_REQUEST br ON h.hospital_id = br.hospital_id
GROUP BY h.hospital_id, h.hospital_name, h.city
ORDER BY total_requests DESC;

-- -----------------------------------------------------------------------------
-- QUERY 5: Find donors who have donated more than once (HAVING Clause)
-- -----------------------------------------------------------------------------
SELECT 
    d.donor_id, 
    d.full_name, 
    d.blood_group, 
    d.phone, 
    COUNT(dn.donation_id) AS total_donations,
    MAX(dn.donation_date) AS last_donation
FROM DONOR d
JOIN DONATION dn ON d.donor_id = dn.donor_id
GROUP BY d.donor_id, d.full_name, d.blood_group, d.phone
HAVING COUNT(dn.donation_id) > 1
ORDER BY total_donations DESC;

-- -----------------------------------------------------------------------------
-- QUERY 6: Find pending emergency requests with hospital & patient details
-- -----------------------------------------------------------------------------
SELECT 
    br.request_id, 
    h.hospital_name, 
    h.emergency_contact, 
    COALESCE(p.patient_name, 'N/A') AS patient_name,
    br.blood_group, 
    br.component_type, 
    br.units_required, 
    br.required_by
FROM BLOOD_REQUEST br
JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
LEFT JOIN PATIENT p ON br.patient_id = p.patient_id
WHERE br.urgency = 'Emergency' AND br.request_status IN ('Pending', 'Approved')
ORDER BY br.required_by ASC;

-- -----------------------------------------------------------------------------
-- QUERY 7: Find blood units expiring within the next 7 days
-- -----------------------------------------------------------------------------
SELECT 
    unit_id, 
    blood_group, 
    component_type, 
    volume_ml, 
    collection_date, 
    expiry_date,
    (expiry_date - CURRENT_DATE) AS days_until_expiry
FROM BLOOD_UNIT
WHERE status = 'Available' 
  AND expiry_date >= CURRENT_DATE 
  AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY expiry_date ASC;

-- -----------------------------------------------------------------------------
-- QUERY 8: Calculate total donations per month
-- -----------------------------------------------------------------------------
SELECT 
    TO_CHAR(donation_date, 'YYYY-MM') AS donation_month,
    COUNT(donation_id) AS total_donations,
    SUM(blood_volume_ml) AS total_volume_ml
FROM DONATION
GROUP BY TO_CHAR(donation_date, 'YYYY-MM')
ORDER BY donation_month DESC;

-- -----------------------------------------------------------------------------
-- QUERY 9: Find the most frequently requested blood group
-- -----------------------------------------------------------------------------
SELECT 
    blood_group, 
    COUNT(request_id) AS total_requests,
    SUM(units_required) AS total_units_requested
FROM BLOOD_REQUEST
GROUP BY blood_group
ORDER BY total_units_requested DESC
LIMIT 1;

-- -----------------------------------------------------------------------------
-- QUERY 10: Find hospitals that have never submitted a blood request (LEFT JOIN + NULL)
-- -----------------------------------------------------------------------------
SELECT 
    h.hospital_id, 
    h.hospital_name, 
    h.city, 
    h.phone, 
    h.email
FROM HOSPITAL h
LEFT JOIN BLOOD_REQUEST br ON h.hospital_id = br.hospital_id
WHERE br.request_id IS NULL;

-- -----------------------------------------------------------------------------
-- QUERY 11: Find donors who have not donated recently (> 90 days or never)
-- -----------------------------------------------------------------------------
SELECT 
    donor_id, 
    full_name, 
    blood_group, 
    phone, 
    city, 
    last_donation_date,
    CASE 
        WHEN last_donation_date IS NULL THEN 'Never Donated'
        ELSE (CURRENT_DATE - last_donation_date)::text || ' days ago'
    END AS time_since_last_donation
FROM DONOR
WHERE last_donation_date IS NULL 
   OR last_donation_date < CURRENT_DATE - INTERVAL '90 days'
ORDER BY last_donation_date ASC NULLS FIRST;

-- -----------------------------------------------------------------------------
-- QUERY 12: Find the average number of donations per donor (Subquery / Aggregate)
-- -----------------------------------------------------------------------------
SELECT 
    ROUND(AVG(donation_count), 2) AS avg_donations_per_donor,
    MAX(donation_count) AS max_donations_by_single_donor,
    MIN(donation_count) AS min_donations
FROM (
    SELECT donor_id, COUNT(donation_id) AS donation_count
    FROM DONATION
    GROUP BY donor_id
) sub;

-- -----------------------------------------------------------------------------
-- QUERY 13: Find the number of fulfilled requests by hospital
-- -----------------------------------------------------------------------------
SELECT 
    h.hospital_name, 
    h.city, 
    COUNT(br.request_id) AS fulfilled_requests,
    SUM(br.units_required) AS total_units_fulfilled
FROM BLOOD_REQUEST br
JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
WHERE br.request_status = 'Fulfilled'
GROUP BY h.hospital_id, h.hospital_name, h.city
ORDER BY fulfilled_requests DESC;

-- -----------------------------------------------------------------------------
-- QUERY 14: Find blood groups where current available stock is below threshold (< 5 units)
-- -----------------------------------------------------------------------------
SELECT 
    bg.blood_group, 
    COALESCE(COUNT(bu.unit_id), 0) AS available_units,
    CASE 
        WHEN COALESCE(COUNT(bu.unit_id), 0) = 0 THEN 'CRITICAL DEFICIT'
        WHEN COALESCE(COUNT(bu.unit_id), 0) < 3 THEN 'LOW STOCK'
        ELSE 'MODERATE'
    END AS stock_warning_level
FROM (
    SELECT 'A+' AS blood_group UNION ALL SELECT 'A-' UNION ALL SELECT 'B+' UNION ALL SELECT 'B-' UNION ALL SELECT 'AB+' UNION ALL SELECT 'AB-' UNION ALL SELECT 'O+' UNION ALL SELECT 'O-'
) bg
LEFT JOIN BLOOD_UNIT bu ON bg.blood_group = bu.blood_group AND bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE
GROUP BY bg.blood_group
HAVING COALESCE(COUNT(bu.unit_id), 0) < 5
ORDER BY available_units ASC;

-- -----------------------------------------------------------------------------
-- QUERY 15: Find the latest donation date made by each donor
-- -----------------------------------------------------------------------------
SELECT 
    d.donor_id, 
    d.full_name, 
    d.blood_group, 
    d.phone, 
    MAX(dn.donation_date) AS latest_donation_date
FROM DONOR d
JOIN DONATION dn ON d.donor_id = dn.donor_id
GROUP BY d.donor_id, d.full_name, d.blood_group, d.phone
ORDER BY latest_donation_date DESC;
