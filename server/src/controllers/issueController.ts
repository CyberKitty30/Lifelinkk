import { Request, Response } from 'express';
import { query, executeTransaction } from '../db';

// Get all blood issue records with request, hospital, and unit details
export const getIssues = async (req: Request, res: Response) => {
  try {
    const { request_id } = req.query;

    let sql = `
      SELECT bi.*, br.blood_group, br.component_type, h.hospital_name, bu.volume_ml
      FROM BLOOD_ISSUE bi
      JOIN BLOOD_REQUEST br ON bi.request_id = br.request_id
      JOIN HOSPITAL h ON br.hospital_id = h.hospital_id
      JOIN BLOOD_UNIT bu ON bi.unit_id = bu.unit_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (request_id) {
      params.push(request_id);
      sql += ` AND bi.request_id = $${params.length}`;
    }

    sql += ` ORDER BY bi.issue_date DESC, bi.issue_id DESC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Process Blood Issue Transaction
export const issueBloodUnits = async (req: Request, res: Response) => {
  try {
    const { request_id, unit_ids, issued_by } = req.body;

    if (!request_id || !unit_ids || !Array.isArray(unit_ids) || unit_ids.length === 0 || !issued_by) {
      return res.status(400).json({ success: false, message: 'Request ID, array of unit IDs, and staff name are required' });
    }

    const resultData = await executeTransaction(async (txQuery) => {
      // 1. Fetch Request details
      const reqRes = await txQuery(`SELECT * FROM BLOOD_REQUEST WHERE request_id = $1`, [request_id]);
      if (reqRes.rows.length === 0) {
        throw new Error('Blood request not found');
      }
      const bloodRequest = reqRes.rows[0];

      if (['Fulfilled', 'Rejected', 'Cancelled'].includes(bloodRequest.request_status)) {
        throw new Error(`Cannot issue units for a request that is already ${bloodRequest.request_status}`);
      }

      const issuedRecords: any[] = [];

      // 2. Process each blood unit
      for (const unitId of unit_ids) {
        const unitRes = await txQuery(`SELECT * FROM BLOOD_UNIT WHERE unit_id = $1`, [unitId]);
        if (unitRes.rows.length === 0) {
          throw new Error(`Blood unit #${unitId} not found`);
        }
        const unit = unitRes.rows[0];

        if (unit.status !== 'Available') {
          throw new Error(`Blood unit #${unitId} is not available (Current Status: ${unit.status})`);
        }

        const today = new Date().toISOString().split('T')[0];
        const expDate = new Date(unit.expiry_date).toISOString().split('T')[0];
        if (expDate < today) {
          throw new Error(`Blood unit #${unitId} has EXPIRED on ${expDate} and cannot be issued`);
        }

        // Insert into BLOOD_ISSUE
        const issueRes = await txQuery(
          `INSERT INTO BLOOD_ISSUE (request_id, unit_id, issue_date, issued_by, quantity_ml)
           VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)
           RETURNING *`,
          [request_id, unitId, issued_by, unit.volume_ml]
        );
        issuedRecords.push(issueRes.rows[0]);

        // Update BLOOD_UNIT status to Issued
        await txQuery(
          `UPDATE BLOOD_UNIT SET status = 'Issued' WHERE unit_id = $1`,
          [unitId]
        );
      }

      // 3. Count total issued units for this request
      const countRes = await txQuery(
        `SELECT COUNT(*) AS total_issued FROM BLOOD_ISSUE WHERE request_id = $1`,
        [request_id]
      );
      const totalIssued = parseInt(countRes.rows[0].total_issued);

      // 4. Update request status based on total issued vs required
      let newRequestStatus = 'Partially Fulfilled';
      if (totalIssued >= bloodRequest.units_required) {
        newRequestStatus = 'Fulfilled';
      }

      await txQuery(
        `UPDATE BLOOD_REQUEST SET request_status = $1 WHERE request_id = $2`,
        [newRequestStatus, request_id]
      );

      return {
        issued_records: issuedRecords,
        request_status: newRequestStatus,
        total_issued: totalIssued,
        units_required: bloodRequest.units_required
      };
    });

    res.status(200).json({
      success: true,
      message: `Successfully issued ${unit_ids.length} blood unit(s). Request status updated to ${resultData.request_status}.`,
      data: resultData
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
