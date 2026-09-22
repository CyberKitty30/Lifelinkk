import { Request, Response } from 'express';
import { query, executeTransaction } from '../db';

// Get all donations with details
export const getDonations = async (req: Request, res: Response) => {
  try {
    const { donor_id, screening_status, start_date, end_date } = req.query;

    let sql = `
      SELECT d.*, dr.full_name AS donor_name, dr.blood_group, dr.phone AS donor_phone, dc.center_name
      FROM DONATION d
      JOIN DONOR dr ON d.donor_id = dr.donor_id
      JOIN DONATION_CENTER dc ON d.donation_center_id = dc.center_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (donor_id) {
      params.push(donor_id);
      sql += ` AND d.donor_id = $${params.length}`;
    }

    if (screening_status) {
      params.push(screening_status);
      sql += ` AND d.screening_status = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      sql += ` AND d.donation_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      sql += ` AND d.donation_date <= $${params.length}`;
    }

    sql += ` ORDER BY d.donation_date DESC, d.donation_id DESC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Record a new blood donation and generate corresponding blood unit
export const recordDonation = async (req: Request, res: Response) => {
  try {
    const {
      donor_id,
      donation_date,
      donation_center_id,
      blood_volume_ml,
      screening_status,
      component_type
    } = req.body;

    if (!donor_id || !donation_center_id || !blood_volume_ml) {
      return res.status(400).json({ success: false, message: 'Donor ID, Center ID, and volume are required' });
    }

    const resultData = await executeTransaction(async (txQuery) => {
      // 1. Get donor details
      const donorRes = await txQuery(`SELECT * FROM DONOR WHERE donor_id = $1`, [donor_id]);
      if (donorRes.rows.length === 0) {
        throw new Error('Donor not found');
      }
      const donor = donorRes.rows[0];

      const dDate = donation_date || new Date().toISOString().split('T')[0];
      const sStatus = screening_status || 'Passed';

      // 2. Insert DONATION
      const donationRes = await txQuery(
        `INSERT INTO DONATION (donor_id, donation_date, donation_center_id, blood_volume_ml, screening_status, donation_status)
         VALUES ($1, $2, $3, $4, $5, 'Completed')
         RETURNING *`,
        [donor_id, dDate, donation_center_id, blood_volume_ml, sStatus]
      );
      const donation = donationRes.rows[0];

      // 3. Update donor's last_donation_date
      await txQuery(
        `UPDATE DONOR SET last_donation_date = $1 WHERE donor_id = $2`,
        [dDate, donor_id]
      );

      // 4. Create BLOOD_UNIT if screening status is Passed
      let createdUnit = null;
      if (sStatus === 'Passed') {
        const compType = component_type || 'Whole Blood';

        // Calculate expiry date based on component type
        const colDateObj = new Date(dDate);
        let expiryDays = 42; // default whole blood / RBC
        if (compType === 'Platelets') expiryDays = 7;
        else if (compType === 'Plasma') expiryDays = 365;

        const expDateObj = new Date(colDateObj);
        expDateObj.setDate(expDateObj.getDate() + expiryDays);
        const expDateStr = expDateObj.toISOString().split('T')[0];

        const unitRes = await txQuery(
          `INSERT INTO BLOOD_UNIT (donation_id, blood_group, collection_date, expiry_date, volume_ml, component_type, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Available')
           RETURNING *`,
          [donation.donation_id, donor.blood_group, dDate, expDateStr, blood_volume_ml, compType]
        );
        createdUnit = unitRes.rows[0];
      }

      return { donation, unit: createdUnit };
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully and blood unit created',
      data: resultData
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
