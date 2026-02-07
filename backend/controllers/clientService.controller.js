// src/controllers/clientService.js

import mongoose from 'mongoose';
import ClientService from "../models/ClientService.js";

/**
 * Create a client service record
 * (when a client avails services)
 */
export async function createClientService (req, res) {
  try {
    const {
      client_id,
      date_rendered,
      service_rendered,
      discount_amount,
      payment,
      reference_code
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(client_id)){
      return res.status(400).json({ message: 'Invalid client ID'});
    }

    if(!service_rendered || !Array.isArray(service_rendered) || service_rendered.length === 0){
      return res.status(400).json({
        message: 'At least one service must be provided'
      });
    }

    if (!req.user?.id){
      return res.status(401).json({ 
        message: 'Unauthorized'
      });
    }

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

    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(500).json({
      error: "Error creating client service record",
      details: err.message
    });
  }
}

/**
 * Get all client services (Admin)
 */

export async function getAllClientServices(req, res){
  try {
    const {
      status,
      is_void,
      client_id,
      limit = 50,
      page = 1
    } = req.query;

    const safeLimit = Math.max(1, Math.min(Number(limit), 100));
    const safePage = Math.max(1, Number(page));

    // 🔎 Build query safely
    const query = {};

    if (status){
      query.status = status;
    }

    if (is_void === undefined){
      query.is_void = false;
    } else {
      query.is_void = is_void === 'true';
    }

    if (client_id && !mongoose.Types.ObjectId.isValid(client_id)){
      return res.status(400).json({
        message: 'Invalid client ID'
      });
    }

    if (client_id){
      query.client_id = client_id;
    }

    const records = await ClientService.find(query).lean()
      .populate('client_id','name email')
      .populate('service_rendered.service_id','name category')
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .skip((safePage - 1) * safeLimit);

    const total = await ClientService.countDocuments(query);

    res.status(200).json({
      total,
      count: records.length,
      page: safePage,
      limit: safeLimit,
      records
    });


  } catch (err) {
    console.error('GetAllClientServices error:', err);

    res.status(500).json({
      error: 'Error fetching client services',
      details: err.message
    });
  }  
}

// export async function  getAllClientServices (req, res) {
//   try {
//     const records = await ClientService.find()
//       .populate("client_id", "name email")
//       .populate("service_rendered.service_id", "name category")
//       .sort({ createdAt: -1 });

//     res.status(200).send(records);
//   } catch (err) {
//     res.status(500).send({
//       error: "Error fetching client services",
//       details: err.message
//     });
//   }
// }

/**
 * Get client service history by client ID
 */

export async function getClientServiceByClient(req, res){
  try {

    const { clientId } = req.params;
    const {
      status,
      include_voided = 'false',
      limit = 50,
      page = 1
    } = req.query;

    const safeLimit = Math.max(1, Math.min(Number(limit), 100));
    const safePage = Math.max(1, Number(page));



    // 1️⃣ Validate client ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        message: 'Invalid client ID'
      });
    }

    // 2️⃣ Build query safely
    const query = {
      client_id: clientId
    }

    // Exclude voided by default
    if (include_voided !== 'true'){
      query.is_void = false;
    }

    // Optional filter status
    if (status) {
      query.status = status;
    }


    // 3️⃣ Fetch records
    const records = await ClientService.find(query).lean()
      .populate('service_rendered.service_id', 'name category')
      .populate('service_rendered.person_assigned.employee_id', 'name')
      .sort({ date_rendered: -1 })
      .limit(safeLimit)
      .skip((safePage -1) * safeLimit);

    const total = await ClientService.countDocuments(query);

    res.status(200).json({
      client_id: clientId,
      total,
      count: records.length,
      page: safePage,
      limit: safeLimit,
      records
    });

  } catch (err) {
    console.error('GetClientServiceByClient', err);

    res.status(500).json({
      error: 'Error fetching client service history',
      details: err.message
    });
  }
}


// export async function getClientServiceByClient (req, res) {
//   try {
    
//     if (!mongoose.Types.ObjectId.isValid(req.params.clientId)){
//       return res.status(400).json({ message: 'Invalid client ID'});
//     }
    
//     const records = await ClientService.find({
//       client_id: req.params.clientId,
//       is_void: false
//     })
//       .populate("service_rendered.service_id", "name category")
//       .populate("service_rendered.person_assigned.employee_id", "name")
//       .sort({ date_rendered: -1 });

//     res.status(200).send(records);
//   } catch (err) {
//     res.status(500).send({
//       error: "Error fetching client service history",
//       details: err.message
//     });
//   }
// }

/**
 * Get single client service record
 */
export async function getClientServiceById (req, res) {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.clientServiceId)){
      return res.status(400).json({ message: "Invalid client service ID"});
    }

    const record = await ClientService.findById(req.params.clientServiceId).lean()
      .populate("client_id", "name email")
      .populate("service_rendered.service_id", "name category")
      .populate("service_rendered.person_assigned.employee_id", "name");

    if (!record) {
      return res.status(404).json({ error: "Client service record not found" });
    }

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({
      error: "Error fetching client service record",
      details: err.message
    });
  }
}

/**
 * Update client service (services, notes, discount)
 */
export async function updateClientService (req, res) {
  try {

    const { clientServiceId } = req.params;

     // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientServiceId)){
      return res.status(400).json({ message: 'Invalid client service ID'});
    }

    // 2️⃣ Load record first (needed to check voided state)
    const record = await ClientService.findById(clientServiceId);

    if (!record){
      return res.status(404).json({
        error: 'Client service record not found'
      });
    }

    // 3️⃣ Block updates if already voided
    if (record.is_void) {
      return res.status(400).json({
        error: 'Cannot modify a voided client service'
      });
    }

    // 4️⃣ Whitelist allowed updates only
    const {
      service_rendered,
      discount_amount,
      notes
    } = req.body;

    if (service_rendered !== undefined){

      if (record.status !== 'pending'){
        return res.status(400).json({
          error: 'Services can only be modified while pending'
        });
      }
      record.service_rendered = service_rendered;
    }

    if (discount_amount !== undefined){
      record.discount_amount = discount_amount;
    }

    if (notes !== undefined){
      record.notes = notes;
    }

    // 5️⃣ Save with validation
    await record.save();

    res.status(200).json(record);
    
  } catch (err) {
    console.error('UpdateClientService error:', err);

    res.status(500).json({
      error: "Error updating client service record",
      details: err.message
    });
  }
}

/**
 * Add payment to a client service
 */
export async function addPayment (req, res) {
  try {
    const { type_of_payment, amount, reference_number, date_paid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.clientServiceId)){
      return res.status(400).json({ message: "Invalid client service ID"});
    }

    const record = await ClientService.findById(req.params.clientServiceId);
    
    if (!record) {
      return res.status(404).json({ error: "Client service record not found" });
    }

    if (record.is_void){
      return res.status(400).json({ error: 'Cannot add payment to a voided client service'});
    }

    if (!type_of_payment || !amount){
      return res.status(400).json({
        error: 'Payment type and amount are required'
      });
    }

    record.payment.push({
      type_of_payment,
      amount,
      reference_number,
      date_paid
    });

    await record.save();

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({
      error: "Error adding payment",
      details: err.message
    });
  }
}

/**
 * Update service status (pending → in_progress → completed)
 */
export async function updateServiceStatus (req, res) {
  try {
    const { clientServiceId } = req.params;
    const { status } = req.body;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientServiceId)){
      return res.status(400).json({ message: "Invalid client service ID"});
    }
    
    // 2️⃣ Validate status value
    const allowedStatuses = [
      'pending',
      'in_progress',
      'completed',
      'cancelled'
    ];

    if (!allowedStatuses.includes(status)){
      return res.status(400).json({
        error: 'Invalid status value'
      });
    }

    // 3️⃣ Load record (needed for business rules)
    const record = await ClientService.findById(clientServiceId);

    if (!record) {
      return res.status(404).json({ error: "Client service record not found" });
    }  

    // 4️⃣ Block updates if voided
    if (record.is_void){
      return res.status(400).json({
        error: 'Cannot update status of a voided client service'
      });
    }

    if (record.status === status){
      return res.status(400).json({
        error: `Service is already '${status}'`
      });
    } 

    // 5️⃣ Prevent backward / invalid transitions (optional but recommended)
    const validTransitions = {
      pending: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[record.status] || 
        !validTransitions[record.status]?.includes(status)){
        return res.status(400).json({
          error: `Cannot change status from '${record.status}' to '${status}'`
      });
    }

    // 6️⃣ Apply status update  
    record.status = status;

    if (status === 'cancelled' && !record.date_cancelled){
      record.date_cancelled = new Date();
    }

    // 7️⃣ Auto-set completion date
    if (status === "completed" && !record.date_completed) {
      record.date_completed = new Date();
    }

    await record.save();

    res.status(200).json(record);
  } catch (err) {

    console.error('UpdateServiceStatus error:', err);
    res.status(500).json({
      error: "Error updating service status",
      details: err.message
    });
  }
}

/**
 * Void a client service record (Admin)
 */
export async function voidClientService (req, res) {
  try {
    const { void_reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.clientServiceId)){
      return res.status(400).json({ message: "Invalid client service ID"});
    }

    const record = await ClientService.findById(req.params.clientServiceId);

    if (!record) {
      return res.status(404).json({ error: "Client service record not found" });
    }

    if (record.is_void) {
      return res.status(400).json({ error: 'Cannot modify a voided client service'});
    }

    if (record.status === 'completed'){
      return res.status(400).json({
        error: 'Completed services cannot be voided'
      });
    }


    record.is_void = true;
    record.void_reason = void_reason;
    record.status = "cancelled";

    await record.save();

    res.status(200).json({
      message: "Client service record voided",
      record
    });
  } catch (err) {
    res.status(500).json({
      error: "Error voiding client service record",
      details: err.message
    });
  }
}
