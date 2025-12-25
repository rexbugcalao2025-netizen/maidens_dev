const Service = require("../models/Service");

/**
 * Create a new service (Admin)
 */
module.exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      duration_in_minutes,
      labor_price,
      materials,
      date_offered,
      date_ended
    } = req.body;

    const newService = new Service({
      name,
      description,
      category,
      duration_in_minutes,
      labor_price,
      materials,
      date_offered,
      date_ended,
      created_by: req.user.id
    });

    const savedService = await newService.save();

    res.status(201).send(savedService);
  } catch (err) {
    res.status(500).send({
      error: "Error creating service",
      details: err.message
    });
  }
};

/**
 * Get all active services (Public)
 */
module.exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({
      is_active: true
    }).sort({ createdAt: -1 });

    res.status(200).send(services);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching services",
      details: err.message
    });
  }
};

/**
 * Get all services (Admin)
 */
module.exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("created_by", "email")
      .sort({ createdAt: -1 });

    res.status(200).send(services);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching services",
      details: err.message
    });
  }
};

/**
 * Get single service by ID
 */
module.exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).send({ error: "Service not found" });
    }

    res.status(200).send(service);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching service",
      details: err.message
    });
  }
};

/**
 * Update service (Admin)
 */
module.exports.updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.serviceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).send({ error: "Service not found" });
    }

    res.status(200).send(updatedService);
  } catch (err) {
    res.status(500).send({
      error: "Error updating service",
      details: err.message
    });
  }
};

/**
 * Archive service (Admin)
 * Soft-delete using date_ended + is_active
 */
module.exports.archiveService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).send({ error: "Service not found" });
    }

    service.date_ended = new Date();
    service.is_active = false;

    await service.save();

    res.status(200).send({
      message: "Service archived successfully",
      service
    });
  } catch (err) {
    res.status(500).send({
      error: "Error archiving service",
      details: err.message
    });
  }
};
