// src/routes/clientService.js

import express from 'express';
import * as clientServiceController from '../controllers/clientService.js';
import { verify, verifyAdmin } from '../auth.js';

const router = express.Router();

/**
 * STAFF / ADMIN ROUTES
 */

// Create a client service record
router.post(
  "/",
  verify,
  clientServiceController.createClientService
);

// Update a client service record
router.patch(
  "/:clientServiceId",
  verify,
  clientServiceController.updateClientService
);

// Add payment to a client service
router.patch(
  "/:clientServiceId/payment",
  verify,
  clientServiceController.addPayment
);

// Update service status (pending, in_progress, completed)
router.patch(
  "/:clientServiceId/status",
  verify,
  clientServiceController.updateServiceStatus
);

/**
 * CLIENT / HISTORY ROUTES
 */

// Get client service history by client ID
router.get(
  "/client/:clientId",
  verify,
  clientServiceController.getClientServiceByClient
);

// Get single client service record
router.get(
  "/:clientServiceId",
  verify,
  clientServiceController.getClientServiceById
);

/**
 * ADMIN ROUTES
 */

// Get all client service records
router.get(
  "/admin/all",
  verify,
  verifyAdmin,
  clientServiceController.getAllClientServices
);

// Void a client service record
router.patch(
  "/:clientServiceId/void",
  verify,
  verifyAdmin,
  clientServiceController.voidClientService
);

export default router;
