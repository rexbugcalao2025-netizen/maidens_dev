// src/controllers/service.js

import Service from "../models/Service.js";
import ServiceCategory from "../models/ServiceCategory.js";

/**
 * Create a new service (Admin)
 */
export async function createService(req, res) {
  try {
    const {
      name,
      description,
      category_id,
      sub_category_id,      
      duration,
      duration_unit,
      total_price,
      labor_price,
      materials,
      date_offered,
      date_ended
    } = req.body;
    
    const safeMaterials = Array.isArray(materials) ? materials : [];

    if (!req.user || !req.user.id) {
     return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!name || !category_id || !sub_category_id){
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    if (typeof total_price !== 'number'){
      return res.status(400).json({
        error: 'Invalid total price'
      });
    }

    if (labor_price !== undefined && typeof labor_price !== "number") {
      return res.status(400).json({
        error: "Invalid labor price"
      });
    }

    const categoryDoc = await ServiceCategory.findById(category_id);
    if (!categoryDoc || categoryDoc.is_deleted) {
      return res.status(400).json({ error: "Invalid service category" });
    }

    const subCategory = categoryDoc.sub_categories.id(sub_category_id);
    if (!subCategory || subCategory.is_deleted) {
      return res.status(400).json({ error: "Invalid service subcategory" });
    }


    const newService = new Service({
      name,
      description,
      category: {
        id: categoryDoc._id,
        name: categoryDoc.name,
        is_deleted: categoryDoc.is_deleted
      },
      sub_category: {
        id: subCategory._id,
        name: subCategory.name,
        is_deleted: subCategory.is_deleted
      },      
      duration,
      duration_unit,
      labor_price,
      total_price,
      date_offered,
      date_ended,
      materials: safeMaterials,
      created_by: req.user.id
    });


    const savedService = await newService.save();
    return res.status(201).json(savedService);

  } catch (err) {
    console.error("CreateService error:", err);
    return res.status(500).json({
      error: "Error creating service",
      details: err.message
    });
  }
}



/**
 * Get all active services (Public)
 */
export async function getActiveServices(req, res) {
  try {
    const services = await Service.find({
      is_active: true
    }).sort({ createdAt: -1 });

    return res.status(200).json(services);
  } catch (err) {
    return res.status(500).json({
      error: "Error fetching services",
      details: err.message
    });
  }
}

/**
 * Get all services (Admin)
 */
export async function getAllServices(req, res) {
  try {
    const services = await Service.find()
      .populate("created_by", "email")
      .sort({ createdAt: -1 });

    return res.status(200).json(services);

  } catch (err) {
    return res.status(500).json({
      error: "Error fetching services",
      details: err.message
    });
  }
}

/**
 * Get single service by ID
 */
export async function getServiceById(req, res) {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    return res.status(200).json(service);

  } catch (err) {
    return res.status(500).json({
      error: "Error fetching service",
      details: err.message
    });
  }
}

/**
 * Update service (Admin)
 */

export async function updateService(req, res) {
  try{

    const { serviceId } = req.params;

    // -- Updates dont include categories and sub-categories
    // -- Retire the existing Service and create a new one with chosen category and sub-category
    // Fields that are allowed to be updated

    const allowedFields = [
      "name",
      "description",
      "duration",      
      "duration_unit",
      "labor_price",
      "materials",
      "date_ended"
    ];

    // 1️⃣ Fetch service first (so we can enforce business rules)
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }

    // 2️⃣ Business rule: archived services are immutable
    if (!service.is_active) {
      return res.status(400).json({
        error: 'Archived services cannot be updated'
      });
    }

    // 3️⃣ Apply allowed updates only
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Defensive handling for materials
        if (field === 'materials'){
          service.materials = Array.isArray(req.body.materials)
            ? req.body.materials
            : [];
        } else {
          service[field] = req.body[field];
        }
      }
    }

    // 4️⃣ Persist changes
    await service.save();

    return res.status(200).json(service);

  } catch (err) {
    console.error('UpdateService Error:', err);
    return res.status(500).json({
      error: 'Error updating service',
      details: err.message
    });
  }
}

// export async function updateService(req, res) {
//   try {

//     // -- Updates dont include categories and sub-categories
//     // -- Retire the existing Service and create a new one with chosen category and sub-category

//     const allowedFields = [
//       "name",
//       "description",
//       "duration",
//       "duration_unit",
//       "labor_price",
//       "materials",
//       "date_ended"
//     ];

//     const updates = {};
//     allowedFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     const updatedService = await Service.findByIdAndUpdate(
//       req.params.serviceId,
//       updates,
//       { new: true, runValidators: true }
//     );

//     if (!updatedService) {
//       return res.status(404).json({ error: "Service not found" });
//     }

//     return res.status(200).json(updatedService);

//   } catch (err) {
//     return res.status(500).json({
//       error: "Error updating service",
//       details: err.message
//     });
//   }
// }

/**
 * Archive service (Admin)
 * Soft-delete using date_ended + is_active
 */
export async function archiveService(req, res) {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    service.date_ended = new Date();
    service.is_active = false;

    await service.save();

    return res.status(200).json({
      message: "Service archived successfully",
      service
    });

  } catch (err) {
    return res.status(500).json({
      error: "Error archiving service",
      details: err.message
    });
  }
}
