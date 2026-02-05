// src/controllers/client.js

import mongoose from 'mongoose';
import Client from '../models/Client.js';
import Employee from '../models/Employee.js';
import generateFMHCode from '../utils/generateFMHCode.js';


/**
 * CREATE CLIENT (Admin only)
 */
export async function createClient (req, res) {
  try {

    // note: assign values from requesting procedure (eg. postman body, or frontend payload)
    const { user_id, occupation, notes } = req.body; 

    // note: ensures that user_id is provided
    // if (!user_id) {
    //   return res.status(400).json({ message: 'user_id is required' });
    // }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400)
        .json({ message: 'Invalid user ID'});
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
}

/**
 * GET ALL CLIENTS (Admin only)
 */
export async function getClients (req, res) {
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
export async function getClientById (req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

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
}

/**
 * GET CLIENT BY USER ID (Admin only)
 */
export async function getClientByUserId (req, res) {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400)
          .json({ message: 'Invalid user ID'});
    }

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
export async function updateClient (req, res) {
  try {
    const { id } = req.params;
    const { occupation, notes } = req.body;
    
    const updates = {};
    if (occupation !== undefined) updates.occupation = occupation;
    if (notes !== undefined) updates.notes = notes;


    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

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
}

/**
 * SOFT DELETE CLIENT (Admin only)
 */
export async function deleteClient (req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

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
}

/**
 * ADD OCCUPATION TO CLIENT (Admin only)
 */
export async function addOccupation (req, res) {
  try {
    const { id } = req.params;
    const occupation = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

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
}

/**
 * UPDATE OCCUPATION (Admin only)
 */
export async function updateOccupation (req, res) {
  try {
    const { id, occ_id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(occ_id)){
      return res.status(400)
        .json({ message: 'Invalid occupation ID' });
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
}

/**
 * REMOVE OCCUPATION (Admin only)
 */
export async function removeOccupation (req, res) {
  try {
    const { id, occ_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

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
}

/**
 * UPDATE CLIENT NOTES (Admin only)
 */
export async function updateClientNotes (req, res) {
  try {
    const { id } = req.params
    const { notes } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400)
          .json({ message: 'Invalid client ID'});
    }

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