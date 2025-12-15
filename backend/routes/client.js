const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client');
const { verify, verifyAdmin } = require('../auth');

/**
 * ============================
 * CLIENT ROUTES
 * ============================
 */

// Create a new client (Admin only)
router.post('/', verify, verifyAdmin, clientController.createClient);

// Get all clients (Admin only)
router.get('/', verify, verifyAdmin, clientController.getClients);

// Get client by ID (Admin only)
router.get('/:id', verify, verifyAdmin, clientController.getClientById);

// Update client notes or general info (Admin only)
router.put('/:id', verify, verifyAdmin, clientController.updateClient);

// Soft delete client (Admin only)
router.delete('/:id', verify, verifyAdmin, clientController.deleteClient);

/**
 * OCCUPATION ROUTES (Admin only)
 */

// Add a new occupation to a client
router.post('/:id/occupation', verify, verifyAdmin, clientController.addOccupation);

// Update an existing occupation of a client
router.put('/:id/occupation/:occ_id', verify, verifyAdmin, clientController.updateOccupation);

// Remove an occupation from a client
router.delete('/:id/occupation/:occ_id', verify, verifyAdmin, clientController.removeOccupation);

module.exports = router;
