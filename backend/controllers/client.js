const Client = require('../models/Client');
const Employee = require('../models/Employee');
const generateFMHCode = require('../utils/generateFMHCode');

/**
 * CREATE CLIENT (Admin only)
 */
exports.createClient = async (req, res) => {
  try {

    // note: assign values from requesting procedure (eg. postman body, or frontend payload)
    const { user_id, occupation, notes } = req.body; 

    // note: ensures that user_id is provided
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    // 🚫 BLOCK: user is an employee
    const existingEmployee = await Employee.findOne({
      user_id
      // ,date_retired: null
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: 'User is an employee and cannot be a client'
      });
    }

    // note: generate FMH client code
    const clientCode = await generateFMHCode({
      type: 'client',
      branch: 'DVO'
    });

    
    const client = await Client.create({      
      user_id,
      occupation,
      notes,
      client_code: clientCode,
    });

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (err) {
    console.error('CreateClient error:', err);
    res.status(500).json({ message: 'Failed to create client' });
  }
};

/**
 * GET ALL CLIENTS (Admin only)
 */
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ is_deleted: false })
      .populate('user_id', 'email full_name first_name last_name is_admin')

    // 🔄 Normalize response
    const normalizedClients = clients.map(client => {
      const obj = client.toObject()

      return {
        ...obj,
        user: obj.user_id,   // expose as `user`
        user_id: undefined   // hide internal ref
      }
    })

    res.json(normalizedClients)
  } catch (err) {
    console.error('GetClients error:', err)
    res.status(500).json({ message: 'Failed to load clients' })
  }
}



/**
 * GET CLIENT BY ID (Admin only)
 */
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id)
      .populate('user_id', 'first_name last_name email');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (err) {
    console.error('GetClientById error:', err);
    res.status(500).json({ message: 'Failed to fetch client' });
  }
};

/**
 * GET CLIENT BY USER ID (Admin only)
 */
exports.getClientByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    const client = await Client.findOne({
      user_id: userId,
      is_deleted: false
    })

    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    res.json(client)
  } catch (err) {
    console.error('GetClientByUserId error:', err)
    res.status(500).json({ message: 'Failed to load client' })
  }
}

/**
 * UPDATE CLIENT NOTES OR OCCUPATION (Admin only)
 */
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const client = await Client.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: 'Client updated successfully',
      client
    });
  } catch (err) {
    console.error('UpdateClient error:', err);
    res.status(500).json({ message: 'Failed to update client' });
  }
};

/**
 * SOFT DELETE CLIENT (Admin only)
 */
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndUpdate(
      id,
      { is_deleted: true },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully', client });
  } catch (err) {
    console.error('DeleteClient error:', err);
    res.status(500).json({ message: 'Failed to delete client' });
  }
};

/**
 * ADD OCCUPATION TO CLIENT (Admin only)
 */
exports.addOccupation = async (req, res) => {
  try {
    const { id } = req.params;
    const occupation = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.occupation.push(occupation);
    await client.save();

    res.status(201).json({
      message: 'Occupation added successfully',
      client
    });
  } catch (err) {
    console.error('AddOccupation error:', err);
    res.status(500).json({ message: 'Failed to add occupation' });
  }
};

/**
 * UPDATE OCCUPATION (Admin only)
 */
exports.updateOccupation = async (req, res) => {
  try {
    const { id, occ_id } = req.params;
    const updates = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const occupation = client.occupation.id(occ_id);
    if (!occupation) {
      return res.status(404).json({ message: 'Occupation not found' });
    }

    Object.assign(occupation, updates);
    await client.save();

    res.json({
      message: 'Occupation updated successfully',
      client
    });
  } catch (err) {
    console.error('UpdateOccupation error:', err);
    res.status(500).json({ message: 'Failed to update occupation' });
  }
};

/**
 * REMOVE OCCUPATION (Admin only)
 */
exports.removeOccupation = async (req, res) => {
  try {
    const { id, occ_id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const originalLength = client.occupation.length;

    client.occupation = client.occupation.filter(
      occ => occ._id.toString() !== occ_id
    );

    if (client.occupation.length === originalLength) {
      return res.status(404).json({ message: 'Occupation not found' });
    }

    await client.save();

    res.json({
      message: 'Occupation removed successfully',
      client
    });
  } catch (err) {
    console.error('RemoveOccupation error:', err);
    res.status(500).json({ message: 'Failed to remove occupation' });
  }
};

/**
 * UPDATE CLIENT NOTES (Admin only)
 */
exports.updateClientNotes = async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    const client = await Client.findById(id)
    if (!client || client.is_deleted) {
      return res.status(404).json({ message: 'Client not found' })
    }

    client.notes = notes
    await client.save()

    res.json({
      message: 'Client notes updated',
      client
    })
  } catch (err) {
    console.error('UpdateClientNotes error:', err)
    res.status(500).json({ message: 'Failed to update client notes' })
  }
}