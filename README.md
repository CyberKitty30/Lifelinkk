# LifeLink — Blood Donation & Blood Bank Management System

> **DBMS / SQL College Project (3NF Relational Database Design)**

LifeLink is a full-stack **Blood Donation Management System** developed specifically for a DBMS/SQL college course project. It demonstrates modern database design principles, Third Normal Form (3NF) normalization, foreign key constraints, parameterized SQL queries, database transactions, SQL views, and complex relational analytics.

---

## 📋 Table of Contents
1. [Problem Statement & Objectives](#-problem-statement--objectives)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Database Design & Architecture (3NF)](#-database-design--architecture-3nf)
5. [Table Definitions & Constraints](#-table-definitions--constraints)
6. [Relational ER Diagram Description](#-relational-er-diagram-description)
7. [SQL Views & Transactions](#-sql-views--transactions)
8. [Demonstrated SQL Queries (15 Queries)](#-demonstrated-sql-queries-15-queries)
9. [Installation & Local Setup Guide](#-installation--local-setup-guide)
10. [Viva Demonstration Points](#-viva-demonstration-points)

---

## 🎯 Problem Statement & Objectives

### Problem Statement
Healthcare centers, blood banks, and hospitals frequently experience shortages or inefficiencies in matching required blood types during medical emergencies. Traditional manual record-keeping leads to duplicated patient data, untracked unit expirations, delayed emergency dispatching, and double-issuing errors.

### Project Objectives
- **Relational Integrity**: Store and organize donor, donation, inventory, hospital, patient, and request data using a clean 3NF database schema.
- **Transactional Safety**: Prevent double-issuing of blood units and expired unit assignments using database transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **Real-Time Inventory Tracking**: Track inventory status across 8 ABO/Rh blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) and 4 component types (`Whole Blood`, `RBC`, `Plasma`, `Platelets`).
- **Comprehensive SQL Analytics**: Demonstrate 15 essential SQL queries using `GROUP BY`, `HAVING`, `LEFT JOIN`, `INNER JOIN`, `CASE` statements, aggregate functions, and subqueries.

---

## ✨ Key Features

- **Interactive Dashboard**: Real-time KPI metrics, 8-blood-group stock grid matrix, expiring unit alerts (< 7 days), and pending emergency request alerts.
- **Donor Management**: Complete CRUD operations, search, filters by blood group and city, donor detail view with donation history.
- **Donation Management**: Record new blood donations linked to donation centers; automatic generation of active `BLOOD_UNIT` records and donor eligibility update.
- **Blood Inventory Management**: Breakdown of inventory by status (`Available`, `Reserved`, `Issued`, `Expired`, `Discarded`), visual expiry warnings, and manual status overrides.
- **Hospital & Patient Management**: Comprehensive directories linking admitted patients to hospitals and tracking hospital emergency contact numbers.
- **Blood Requests & Issue Workflow**: Step-by-step transaction workflow matching blood requests to compatible, available, unexpired blood units.
- **SQL Analytics Workbench**: Interactive UI catalog of 15 DBMS SQL queries with formatted query statements, execution timing, and live tabular output, plus an **Interactive SQL Query Sandbox**.

---

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, REST API architecture
- **Database Engine**: PostgreSQL (with direct `pg` driver parameterized queries)
- **Zero-Config Fallback**: Embedded PostgreSQL engine (`pg-mem`) for instant out-of-the-box demo execution without pre-configuring PostgreSQL credentials.

---

## 🗄 Database Design & Architecture (3NF)

The database schema is designed according to **Third Normal Form (3NF)** rules:
1. **First Normal Form (1NF)**: All columns contain atomic values; no multi-valued attributes or repeating groups exist.
2. **Second Normal Form (2NF)**: All non-key attributes are fully functionally dependent on the primary key.
3. **Third Normal Form (3NF)**: No transitive dependencies exist (non-key columns depend only on the primary key).

```
   +---------------+          +------------------+          +---------------+
   |     DONOR     | 1      * |     DONATION     | *      1 |DONATION_CENTER|
   |---------------|----------|------------------|----------|---------------|
   | donor_id (PK) |          | donation_id (PK) |          | center_id(PK) |
   +---------------+          | donor_id (FK)    |          +---------------+
                              | center_id (FK)   |                  | 1
                              +------------------+                  |
                                       | 1                          | *
                                       |                            +---------------+
                                       | 1                          |     STAFF     |
                              +------------------+                  |---------------|
                              |    BLOOD_UNIT    |                  | staff_id (PK) |
                              |------------------|                  | center_id(FK) |
                              | unit_id (PK)     |                  +---------------+
                              | donation_id (FK) |
                              +------------------+
                                       | 1
                                       |
                                       | *
                              +------------------+          +---------------+
                              |   BLOOD_ISSUE    | *      1 | BLOOD_REQUEST |
                              |------------------|----------|---------------|
                              | issue_id (PK)    |          | request_id(PK)|
                              | request_id (FK)  |          | hospital_id(FK|
                              | unit_id (FK)     |          | patient_id(FK)|
                              +------------------+          +---------------+
                                                                  | *       | *
                                                                  |         |
                                                                1 |       1 |
                                                            +----------+ +----------+
                                                            | HOSPITAL | | PATIENT  |
                                                            +----------+ +----------+
```

---

## 📊 Table Definitions & Constraints

1. **`DONOR`**: Primary key `donor_id`, UNIQUE constraints on `phone` and `email`, CHECK constraints on `blood_group` and `eligibility_status`.
2. **`DONATION_CENTER`**: Primary key `center_id`, hospital operating hours.
3. **`STAFF`**: Primary key `staff_id`, FK `center_id` referencing `DONATION_CENTER(center_id)`.
4. **`DONATION`**: Primary key `donation_id`, FK `donor_id` referencing `DONOR(donor_id)`, FK `donation_center_id` referencing `DONATION_CENTER(center_id)`.
5. **`BLOOD_UNIT`**: Primary key `unit_id`, FK `donation_id` referencing `DONATION(donation_id)`, CHECK constraints on `component_type`, `status`, and `expiry_date >= collection_date`.
6. **`HOSPITAL`**: Primary key `hospital_id`, UNIQUE constraint on `email`.
7. **`PATIENT`**: Primary key `patient_id`, FK `hospital_id` referencing `HOSPITAL(hospital_id)`.
8. **`BLOOD_REQUEST`**: Primary key `request_id`, FK `hospital_id` referencing `HOSPITAL(hospital_id)`, FK `patient_id` referencing `PATIENT(patient_id)`, CHECK constraints on `urgency` and `request_status`.
9. **`BLOOD_ISSUE`**: Primary key `issue_id`, FK `request_id` referencing `BLOOD_REQUEST(request_id)`, UNIQUE FK `unit_id` referencing `BLOOD_UNIT(unit_id)`.

---

## ⚡ SQL Views & Transactions

### Views (`database/schema.sql`)
1. **`available_blood_stock`**:
   ```sql
   CREATE VIEW available_blood_stock AS
   SELECT blood_group, component_type, COUNT(unit_id) AS available_units, SUM(volume_ml) AS total_volume_ml
   FROM BLOOD_UNIT WHERE status = 'Available' AND expiry_date >= CURRENT_DATE
   GROUP BY blood_group, component_type;
   ```
2. **`pending_emergency_requests`**:
   ```sql
   CREATE VIEW pending_emergency_requests AS
   SELECT br.request_id, h.hospital_name, h.emergency_contact, p.patient_name, br.blood_group, br.units_required
   FROM BLOOD_REQUEST br JOIN HOSPITAL h ON br.hospital_id = h.hospital_id LEFT JOIN PATIENT p ON br.patient_id = p.patient_id
   WHERE br.urgency = 'Emergency' AND br.request_status IN ('Pending', 'Approved');
   ```

### Transaction Workflow (`server/src/controllers/issueController.ts`)
```sql
BEGIN;
  -- Validate available unit status
  SELECT * FROM BLOOD_UNIT WHERE unit_id = $1 AND status = 'Available';
  -- Insert into issue log
  INSERT INTO BLOOD_ISSUE (request_id, unit_id, issue_date, issued_by, quantity_ml) VALUES (...);
  -- Update inventory status
  UPDATE BLOOD_UNIT SET status = 'Issued' WHERE unit_id = $1;
  -- Update request fulfillment status
  UPDATE BLOOD_REQUEST SET request_status = 'Fulfilled' WHERE request_id = $2;
COMMIT;
```

---

## 🔍 Demonstrated SQL Queries (15 Queries)

| # | Query Title | SQL Concepts |
|---|-------------|--------------|
| 1 | Available Blood Units by Group & Component | `GROUP BY`, `COUNT`, `SUM`, `WHERE` |
| 2 | Count Donors & Eligible Donors by Blood Group | `COUNT`, `CASE WHEN`, `GROUP BY` |
| 3 | Blood Group with Highest Available Inventory | `ORDER BY`, `LIMIT 1`, `COUNT` |
| 4 | Hospitals with Highest Number of Blood Requests | `LEFT JOIN`, `COUNT`, `CASE WHEN` |
| 5 | Repeat Donors (Donated > 1 Time) | `HAVING COUNT() > 1`, `INNER JOIN` |
| 6 | Pending Emergency Requests | `JOIN`, `LEFT JOIN`, `COALESCE`, `WHERE` |
| 7 | Units Expiring Within Next 7 Days | Date Math, `INTERVAL '7 days'`, `WHERE` |
| 8 | Monthly Blood Donation Trends | `TO_CHAR(date, 'YYYY-MM')`, `GROUP BY` |
| 9 | Most Frequently Requested Blood Group | `SUM(units_required)`, `LIMIT 1` |
| 10 | Hospitals with Zero Blood Requests | `LEFT JOIN ... WHERE request_id IS NULL` |
| 11 | Inactive Donors (> 90 Days or Never) | `INTERVAL '90 days'`, `IS NULL`, `CASE` |
| 12 | Average Donations Per Donor | Subquery in `FROM`, `AVG`, `MAX`, `MIN` |
| 13 | Fulfilled Requests Summary by Hospital | `INNER JOIN`, `WHERE`, `SUM` |
| 14 | Low Stock Deficit Warning (< 5 Units) | `UNNEST(ARRAY)`, `LEFT JOIN`, `HAVING` |
| 15 | Latest Donation Record for Each Donor | Correlated Subquery in `WHERE` |

---

## 🚀 Installation & Local Setup Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- (Optional) PostgreSQL Server (v14+)

### Step-by-Step Instructions

1. **Clone / Open Project Workspace**:
   ```bash
   cd lifelink-blood-donation-system
   ```

2. **Install Server & Client Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   In `server/.env`:
   ```env
   PORT=5000
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=postgres
   PGDATABASE=lifelink_db
   ```

4. **Run Project in Development Mode**:
   ```bash
   npm run dev
   ```
   - Express Backend Server will start at `http://localhost:5000`
   - React Frontend Application will launch at `http://localhost:3000`

---

## 🎓 Viva Demonstration Points

When presenting this project during a DBMS lab viva:
1. **Explain the Schema & 3NF**: Show `database/schema.sql` and explain why entities like `HOSPITAL` and `PATIENT` are separated to eliminate transitive dependencies.
2. **Demonstrate Constraints**: Try inserting an invalid blood group string (e.g. `'C+'`) or an invalid volume (`-100`) to showcase database `CHECK` constraints rejecting bad data.
3. **Showcase the Issue Transaction**: Explain how `BEGIN`, `COMMIT`, and `ROLLBACK` guarantee that a blood unit cannot be double-issued to two hospitals concurrently.
4. **Walkthrough SQL Analytics**: Open the **SQL Analytics** tab in the UI, execute Query #5 (Repeat Donors with `HAVING`), and explain how `HAVING` operates on grouped rows after `GROUP BY`.
