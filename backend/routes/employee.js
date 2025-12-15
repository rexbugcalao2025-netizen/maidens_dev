const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const { verify, verifyAdmin } = require('../auth'); // destructured

/**
 * ============================
 * EMPLOYEE ROUTES
 * ============================
 */

// Create employee (Admin only)
router.post('/', verify, verifyAdmin, employeeController.createEmployee);

// Get all employees (Admin only)
router.get('/', verify, verifyAdmin, employeeController.getEmployees);

// Get employee by ID (Admin only)
router.get('/:id', verify, verifyAdmin, employeeController.getEmployeeById);

// Get my employee profile (Logged-in user)
router.get('/me/profile', verify, employeeController.getMyEmployeeProfile);

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

module.exports = router;
