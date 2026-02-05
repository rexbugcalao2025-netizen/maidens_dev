// src/routes/service.js

import express from 'express';
import * as serviceController from '../controllers/service.js';
import { verify, verifyAdmin } from '../auth.js';

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

// Get all active services
router.get("/", serviceController.getActiveServices);

/**
 * ADMIN ROUTES
 */

// Create a new service
router.post("/", verify, verifyAdmin, serviceController.createService);

// Get all services (active + inactive)
router.get("/admin/all", verify, verifyAdmin, serviceController.getAllServices);

// Update a service
router.put("/:serviceId", verify, verifyAdmin, serviceController.updateService);

// Archive (soft delete) a service
router.patch(
  "/:serviceId/archive",
  verify,
  verifyAdmin,
  serviceController.archiveService
);

/**
 * PUBLIC ROUTES (ID-based)
 */

// Get single service by ID -- Public
router.get("/:serviceId", serviceController.getServiceById);


export default router;
