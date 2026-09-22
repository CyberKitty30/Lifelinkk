import { SqlQueryResult } from '../types';

export const PREDEFINED_QUERIES: SqlQueryResult[] = [
  {
    id: 1,
    title: '1. Available Blood Units by Blood Group & Component',
    category: 'Inventory & Aggregation',
    sqlConcepts: ['SELECT', 'WHERE', 'GROUP BY', 'COUNT', 'SUM', 'ORDER BY'],
    description: 'Calculates count of available active blood units and total volume in ml grouped by blood group and component type.',
    sql: `SELECT blood_group, component_type, COUNT(unit_id) AS available_units, SUM(volume_ml) AS total_volume_ml FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE GROUP BY blood_group, component_type ORDER BY blood_group, component_type;`,
    execution_time_ms: 2,
    columns: ['blood_group', 'component_type', 'available_units', 'total_volume_ml'],
    rows: [
      { blood_group: 'O+', component_type: 'RBC', available_units: 4, total_volume_ml: 1200 },
      { blood_group: 'A+', component_type: 'Whole Blood', available_units: 3, total_volume_ml: 1350 },
      { blood_group: 'B+', component_type: 'Plasma', available_units: 5, total_volume_ml: 1250 },
      { blood_group: 'O-', component_type: 'RBC', available_units: 2, total_volume_ml: 600 }
    ],
    row_count: 4
  },
  {
    id: 2,
    title: '2. Count Registered Donors & Eligible Donors by Blood Group',
    category: 'Donor Demographics',
    sqlConcepts: ['SELECT', 'GROUP BY', 'COUNT', 'CASE Statement', 'ORDER BY'],
    description: 'Counts total registered donors per blood group along with conditional count of currently eligible donors using CASE WHEN.',
    sql: `SELECT blood_group, COUNT(donor_id) AS total_donors, COUNT(CASE WHEN eligibility_status = 'Eligible' THEN 1 END) AS eligible_donors FROM DONOR GROUP BY blood_group ORDER BY total_donors DESC;`,
    execution_time_ms: 1,
    columns: ['blood_group', 'total_donors', 'eligible_donors'],
    rows: [
      { blood_group: 'O+', total_donors: 6, eligible_donors: 6 },
      { blood_group: 'A+', total_donors: 5, eligible_donors: 5 },
      { blood_group: 'B+', total_donors: 5, eligible_donors: 5 },
      { blood_group: 'O-', total_donors: 3, eligible_donors: 3 },
      { blood_group: 'AB+', total_donors: 2, eligible_donors: 2 }
    ],
    row_count: 5
  },
  {
    id: 3,
    title: '3. Blood Group with Highest Available Inventory',
    category: 'Inventory Ranking',
    sqlConcepts: ['SELECT', 'WHERE', 'GROUP BY', 'COUNT', 'ORDER BY', 'LIMIT'],
    description: 'Identifies the single blood group with the largest volume of available blood units.',
    sql: `SELECT blood_group, COUNT(unit_id) AS total_available_units FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE GROUP BY blood_group ORDER BY total_available_units DESC LIMIT 1;`,
    execution_time_ms: 1,
    columns: ['blood_group', 'total_available_units'],
    rows: [{ blood_group: 'O+', total_available_units: 8 }],
    row_count: 1
  },
  {
    id: 4,
    title: '4. Hospitals with Highest Number of Blood Requests',
    category: 'Hospital Activity',
    sqlConcepts: ['LEFT JOIN', 'GROUP BY', 'COUNT', 'CASE Statement', 'ORDER BY'],
    description: 'Lists hospitals ranked by total blood requests submitted, including count of emergency requests.',
    sql: `SELECT h.hospital_id, h.hospital_name, h.city, COUNT(br.request_id) AS total_requests, SUM(CASE WHEN br.urgency = 'Emergency' THEN 1 ELSE 0 END) AS emergency_requests FROM HOSPITAL h LEFT JOIN BLOOD_REQUEST br ON h.hospital_id = br.hospital_id GROUP BY h.hospital_id, h.hospital_name, h.city ORDER BY total_requests DESC;`,
    execution_time_ms: 3,
    columns: ['hospital_id', 'hospital_name', 'city', 'total_requests', 'emergency_requests'],
    rows: [
      { hospital_id: 1, hospital_name: 'Lilavati Hospital & Research Centre', city: 'Mumbai', total_requests: 5, emergency_requests: 2 },
      { hospital_id: 2, hospital_name: 'AIIMS New Delhi', city: 'Delhi', total_requests: 4, emergency_requests: 1 },
      { hospital_id: 6, hospital_name: 'AMRI Hospitals Dhakuria', city: 'Kolkata', total_requests: 3, emergency_requests: 2 }
    ],
    row_count: 3
  },
  {
    id: 5,
    title: '5. Repeat Donors (Donated More Than Once)',
    category: 'Donor Engagement',
    sqlConcepts: ['INNER JOIN', 'GROUP BY', 'HAVING Clause', 'COUNT', 'MAX'],
    description: 'Demonstrates the HAVING clause to filter aggregated groups, listing donors who have donated at least 2 times.',
    sql: `SELECT d.donor_id, d.full_name, d.blood_group, d.phone, COUNT(dn.donation_id) AS total_donations, MAX(dn.donation_date) AS last_donation FROM DONOR d JOIN DONATION dn ON d.donor_id = dn.donor_id GROUP BY d.donor_id, d.full_name, d.blood_group, d.phone HAVING COUNT(dn.donation_id) > 1 ORDER BY total_donations DESC;`,
    execution_time_ms: 2,
    columns: ['donor_id', 'full_name', 'blood_group', 'phone', 'total_donations', 'last_donation'],
    rows: [
      { donor_id: 1, full_name: 'Aarav Mehta', blood_group: 'O+', phone: '+91 99001 11001', total_donations: 2, last_donation: '2026-08-15' },
      { donor_id: 2, full_name: 'Priya Sharma', blood_group: 'A+', phone: '+91 99001 11002', total_donations: 2, last_donation: '2026-07-10' }
    ],
    row_count: 2
  },
  {
    id: 6,
    title: '6. Pending Emergency Blood Requests',
    category: 'Emergency Dispatch',
    sqlConcepts: ['INNER JOIN', 'LEFT JOIN', 'COALESCE', 'WHERE', 'ORDER BY'],
    description: 'Retrieves all un-fulfilled emergency requests with hospital contact numbers and patient details.',
    sql: `SELECT br.request_id, h.hospital_name, h.emergency_contact, COALESCE(p.patient_name, 'N/A') AS patient_name, br.blood_group, br.component_type, br.units_required, br.required_by FROM BLOOD_REQUEST br JOIN HOSPITAL h ON br.hospital_id = h.hospital_id LEFT JOIN PATIENT p ON br.patient_id = p.patient_id WHERE br.urgency = 'Emergency' AND br.request_status IN ('Pending', 'Approved') ORDER BY br.required_by ASC;`,
    execution_time_ms: 2,
    columns: ['request_id', 'hospital_name', 'emergency_contact', 'patient_name', 'blood_group', 'units_required'],
    rows: [
      { request_id: 2, hospital_name: 'Lilavati Hospital & Research Centre', emergency_contact: '+91 98200 99991', patient_name: 'Madhuri Dixit', blood_group: 'A+', units_required: 1 },
      { request_id: 6, hospital_name: 'AMRI Hospitals Dhakuria', emergency_contact: '+91 98300 99996', patient_name: 'Sourav Ganguly', blood_group: 'B+', units_required: 2 }
    ],
    row_count: 2
  },
  {
    id: 7,
    title: '7. Blood Units Expiring Within Next 7 Days',
    category: 'Inventory Expiry Warning',
    sqlConcepts: ['SELECT', 'WHERE', 'Date Math', 'INTERVAL', 'ORDER BY'],
    description: 'Calculates days remaining until expiry for blood units expiring within a 7-day window.',
    sql: `SELECT unit_id, blood_group, component_type, volume_ml, collection_date, expiry_date, (expiry_date - CURRENT_DATE) AS days_until_expiry FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days' ORDER BY expiry_date ASC;`,
    execution_time_ms: 1,
    columns: ['unit_id', 'blood_group', 'component_type', 'volume_ml', 'expiry_date', 'days_until_expiry'],
    rows: [
      { unit_id: 31, blood_group: 'A+', component_type: 'RBC', volume_ml: 300, expiry_date: '2026-09-27', days_until_expiry: 5 },
      { unit_id: 32, blood_group: 'B+', component_type: 'Platelets', volume_ml: 250, expiry_date: '2026-09-26', days_until_expiry: 4 }
    ],
    row_count: 2
  },
  {
    id: 8,
    title: '8. Monthly Blood Donation Trends',
    category: 'Time Series Analytics',
    sqlConcepts: ['TO_CHAR / Date Formatting', 'GROUP BY', 'COUNT', 'SUM'],
    description: 'Groups donations by month to analyze volume collected over time.',
    sql: `SELECT TO_CHAR(donation_date, 'YYYY-MM') AS donation_month, COUNT(donation_id) AS total_donations, SUM(blood_volume_ml) AS total_volume_ml FROM DONATION GROUP BY TO_CHAR(donation_date, 'YYYY-MM') ORDER BY donation_month DESC;`,
    execution_time_ms: 2,
    columns: ['donation_month', 'total_donations', 'total_volume_ml'],
    rows: [
      { donation_month: '2026-09', total_donations: 12, total_volume_ml: 5400 },
      { donation_month: '2026-08', total_donations: 10, total_volume_ml: 4500 }
    ],
    row_count: 2
  },
  {
    id: 9,
    title: '9. Most Frequently Requested Blood Group',
    category: 'Demand Analysis',
    sqlConcepts: ['GROUP BY', 'COUNT', 'SUM', 'ORDER BY', 'LIMIT'],
    description: 'Calculates the total units requested per blood group to determine highest demand.',
    sql: `SELECT blood_group, COUNT(request_id) AS total_requests, SUM(units_required) AS total_units_requested FROM BLOOD_REQUEST GROUP BY blood_group ORDER BY total_units_requested DESC LIMIT 1;`,
    execution_time_ms: 1,
    columns: ['blood_group', 'total_requests', 'total_units_requested'],
    rows: [{ blood_group: 'O+', total_requests: 8, total_units_requested: 16 }],
    row_count: 1
  },
  {
    id: 10,
    title: '10. Hospitals with Zero Blood Requests',
    category: 'Hospital Audit',
    sqlConcepts: ['LEFT JOIN', 'IS NULL Filter', 'SELECT'],
    description: 'Demonstrates outer join filtering to identify registered hospitals that have never placed a request.',
    sql: `SELECT h.hospital_id, h.hospital_name, h.city, h.phone, h.email FROM HOSPITAL h LEFT JOIN BLOOD_REQUEST br ON h.hospital_id = br.hospital_id WHERE br.request_id IS NULL;`,
    execution_time_ms: 1,
    columns: ['hospital_id', 'hospital_name', 'city', 'phone'],
    rows: [{ hospital_id: 8, hospital_name: 'Manipal Hospital Old Airport Rd', city: 'Bengaluru', phone: '+91 80 2502 4444' }],
    row_count: 1
  },
  {
    id: 11,
    title: '11. Donors Inactive / Not Donated Recently (> 90 Days)',
    category: 'Donor Retention',
    sqlConcepts: ['WHERE', 'OR', 'IS NULL', 'CASE Statement', 'Date Math'],
    description: 'Finds registered donors who have not donated in over 90 days or have never donated.',
    sql: `SELECT donor_id, full_name, blood_group, phone, city, last_donation_date, CASE WHEN last_donation_date IS NULL THEN 'Never Donated' ELSE (CURRENT_DATE - last_donation_date)::text || ' days ago' END AS time_since_last_donation FROM DONOR WHERE last_donation_date IS NULL OR last_donation_date < CURRENT_DATE - INTERVAL '90 days' ORDER BY last_donation_date ASC NULLS FIRST;`,
    execution_time_ms: 2,
    columns: ['donor_id', 'full_name', 'blood_group', 'last_donation_date', 'time_since_last_donation'],
    rows: [
      { donor_id: 8, full_name: 'Deepika Padukone', blood_group: 'AB+', last_donation_date: null, time_since_last_donation: 'Never Donated' },
      { donor_id: 21, full_name: 'Manish Malhotra', blood_group: 'AB-', last_donation_date: null, time_since_last_donation: 'Never Donated' }
    ],
    row_count: 2
  },
  {
    id: 12,
    title: '12. Average Donations Per Donor',
    category: 'Statistical Aggregates',
    sqlConcepts: ['Subquery in FROM Clause', 'AVG', 'MAX', 'MIN', 'ROUND'],
    description: 'Uses a derived table subquery to compute the mathematical average, maximum, and minimum donations per donor.',
    sql: `SELECT ROUND(AVG(donation_count), 2) AS avg_donations_per_donor, MAX(donation_count) AS max_donations_by_single_donor, MIN(donation_count) AS min_donations FROM (SELECT donor_id, COUNT(donation_id) AS donation_count FROM DONATION GROUP BY donor_id) sub;`,
    execution_time_ms: 1,
    columns: ['avg_donations_per_donor', 'max_donations_by_single_donor', 'min_donations'],
    rows: [{ avg_donations_per_donor: 1.36, max_donations_by_single_donor: 2, min_donations: 1 }],
    row_count: 1
  },
  {
    id: 13,
    title: '13. Fulfilled Requests Summary by Hospital',
    category: 'Fulfillment Metrics',
    sqlConcepts: ['INNER JOIN', 'WHERE', 'GROUP BY', 'COUNT', 'SUM'],
    description: 'Reports total successfully fulfilled blood requests and units delivered per hospital.',
    sql: `SELECT h.hospital_name, h.city, COUNT(br.request_id) AS fulfilled_requests, SUM(br.units_required) AS total_units_fulfilled FROM BLOOD_REQUEST br JOIN HOSPITAL h ON br.hospital_id = h.hospital_id WHERE br.request_status = 'Fulfilled' GROUP BY h.hospital_id, h.hospital_name, h.city ORDER BY fulfilled_requests DESC;`,
    execution_time_ms: 2,
    columns: ['hospital_name', 'city', 'fulfilled_requests', 'total_units_fulfilled'],
    rows: [
      { hospital_name: 'Lilavati Hospital & Research Centre', city: 'Mumbai', fulfilled_requests: 3, total_units_fulfilled: 6 },
      { hospital_name: 'AIIMS New Delhi', city: 'Delhi', fulfilled_requests: 2, total_units_fulfilled: 4 }
    ],
    row_count: 2
  },
  {
    id: 14,
    title: '14. Low Stock Deficit Warning (Stock < 5 Units)',
    category: 'Inventory Threshold Alert',
    sqlConcepts: ['UNNEST Array Subquery', 'LEFT JOIN', 'HAVING Clause', 'CASE Statement'],
    description: 'Cross-checks all 8 blood groups against inventory threshold to flag groups with critically low stock.',
    sql: `SELECT bg.blood_group, COALESCE(COUNT(bu.unit_id), 0) AS available_units, CASE WHEN COALESCE(COUNT(bu.unit_id), 0) = 0 THEN 'CRITICAL DEFICIT' WHEN COALESCE(COUNT(bu.unit_id), 0) < 3 THEN 'LOW STOCK' ELSE 'MODERATE' END AS stock_warning_level FROM (SELECT 'A+' AS blood_group UNION ALL SELECT 'A-' UNION ALL SELECT 'B+' UNION ALL SELECT 'B-' UNION ALL SELECT 'AB+' UNION ALL SELECT 'AB-' UNION ALL SELECT 'O+' UNION ALL SELECT 'O-') bg LEFT JOIN BLOOD_UNIT bu ON bg.blood_group = bu.blood_group AND bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE GROUP BY bg.blood_group HAVING COALESCE(COUNT(bu.unit_id), 0) < 5 ORDER BY available_units ASC;`,
    execution_time_ms: 2,
    columns: ['blood_group', 'available_units', 'stock_warning_level'],
    rows: [
      { blood_group: 'AB-', available_units: 1, stock_warning_level: 'LOW STOCK' },
      { blood_group: 'A-', available_units: 2, stock_warning_level: 'LOW STOCK' }
    ],
    row_count: 2
  },
  {
    id: 15,
    title: '15. Latest Donation Date for Each Donor',
    category: 'Correlated Aggregation',
    sqlConcepts: ['MAX Aggregate', 'INNER JOIN', 'GROUP BY', 'ORDER BY'],
    description: 'Retrieves each donor along with the date of their most recent blood donation.',
    sql: `SELECT d.donor_id, d.full_name, d.blood_group, d.phone, MAX(dn.donation_date) AS latest_donation_date FROM DONOR d JOIN DONATION dn ON d.donor_id = dn.donor_id GROUP BY d.donor_id, d.full_name, d.blood_group, d.phone ORDER BY latest_donation_date DESC;`,
    execution_time_ms: 2,
    columns: ['donor_id', 'full_name', 'blood_group', 'phone', 'latest_donation_date'],
    rows: [
      { donor_id: 25, full_name: 'Sunil Chhetri', blood_group: 'O-', phone: '+91 99001 11025', latest_donation_date: '2026-09-14' },
      { donor_id: 17, full_name: 'Gautam Gambhir', blood_group: 'B+', phone: '+91 99001 11017', latest_donation_date: '2026-09-12' }
    ],
    row_count: 2
  }
];
