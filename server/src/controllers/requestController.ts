import { Request, Response } from 'express';
import { query } from '../db';

// Get blood requests with filters
export const getRequests = async (req: Request, res: Response) => {
  try {
    const { blood_group, urgency, request_status, hospital_id, search } = req.query;

    let sql = `
      SELECT br.*, h.hospital_name, h.city AS hospital_city, h.emergency_contact, p.patient_name, p.contact_number AS patient_contact
      FROM BLOOD_REQUEST br
      JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
      LEFT JOIN PATIENT p ON br.patient_id = p.patient_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (h.hospital_name ILIKE $${params.length} OR p.patient_name ILIKE $${params.length})`;
    }

    if (blood_group) {
      params.push(blood_group);
      sql += ` AND br.blood_group = $${params.length}`;
    }

    if (urgency) {
      params.push(urgency);
      sql += ` AND br.urgency = $${params.length}`;
    }

    if (request_status) {
      params.push(request_status);
      sql += ` AND br.request_status = $${params.length}`;
    }

    if (hospital_id) {
      params.push(hospital_id);
      sql += ` AND br.hospital_id = $${params.length}`;
    }

    sql += ` ORDER BY CASE WHEN br.urgency = 'Emergency' THEN 1 WHEN br.urgency = 'Urgent' THEN 2 ELSE 3 END, br.request_id DESC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single request by ID along with compatible available blood units
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reqRes = await query(
      `SELECT br.*, h.hospital_name, h.city AS hospital_city, h.emergency_contact, p.patient_name
       FROM BLOOD_REQUEST br
       JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
       LEFT JOIN PATIENT p ON br.patient_id = p.patient_id
       WHERE br.request_id = $1`,
      [id]
    );

    if (reqRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = reqRes.rows[0];

    // Find compatible available blood units
    // Standard Compatibility: exact match or O- for universal donor
    const compatibleUnitsRes = await query(
      `SELECT bu.*, d.donor_id, dr.full_name AS donor_name
       FROM BLOOD_UNIT bu
       LEFT JOIN DONATION d ON bu.donation_id = d.donation_id
       LEFT JOIN DONOR dr ON d.donor_id = dr.donor_id
       WHERE bu.status = 'Available'
         AND bu.expiry_date >= CURRENT_DATE
         AND (bu.blood_group = $1 OR bu.blood_group = 'O-')
         AND bu.component_type = $2
       ORDER BY bu.expiry_date ASC`,
      [request.blood_group, request.component_type]
    );

    // Get any existing issue records for this request
    const issuesRes = await query(
      `SELECT bi.*, bu.blood_group, bu.component_type
       FROM BLOOD_ISSUE bi
       JOIN BLOOD_UNIT bu ON bi.unit_id = bu.unit_id
       WHERE bi.request_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...request,
        compatible_units: compatibleUnitsRes.rows,
        issued_records: issuesRes.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new blood request
export const createRequest = async (req: Request, res: Response) => {
  try {
    const {
      hospital_id,
      patient_id,
      blood_group,
      component_type,
      units_required,
      required_by,
      urgency
    } = req.body;

    if (!hospital_id || !blood_group || !component_type || !units_required || !required_by || !urgency) {
      return res.status(400).json({ success: false, message: 'Hospital, blood group, component, units, required_by date, and urgency are required' });
    }

    if (parseInt(units_required) <= 0) {
      return res.status(400).json({ success: false, message: 'Units required must be greater than zero' });
    }

    const insertSql = `
      INSERT INTO BLOOD_REQUEST (hospital_id, patient_id, blood_group, component_type, units_required, request_date, required_by, urgency, request_status)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, 'Pending')
      RETURNING *
    `;

    const result = await query(insertSql, [
      hospital_id,
      patient_id || null,
      blood_group,
      component_type,
      units_required,
      required_by,
      urgency
    ]);

    res.status(201).json({ success: true, message: 'Blood request submitted successfully', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update request status (Approve, Reject, Cancel)
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { request_status } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Partially Fulfilled', 'Fulfilled', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(request_status)) {
      return res.status(400).json({ success: false, message: 'Invalid request status' });
    }

    const result = await query(
      `UPDATE BLOOD_REQUEST SET request_status = $1 WHERE request_id = $2 RETURNING *`,
      [request_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: `Request status updated to ${request_status}`, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
