const express = require("express");
const serviceController = require("../controllers/service");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

// Get all active services
router.get("/", serviceController.getActiveServices);

// Get single service by ID
router.get("/:serviceId", serviceController.getServiceById);

/**
 * ADMIN ROUTES
 */

// Create a new service
router.post("/", verify, verifyAdmin, serviceController.createService);

// Get all services (active + inactive)
router.get("/admin/all", verify, verifyAdmin, serviceController.getAllServices);

// Update a service
router.patch("/:serviceId", verify, verifyAdmin, serviceController.updateService);

// Archive (soft delete) a service
router.patch(
  "/:serviceId/archive",
  verify,
  verifyAdmin,
  serviceController.archiveService
);

module.exports = router;
