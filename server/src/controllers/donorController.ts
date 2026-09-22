import { Request, Response } from 'express';
import { query } from '../db';

// Get all donors with search & filtering
export const getDonors = async (req: Request, res: Response) => {
  try {
    const { search, blood_group, city, eligibility_status } = req.query;

    let sql = `SELECT * FROM DONOR WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    if (blood_group) {
      params.push(blood_group);
      sql += ` AND blood_group = $${params.length}`;
    }

    if (city) {
      params.push(city);
      sql += ` AND city = $${params.length}`;
    }

    if (eligibility_status) {
      params.push(eligibility_status);
      sql += ` AND eligibility_status = $${params.length}`;
    }

    sql += ` ORDER BY donor_id DESC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single donor details with donation history
export const getDonorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const donorRes = await query(`SELECT * FROM DONOR WHERE donor_id = $1`, [id]);
    if (donorRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const donor = donorRes.rows[0];

    // Get donor's donation history with center name
    const historyRes = await query(
      `SELECT d.*, dc.center_name 
       FROM DONATION d 
       LEFT JOIN DONATION_CENTER dc ON d.donation_center_id = dc.center_id 
       WHERE d.donor_id = $1 
       ORDER BY d.donation_date DESC`,
      [id]
    );

    // Calculate total donations and last donation date
    const totalDonations = historyRes.rows.length;

    res.json({
      success: true,
      data: {
        ...donor,
        donation_history: historyRes.rows,
        total_donations: totalDonations
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new donor
export const createDonor = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      date_of_birth,
      gender,
      blood_group,
      phone,
      email,
      city,
      address,
      eligibility_status
    } = req.body;

    // Validation
    if (!full_name || !date_of_birth || !gender || !blood_group || !phone || !email || !city || !address) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(blood_group)) {
      return res.status(400).json({ success: false, message: 'Invalid blood group specified' });
    }

    const insertSql = `
      INSERT INTO DONOR (full_name, date_of_birth, gender, blood_group, phone, email, city, address, eligibility_status, registration_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
      RETURNING *
    `;

    const result = await query(insertSql, [
      full_name,
      date_of_birth,
      gender,
      blood_group,
      phone,
      email,
      city,
      address,
      eligibility_status || 'Eligible'
    ]);

    res.status(201).json({ success: true, message: 'Donor registered successfully', data: result.rows[0] });
  } catch (err: any) {
    if (err.message?.includes('unique') || err.message?.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'A donor with this email or phone already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update donor
export const updateDonor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      date_of_birth,
      gender,
      blood_group,
      phone,
      email,
      city,
      address,
      eligibility_status
    } = req.body;

    const updateSql = `
      UPDATE DONOR 
      SET full_name = $1, date_of_birth = $2, gender = $3, blood_group = $4, phone = $5, email = $6, city = $7, address = $8, eligibility_status = $9
      WHERE donor_id = $10
      RETURNING *
    `;

    const result = await query(updateSql, [
      full_name,
      date_of_birth,
      gender,
      blood_group,
      phone,
      email,
      city,
      address,
      eligibility_status,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    res.json({ success: true, message: 'Donor updated successfully', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete donor
export const deleteDonor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM DONOR WHERE donor_id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    res.json({ success: true, message: 'Donor deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
