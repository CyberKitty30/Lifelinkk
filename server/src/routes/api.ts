import { Router } from 'express';
import * as donorCtrl from '../controllers/donorController';
import * as donationCtrl from '../controllers/donationController';
import * as inventoryCtrl from '../controllers/inventoryController';
import * as requestCtrl from '../controllers/requestController';
import * as issueCtrl from '../controllers/issueController';
import * as hospitalCtrl from '../controllers/hospitalController';
import * as patientCtrl from '../controllers/patientController';
import * as staffCtrl from '../controllers/staffController';
import * as dashboardCtrl from '../controllers/dashboardController';
import * as analyticsCtrl from '../controllers/analyticsController';

const router = Router();

// Dashboard Route
router.get('/dashboard/stats', dashboardCtrl.getDashboardStats);

// Donors Routes
router.get('/donors', donorCtrl.getDonors);
router.get('/donors/:id', donorCtrl.getDonorById);
router.post('/donors', donorCtrl.createDonor);
router.put('/donors/:id', donorCtrl.updateDonor);
router.delete('/donors/:id', donorCtrl.deleteDonor);

// Donations Routes
router.get('/donations', donationCtrl.getDonations);
router.post('/donations', donationCtrl.recordDonation);

// Blood Inventory Routes
router.get('/inventory', inventoryCtrl.getInventory);
router.get('/inventory/summary', inventoryCtrl.getStockSummary);
router.put('/inventory/:id/status', inventoryCtrl.updateUnitStatus);

// Blood Requests Routes
router.get('/requests', requestCtrl.getRequests);
router.get('/requests/:id', requestCtrl.getRequestById);
router.post('/requests', requestCtrl.createRequest);
router.put('/requests/:id/status', requestCtrl.updateRequestStatus);

// Blood Issue Routes
router.get('/issues', issueCtrl.getIssues);
router.post('/issues', issueCtrl.issueBloodUnits);

// Hospital Routes
router.get('/hospitals', hospitalCtrl.getHospitals);
router.get('/hospitals/:id', hospitalCtrl.getHospitalById);
router.post('/hospitals', hospitalCtrl.createHospital);
router.put('/hospitals/:id', hospitalCtrl.updateHospital);
router.delete('/hospitals/:id', hospitalCtrl.deleteHospital);

// Patient Routes
router.get('/patients', patientCtrl.getPatients);
router.post('/patients', patientCtrl.createPatient);
router.put('/patients/:id', patientCtrl.updatePatient);
router.delete('/patients/:id', patientCtrl.deletePatient);

// Staff & Donation Center Routes
router.get('/staff', staffCtrl.getStaff);
router.get('/centers', staffCtrl.getDonationCenters);
router.post('/staff', staffCtrl.createStaff);
router.put('/staff/:id', staffCtrl.updateStaff);
router.delete('/staff/:id', staffCtrl.deleteStaff);

// SQL Analytics Routes
router.get('/analytics/queries', analyticsCtrl.getPredefinedQueries);
router.post('/analytics/custom', analyticsCtrl.executeCustomQuery);

export default router;
