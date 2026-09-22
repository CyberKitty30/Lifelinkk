import { Request, Response } from 'express';
import { query } from '../db';

// Get all hospitals with search
export const getHospitals = async (req: Request, res: Response) => {
  try {
    const { search, city } = req.query;

    let sql = `SELECT * FROM HOSPITAL WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (hospital_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    if (city) {
      params.push(city);
      sql += ` AND city = $${params.length}`;
    }

    sql += ` ORDER BY hospital_name ASC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single hospital with linked patients and blood requests
export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hospitalRes = await query(`SELECT * FROM HOSPITAL WHERE hospital_id = $1`, [id]);
    if (hospitalRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const hospital = hospitalRes.rows[0];

    // Patients linked to hospital
    const patientsRes = await query(`SELECT * FROM PATIENT WHERE hospital_id = $1 ORDER BY patient_id DESC`, [id]);

    // Blood requests submitted by hospital
    const requestsRes = await query(
      `SELECT br.*, p.patient_name 
       FROM BLOOD_REQUEST br 
       LEFT JOIN PATIENT p ON br.patient_id = p.patient_id 
       WHERE br.hospital_id = $1 
       ORDER BY br.request_date DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...hospital,
        patients: patientsRes.rows,
        blood_requests: requestsRes.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create hospital
export const createHospital = async (req: Request, res: Response) => {
  try {
    const { hospital_name, address, city, phone, email, emergency_contact } = req.body;

    if (!hospital_name || !address || !city || !phone || !email || !emergency_contact) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const insertSql = `
      INSERT INTO HOSPITAL (hospital_name, address, city, phone, email, emergency_contact)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(insertSql, [hospital_name, address, city, phone, email, emergency_contact]);
    res.status(201).json({ success: true, message: 'Hospital registered successfully', data: result.rows[0] });
  } catch (err: any) {
    if (err.message?.includes('unique') || err.message?.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'A hospital with this email address already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update hospital
export const updateHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hospital_name, address, city, phone, email, emergency_contact } = req.body;

    const updateSql = `
      UPDATE HOSPITAL 
      SET hospital_name = $1, address = $2, city = $3, phone = $4, email = $5, emergency_contact = $6
      WHERE hospital_id = $7
      RETURNING *
    `;

    const result = await query(updateSql, [hospital_name, address, city, phone, email, emergency_contact, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital details updated', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete hospital
export const deleteHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM HOSPITAL WHERE hospital_id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
