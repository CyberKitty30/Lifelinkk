import { Request, Response } from 'express';
import { query } from '../db';

// Get all patients
export const getPatients = async (req: Request, res: Response) => {
  try {
    const { search, blood_group, hospital_id } = req.query;

    let sql = `
      SELECT p.*, h.hospital_name, h.city AS hospital_city
      FROM PATIENT p
      JOIN HOSPITAL h ON p.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.patient_name ILIKE $${params.length} OR p.contact_number ILIKE $${params.length})`;
    }

    if (blood_group) {
      params.push(blood_group);
      sql += ` AND p.blood_group = $${params.length}`;
    }

    if (hospital_id) {
      params.push(hospital_id);
      sql += ` AND p.hospital_id = $${params.length}`;
    }

    sql += ` ORDER BY p.patient_id DESC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create patient
export const createPatient = async (req: Request, res: Response) => {
  try {
    const { hospital_id, patient_name, date_of_birth, gender, blood_group, contact_number, medical_notes } = req.body;

    if (!hospital_id || !patient_name || !date_of_birth || !gender || !blood_group || !contact_number) {
      return res.status(400).json({ success: false, message: 'Required patient details missing' });
    }

    const insertSql = `
      INSERT INTO PATIENT (hospital_id, patient_name, date_of_birth, gender, blood_group, contact_number, medical_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertSql, [hospital_id, patient_name, date_of_birth, gender, blood_group, contact_number, medical_notes || '']);
    res.status(201).json({ success: true, message: 'Patient registered successfully', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update patient
export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hospital_id, patient_name, date_of_birth, gender, blood_group, contact_number, medical_notes } = req.body;

    const updateSql = `
      UPDATE PATIENT 
      SET hospital_id = $1, patient_name = $2, date_of_birth = $3, gender = $4, blood_group = $5, contact_number = $6, medical_notes = $7
      WHERE patient_id = $8
      RETURNING *
    `;

    const result = await query(updateSql, [hospital_id, patient_name, date_of_birth, gender, blood_group, contact_number, medical_notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient details updated', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete patient
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM PATIENT WHERE patient_id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
