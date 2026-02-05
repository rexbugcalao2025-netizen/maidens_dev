// src/routes/employee.js

import express from 'express';
import * as employeeController from '../controllers/employee.js';
import { verify, verifyAdmin } from '../auth.js'; // destructured

const router = express.Router();

/**
 * ============================
 * EMPLOYEE ROUTES
 * ============================
 */

// Create employee (Admin only)
router.post('/', verify, verifyAdmin, employeeController.createEmployee);

// Get active employees (Admin only)
router.get('/', verify, verifyAdmin, employeeController.getEmployees);

// Get employee by User ID (Admin only)
router.get(
  '/by-user/:userId',
  verify,
  verifyAdmin,
  employeeController.getEmployeeByUserId
)

// Get my employee profile (Logged-in user)
router.get('/me/profile', verify, employeeController.getMyEmployeeProfile);

// Get employee by ID (Admin only)
router.get('/:id', verify, verifyAdmin, employeeController.getEmployeeById);


// Update employee (Admin only)
router.put('/:id', verify, verifyAdmin, employeeController.updateEmployee);

/**
 * ============================
 * JOB POSITIONS
 * ============================
 */

// Add job position (Admin only)
router.post('/:id/job-positions', verify, verifyAdmin, employeeController.addJobPosition);

// Update job position (Admin only)
router.put('/:id/job-positions/:positionId', verify, verifyAdmin, employeeController.updateJobPosition);

// End / deactivate job position (Admin only)
router.patch('/:id/job-positions/:positionId/end', verify, verifyAdmin, employeeController.endJobPosition);

// Remove job position (hard delete, Admin only)
router.delete('/:id/job-positions/:positionId', verify, verifyAdmin, employeeController.removeJobPosition);


/**
 * ============================
 * USER CREDENTIALS
 * ============================
 */
// const {
//   addCredential,
//   updateCredential,
//   removeCredential,
//   getCredentials
// } = require('../controllers/employee');

router.post(
  '/:employeeId/credentials',
  verify,
  verifyAdmin,
  employeeController.addCredential
);

router.put(
  '/:employeeId/credentials/:credentialId',
  verify,
  verifyAdmin,
  employeeController.updateCredential
);

router.delete(
  '/:employeeId/credentials/:credentialId',
  verify,
  verifyAdmin,
  employeeController.removeCredential
);

router.get(
  '/:employeeId/credentials',
  verify,
  employeeController.getCredentials
);

export default router;
