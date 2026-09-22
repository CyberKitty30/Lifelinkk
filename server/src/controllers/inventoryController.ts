import { Request, Response } from 'express';
import { query } from '../db';

// Get detailed blood inventory with filters
export const getInventory = async (req: Request, res: Response) => {
  try {
    const { blood_group, component_type, status, expiring_soon } = req.query;

    let sql = `
      SELECT bu.*, d.donor_id, dr.full_name AS donor_name
      FROM BLOOD_UNIT bu
      LEFT JOIN DONATION d ON bu.donation_id = d.donation_id
      LEFT JOIN DONOR dr ON d.donor_id = dr.donor_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (blood_group) {
      params.push(blood_group);
      sql += ` AND bu.blood_group = $${params.length}`;
    }

    if (component_type) {
      params.push(component_type);
      sql += ` AND bu.component_type = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND bu.status = $${params.length}`;
    }

    if (expiring_soon === 'true') {
      sql += ` AND bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE AND bu.expiry_date <= CURRENT_DATE + INTERVAL '7 days'`;
    }

    sql += ` ORDER BY bu.expiry_date ASC, bu.unit_id DESC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get aggregated stock summary matrix across all 8 blood groups
export const getStockSummary = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        bg.blood_group,
        COALESCE(SUM(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE THEN 1 ELSE 0 END), 0) AS available_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Reserved' THEN 1 ELSE 0 END), 0) AS reserved_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Issued' THEN 1 ELSE 0 END), 0) AS issued_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Expired' OR (bu.status = 'Available' AND bu.expiry_date < CURRENT_DATE) THEN 1 ELSE 0 END), 0) AS expired_units,
        COALESCE(SUM(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURRENT_DATE THEN bu.volume_ml ELSE 0 END), 0) AS total_available_volume_ml
      FROM (
        SELECT 'A+' AS blood_group UNION ALL SELECT 'A-' UNION ALL SELECT 'B+' UNION ALL SELECT 'B-' UNION ALL SELECT 'AB+' UNION ALL SELECT 'AB-' UNION ALL SELECT 'O+' UNION ALL SELECT 'O-'
      ) bg
      LEFT JOIN BLOOD_UNIT bu ON bg.blood_group = bu.blood_group
      GROUP BY bg.blood_group
      ORDER BY bg.blood_group ASC
    `;

    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Manually update blood unit status
export const updateUnitStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Available', 'Reserved', 'Issued', 'Expired', 'Discarded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const result = await query(
      `UPDATE BLOOD_UNIT SET status = $1 WHERE unit_id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blood unit not found' });
    }

    res.json({ success: true, message: 'Unit status updated successfully', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
