// src/routes/cluient.js

import express from 'express';
import * as clientController from '../controllers/client.js';
import { verify, verifyAdmin } from '../auth.js';

const router = express.Router();



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

// Get client by User.ID (Admin only)
router.get(
  '/by-user/:userId',
  verify,
  verifyAdmin,
  clientController.getClientByUserId
)

// Update client notes or general info (Admin only)
router.put('/:id', verify, verifyAdmin, clientController.updateClient);

// Update client notes  (Admin only)
router.put(
  '/:id/notes',
  verify,
  verifyAdmin,
  clientController.updateClientNotes
)

// Soft delete client (Admin only)
router.delete('/:id', verify, verifyAdmin, clientController.deleteClient);

/**
 * OCCUPATION ROUTES (Admin only)
 */

// Add a new occupation to a client
router.post('/:id/occupations', verify, verifyAdmin, clientController.addOccupation);

// Update an existing occupation of a client
router.put('/:id/occupations/:occ_id', verify, verifyAdmin, clientController.updateOccupation);

// Remove an occupation from a client
router.delete('/:id/occupations/:occ_id', verify, verifyAdmin, clientController.removeOccupation);

export default router;
