const ClientService = require("../models/ClientService");

/**
 * Create a client service record
 * (when a client avails services)
 */
module.exports.createClientService = async (req, res) => {
  try {
    const {
      client_id,
      date_rendered,
      service_rendered,
      discount_amount,
      payment,
      reference_code
    } = req.body;

    const clientService = new ClientService({
      client_id,
      date_rendered,
      service_rendered,
      discount_amount,
      payment,
      reference_code,
      created_by: req.user.id
    });

    const savedRecord = await clientService.save();

    res.status(201).send(savedRecord);
  } catch (err) {
    res.status(500).send({
      error: "Error creating client service record",
      details: err.message
    });
  }
};

/**
 * Get all client services (Admin)
 */
module.exports.getAllClientServices = async (req, res) => {
  try {
    const records = await ClientService.find()
      .populate("client_id", "name email")
      .populate("service_rendered.service_id", "name category")
      .sort({ createdAt: -1 });

    res.status(200).send(records);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching client services",
      details: err.message
    });
  }
};

/**
 * Get client service history by client ID
 */
module.exports.getClientServiceByClient = async (req, res) => {
  try {
    const records = await ClientService.find({
      client_id: req.params.clientId,
      is_void: false
    })
      .populate("service_rendered.service_id", "name category")
      .populate("service_rendered.person_assigned.employee_id", "name")
      .sort({ date_rendered: -1 });

    res.status(200).send(records);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching client service history",
      details: err.message
    });
  }
};

/**
 * Get single client service record
 */
module.exports.getClientServiceById = async (req, res) => {
  try {
    const record = await ClientService.findById(req.params.clientServiceId)
      .populate("client_id", "name email")
      .populate("service_rendered.service_id", "name category")
      .populate("service_rendered.person_assigned.employee_id", "name");

    if (!record) {
      return res.status(404).send({ error: "Client service record not found" });
    }

    res.status(200).send(record);
  } catch (err) {
    res.status(500).send({
      error: "Error fetching client service record",
      details: err.message
    });
  }
};

/**
 * Update client service (services, notes, discount)
 */
module.exports.updateClientService = async (req, res) => {
  try {
    const updatedRecord = await ClientService.findByIdAndUpdate(
      req.params.clientServiceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).send({ error: "Client service record not found" });
    }

    res.status(200).send(updatedRecord);
  } catch (err) {
    res.status(500).send({
      error: "Error updating client service record",
      details: err.message
    });
  }
};

/**
 * Add payment to a client service
 */
module.exports.addPayment = async (req, res) => {
  try {
    const { type_of_payment, amount, reference_number, date_paid } = req.body;

    const record = await ClientService.findById(req.params.clientServiceId);

    if (!record) {
      return res.status(404).send({ error: "Client service record not found" });
    }

    record.payment.push({
      type_of_payment,
      amount,
      reference_number,
      date_paid
    });

    await record.save();

    res.status(200).send(record);
  } catch (err) {
    res.status(500).send({
      error: "Error adding payment",
      details: err.message
    });
  }
};

/**
 * Update service status (pending → in_progress → completed)
 */
module.exports.updateServiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const record = await ClientService.findById(req.params.clientServiceId);

    if (!record) {
      return res.status(404).send({ error: "Client service record not found" });
    }

    record.status = status;

    if (status === "completed" && !record.date_completed) {
      record.date_completed = new Date();
    }

    await record.save();

    res.status(200).send(record);
  } catch (err) {
    res.status(500).send({
      error: "Error updating service status",
      details: err.message
    });
  }
};

/**
 * Void a client service record (Admin)
 */
module.exports.voidClientService = async (req, res) => {
  try {
    const { void_reason } = req.body;

    const record = await ClientService.findById(req.params.clientServiceId);

    if (!record) {
      return res.status(404).send({ error: "Client service record not found" });
    }

    record.is_void = true;
    record.void_reason = void_reason;
    record.status = "cancelled";

    await record.save();

    res.status(200).send({
      message: "Client service record voided",
      record
    });
  } catch (err) {
    res.status(500).send({
      error: "Error voiding client service record",
      details: err.message
    });
  }
};
