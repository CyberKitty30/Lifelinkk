import { Request, Response } from 'express';
import { query } from '../db';

// Get all staff members with center names
export const getStaff = async (req: Request, res: Response) => {
  try {
    const { search, center_id } = req.query;

    let sql = `
      SELECT s.*, dc.center_name, dc.city AS center_city
      FROM STAFF s
      LEFT JOIN DONATION_CENTER dc ON s.center_id = dc.center_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (s.full_name ILIKE $${params.length} OR s.role ILIKE $${params.length} OR s.email ILIKE $${params.length})`;
    }

    if (center_id) {
      params.push(center_id);
      sql += ` AND s.center_id = $${params.length}`;
    }

    sql += ` ORDER BY s.staff_id ASC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all donation centers (helper for dropdowns)
export const getDonationCenters = async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM DONATION_CENTER ORDER BY center_name ASC`);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create staff
export const createStaff = async (req: Request, res: Response) => {
  try {
    const { center_id, full_name, role, phone, email } = req.body;

    if (!full_name || !role || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Name, role, phone, and email are required' });
    }

    const insertSql = `
      INSERT INTO STAFF (center_id, full_name, role, phone, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(insertSql, [center_id || null, full_name, role, phone, email]);
    res.status(201).json({ success: true, message: 'Staff member registered successfully', data: result.rows[0] });
  } catch (err: any) {
    if (err.message?.includes('unique') || err.message?.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'A staff member with this email already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update staff
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { center_id, full_name, role, phone, email } = req.body;

    const updateSql = `
      UPDATE STAFF 
      SET center_id = $1, full_name = $2, role = $3, phone = $4, email = $5
      WHERE staff_id = $6
      RETURNING *
    `;

    const result = await query(updateSql, [center_id || null, full_name, role, phone, email, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff details updated', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete staff
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM STAFF WHERE staff_id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
