import { Request, Response } from 'express';
import { query } from '../db';

export interface SqlQueryItem {
  id: number;
  title: string;
  category: string;
  sqlConcepts: string[];
  description: string;
  sql: string;
}

export const PREDEFINED_QUERIES: SqlQueryItem[] = [
  {
    id: 1,
    title: '1. Available Blood Units by Blood Group & Component',
    category: 'Inventory & Aggregation',
    sqlConcepts: ['SELECT', 'WHERE', 'GROUP BY', 'COUNT', 'SUM', 'ORDER BY'],
    description: 'Calculates count of available active blood units and total volume in ml grouped by blood group and component type.',
    sql: `SELECT blood_group, component_type, COUNT(unit_id) AS available_units, SUM(volume_ml) AS total_volume_ml FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE GROUP BY blood_group, component_type ORDER BY blood_group, component_type;`
  },
  {
    id: 2,
    title: '2. Count Registered Donors & Eligible Donors by Blood Group',
    category: 'Donor Demographics',
    sqlConcepts: ['SELECT', 'GROUP BY', 'COUNT', 'CASE Statement', 'ORDER BY'],
    description: 'Counts total registered donors per blood group along with conditional count of currently eligible donors using CASE WHEN.',
    sql: `SELECT blood_group, COUNT(donor_id) AS total_donors, COUNT(CASE WHEN eligibility_status = 'Eligible' THEN 1 END) AS eligible_donors FROM DONOR GROUP BY blood_group ORDER BY total_donors DESC;`
  },
  {
    id: 3,
    title: '3. Blood Group with Highest Available Inventory',
    category: 'Inventory Ranking',
    sqlConcepts: ['SELECT', 'WHERE', 'GROUP BY', 'COUNT', 'ORDER BY', 'LIMIT'],
    description: 'Identifies the single blood group with the largest volume of available blood units.',
    sql: `SELECT blood_group, COUNT(unit_id) AS total_available_units FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE GROUP BY blood_group ORDER BY total_available_units DESC LIMIT 1;`
  },
  {
    id: 4,
    title: '4. Hospitals with Highest Number of Blood Requests',
    category: 'Hospital Activity',
    sqlConcepts: ['LEFT JOIN', 'GROUP BY', 'COUNT', 'CASE Statement', 'ORDER BY'],
    description: 'Lists hospitals ranked by total blood requests submitted, including count of emergency requests.',
    sql: `SELECT h.hospital_id, h.hospital_name, h.city, COUNT(br.request_id) AS total_requests, SUM(CASE WHEN br.urgency = 'Emergency' THEN 1 ELSE 0 END) AS emergency_requests FROM HOSPITAL h LEFT JOIN BLOOD_REQUEST br ON h.hospital_id = br.hospital_id GROUP BY h.hospital_id, h.hospital_name, h.city ORDER BY total_requests DESC;`
  },
  {
    id: 5,
    title: '5. Repeat Donors (Donated More Than Once)',
    category: 'Donor Engagement',
    sqlConcepts: ['INNER JOIN', 'GROUP BY', 'HAVING Clause', 'COUNT', 'MAX'],
    description: 'Demonstrates the HAVING clause to filter aggregated groups, listing donors who have donated at least 2 times.',
    sql: `SELECT d.donor_id, d.full_name, d.blood_group, d.phone, COUNT(dn.donation_id) AS total_donations, MAX(dn.donation_date) AS last_donation FROM DONOR d JOIN DONATION dn ON d.donor_id = dn.donor_id GROUP BY d.donor_id, d.full_name, d.blood_group, d.phone HAVING COUNT(dn.donation_id) > 1 ORDER BY total_donations DESC;`
  },
  {
    id: 6,
    title: '6. Pending Emergency Blood Requests',
    category: 'Emergency Dispatch',
    sqlConcepts: ['INNER JOIN', 'LEFT JOIN', 'COALESCE', 'WHERE', 'ORDER BY'],
    description: 'Retrieves all un-fulfilled emergency requests with hospital contact numbers and patient details.',
    sql: `SELECT br.request_id, h.hospital_name, h.emergency_contact, COALESCE(p.patient_name, 'N/A') AS patient_name, br.blood_group, br.component_type, br.units_required, br.required_by FROM BLOOD_REQUEST br JOIN HOSPITAL h ON br.hospital_id = h.hospital_id LEFT JOIN PATIENT p ON br.patient_id = p.patient_id WHERE br.urgency = 'Emergency' AND br.request_status IN ('Pending', 'Approved') ORDER BY br.required_by ASC;`
  },
  {
    id: 7,
    title: '7. Blood Units Expiring Within Next 7 Days',
    category: 'Inventory Expiry Warning',
    sqlConcepts: ['SELECT', 'WHERE', 'Date Math', 'INTERVAL', 'ORDER BY'],
    description: 'Calculates days remaining until expiry for blood units expiring within a 7-day window.',
    sql: `SELECT unit_id, blood_group, component_type, volume_ml, collection_date, expiry_date, (expiry_date - CURRENT_DATE) AS days_until_expiry FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days' ORDER BY expiry_date ASC;`
  },
  {
    id: 8,
    title: '8. Monthly Blood Donation Trends',
    category: 'Time Series Analytics',
    sqlConcepts: ['TO_CHAR / Date Formatting', 'GROUP BY', 'COUNT', 'SUM'],
    description: 'Groups donations by month to analyze volume collected over time.',
    sql: `SELECT TO_CHAR(donation_date, 'YYYY-MM') AS donation_month, COUNT(donation_id) AS total_donations, SUM(blood_volume_ml) AS total_volume_ml FROM DONATION GROUP BY TO_CHAR(donation_date, 'YYYY-MM') ORDER BY donation_month DESC;`
  },
  {
    id: 9,
    title: '9. Most Frequently Requested Blood Group',
    category: 'Demand Analysis',
    sqlConcepts: ['GROUP BY', 'COUNT', 'SUM', 'ORDER BY', 'LIMIT'],
    description: 'Calculates the total units requested per blood group to determine highest demand.',
    sql: `SELECT blood_group, COUNT(request_id) AS total_requests, SUM(units_required) AS total_units_requested FROM BLOOD_REQUEST GROUP BY blood_group ORDER BY total_units_requested DESC LIMIT 1;`
  },
  {
    id: 10,
    title: '10. Hospitals with Zero Blood Requests',
    category: 'Hospital Audit',
    sqlConcepts: ['LEFT JOIN', 'IS NULL Filter', 'SELECT'],
    description: 'Demonstrates outer join filtering to identify registered hospitals that have never placed a request.',
    sql: `SELECT h.hospital_id, h.hospital_name, h.city, h.phone, h.email FROM HOSPITAL h LEFT JOIN BLOOD_REQUEST br ON h.hospital_id = br.hospital_id WHERE br.request_id IS NULL;`
  },
  {
    id: 11,
    title: '11. Donors Inactive / Not Donated Recently (> 90 Days)',
    category: 'Donor Retention',
    sqlConcepts: ['WHERE', 'OR', 'IS NULL', 'CASE Statement', 'Date Math'],
    description: 'Finds registered donors who have not donated in over 90 days or have never donated.',
    sql: `SELECT donor_id, full_name, blood_group, phone, city, last_donation_date, CASE WHEN last_donation_date IS NULL THEN 'Never Donated' ELSE (CURRENT_DATE - last_donation_date)::text || ' days ago' END AS time_since_last_donation FROM DONOR WHERE last_donation_date IS NULL OR last_donation_date < CURRENT_DATE - INTERVAL '90 days' ORDER BY last_donation_date ASC NULLS FIRST;`
  },
  {
    id: 12,
    title: '12. Average Donations Per Donor',
    category: 'Statistical Aggregates',
    sqlConcepts: ['Subquery in FROM Clause', 'AVG', 'MAX', 'MIN', 'ROUND'],
    description: 'Uses a derived table subquery to compute the mathematical average, maximum, and minimum donations per donor.',
    sql: `SELECT ROUND(AVG(donation_count), 2) AS avg_donations_per_donor, MAX(donation_count) AS max_donations_by_single_donor, MIN(donation_count) AS min_donations FROM (SELECT donor_id, COUNT(donation_id) AS donation_count FROM DONATION GROUP BY donor_id) sub;`
  },
  {
    id: 13,
    title: '13. Fulfilled Requests Summary by Hospital',
    category: 'Fulfillment Metrics',
    sqlConcepts: ['INNER JOIN', 'WHERE', 'GROUP BY', 'COUNT', 'SUM'],
    description: 'Reports total successfully fulfilled blood requests and units delivered per hospital.',
    sql: `SELECT h.hospital_name, h.city, COUNT(br.request_id) AS fulfilled_requests, SUM(br.units_required) AS total_units_fulfilled FROM BLOOD_REQUEST br JOIN HOSPITAL h ON br.hospital_id = h.hospital_id WHERE br.request_status = 'Fulfilled' GROUP BY h.hospital_id, h.hospital_name, h.city ORDER BY fulfilled_requests DESC;`
  },
  {
    id: 14,
    title: '14. Low Stock Deficit Warning (Stock < 5 Units)',
    category: 'Inventory Threshold Alert',
    sqlConcepts: ['UNNEST Array Subquery', 'LEFT JOIN', 'HAVING Clause', 'CASE Statement'],
    description: 'Cross-checks all 8 blood groups against inventory threshold to flag groups with critically low stock.',
    sql: `SELECT bg.blood_group, COALESCE(COUNT(bu.unit_id), 0) AS available_units, CASE WHEN COALESCE(COUNT(bu.unit_id), 0) = 0 THEN 'CRITICAL DEFICIT' WHEN COALESCE(COUNT(bu.unit_id), 0) < 3 THEN 'LOW STOCK' ELSE 'MODERATE' END AS stock_warning_level FROM (SELECT 'A+' AS blood_group UNION ALL SELECT 'A-' UNION ALL SELECT 'B+' UNION ALL SELECT 'B-' UNION ALL SELECT 'AB+' UNION ALL SELECT 'AB-' UNION ALL SELECT 'O+' UNION ALL SELECT 'O-') bg LEFT JOIN BLOOD_UNIT bu ON bg.blood_group = bu.blood_group AND bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE GROUP BY bg.blood_group HAVING COALESCE(COUNT(bu.unit_id), 0) < 5 ORDER BY available_units ASC;`
  },
  {
    id: 15,
    title: '15. Latest Donation Date for Each Donor',
    category: 'Correlated Aggregation',
    sqlConcepts: ['MAX Aggregate', 'INNER JOIN', 'GROUP BY', 'ORDER BY'],
    description: 'Retrieves each donor along with the date of their most recent blood donation.',
    sql: `SELECT d.donor_id, d.full_name, d.blood_group, d.phone, MAX(dn.donation_date) AS latest_donation_date FROM DONOR d JOIN DONATION dn ON d.donor_id = dn.donor_id GROUP BY d.donor_id, d.full_name, d.blood_group, d.phone ORDER BY latest_donation_date DESC;`
  }
];

// Get catalog list of all 15 queries with pre-executed or live results
export const getPredefinedQueries = async (req: Request, res: Response) => {
  try {
    const results = await Promise.all(
      PREDEFINED_QUERIES.map(async (item) => {
        try {
          const start = Date.now();
          const queryRes = await query(item.sql);
          const executionTimeMs = Date.now() - start;
          return {
            ...item,
            execution_time_ms: executionTimeMs,
            columns: queryRes.fields ? queryRes.fields.map((f: any) => f.name) : Object.keys(queryRes.rows[0] || {}),
            rows: queryRes.rows,
            row_count: queryRes.rows.length
          };
        } catch (err: any) {
          return {
            ...item,
            execution_time_ms: 0,
            columns: [],
            rows: [],
            row_count: 0,
            error: err.message
          };
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Execute custom SQL query (SELECT only for security)
export const executeCustomQuery = async (req: Request, res: Response) => {
  try {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, message: 'SQL query string required' });
    }

    const trimmed = sql.trim();
    if (!trimmed.toLowerCase().startsWith('select') && !trimmed.toLowerCase().startsWith('with')) {
      return res.status(400).json({ success: false, message: 'For safety, only SELECT and WITH read-only queries are permitted in the SQL Sandbox.' });
    }

    const start = Date.now();
    const queryRes = await query(trimmed);
    const executionTimeMs = Date.now() - start;

    res.json({
      success: true,
      execution_time_ms: executionTimeMs,
      columns: queryRes.fields ? queryRes.fields.map((f: any) => f.name) : Object.keys(queryRes.rows[0] || {}),
      rows: queryRes.rows,
      row_count: queryRes.rows.length
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
