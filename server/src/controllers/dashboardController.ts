import { Request, Response } from 'express';
import { query, getDbStatus } from '../db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Donors
    const donorsRes = await query(`SELECT COUNT(*) AS total FROM DONOR`);
    const totalDonors = parseInt(donorsRes.rows[0].total);

    // 2. Total Donations
    const donationsRes = await query(`SELECT COUNT(*) AS total FROM DONATION`);
    const totalDonations = parseInt(donationsRes.rows[0].total);

    // 3. Available Blood Units
    const availUnitsRes = await query(`SELECT COUNT(*) AS total, COALESCE(SUM(volume_ml), 0) AS total_volume FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE`);
    const availableUnits = parseInt(availUnitsRes.rows[0].total);
    const availableVolume = parseInt(availUnitsRes.rows[0].total_volume);

    // 4. Pending Blood Requests
    const pendingReqRes = await query(`SELECT COUNT(*) AS total FROM BLOOD_REQUEST WHERE request_status IN ('Pending', 'Approved')`);
    const pendingRequests = parseInt(pendingReqRes.rows[0].total);

    // 5. Emergency Requests
    const emergencyReqRes = await query(`SELECT COUNT(*) AS total FROM BLOOD_REQUEST WHERE urgency = 'Emergency' AND request_status IN ('Pending', 'Approved')`);
    const emergencyRequests = parseInt(emergencyReqRes.rows[0].total);

    // 6. Registered Hospitals
    const hospitalsRes = await query(`SELECT COUNT(*) AS total FROM HOSPITAL`);
    const totalHospitals = parseInt(hospitalsRes.rows[0].total);

    // 7. Expiring Soon (< 7 Days)
    const expiringSoonRes = await query(`SELECT COUNT(*) AS total FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'`);
    const expiringSoon = parseInt(expiringSoonRes.rows[0].total);

    // 8. Stock Summary Matrix across all 8 Blood Groups
    const stockMatrixRes = await query(`
      SELECT 
        bg.blood_group,
        COALESCE(SUM(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE THEN 1 ELSE 0 END), 0) AS available_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Reserved' THEN 1 ELSE 0 END), 0) AS reserved_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Issued' THEN 1 ELSE 0 END), 0) AS issued_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Expired' OR (bu.status = 'Available' AND bu.expiry_date < CURRENT_DATE) THEN 1 ELSE 0 END), 0) AS expired_units
      FROM (
        SELECT 'A+' AS blood_group UNION ALL SELECT 'A-' UNION ALL SELECT 'B+' UNION ALL SELECT 'B-' UNION ALL SELECT 'AB+' UNION ALL SELECT 'AB-' UNION ALL SELECT 'O+' UNION ALL SELECT 'O-'
      ) bg
      LEFT JOIN BLOOD_UNIT bu ON bg.blood_group = bu.blood_group
      GROUP BY bg.blood_group
      ORDER BY bg.blood_group ASC
    `);

    // 9. Recent Emergency Requests list for quick dashboard view
    const recentEmergencyRes = await query(`
      SELECT br.*, h.hospital_name, h.emergency_contact
      FROM BLOOD_REQUEST br
      JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
      WHERE br.urgency = 'Emergency' AND br.request_status IN ('Pending', 'Approved')
      ORDER BY br.request_date DESC
      LIMIT 5
    `);

    // 10. Expiring Units list for quick banner view
    const expiringUnitsRes = await query(`
      SELECT bu.*, d.donor_id
      FROM BLOOD_UNIT bu
      LEFT JOIN DONATION d ON bu.donation_id = d.donation_id
      WHERE bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE AND bu.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY bu.expiry_date ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        total_donors: totalDonors,
        total_donations: totalDonations,
        available_units: availableUnits,
        available_volume_ml: availableVolume,
        pending_requests: pendingRequests,
        emergency_requests: emergencyRequests,
        total_hospitals: totalHospitals,
        expiring_soon_count: expiringSoon,
        stock_matrix: stockMatrixRes.rows,
        recent_emergency_requests: recentEmergencyRes.rows,
        expiring_units_list: expiringUnitsRes.rows,
        db_status: getDbStatus()
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
