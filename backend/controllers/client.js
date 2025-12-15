const Client = require('../models/Client');

/**
 * CREATE CLIENT (Admin only)
 */
exports.createClient = async (req, res) => {
  try {
    const { user_id, occupation, notes } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const client = await Client.create({
      user_id,
      occupation,
      notes
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
    const clients = await Client.find()
      .populate('user_id', 'first_name last_name email');
    res.json(clients);
  } catch (err) {
    console.error('GetClients error:', err);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
};

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

    const occupation = client.occupation.id(occ_id);
    if (!occupation) {
      return res.status(404).json({ message: 'Occupation not found' });
    }

    occupation.remove();
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
