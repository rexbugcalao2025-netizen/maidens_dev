// src/controllers/employee.js


import Employee from '../models/Employee.js';
import Client from '../models/Client.js';
import generateFMHCode from '../utils/generateFMHCode.js';

/**
 * CREATE EMPLOYEE (ADMIN ONLY)
 */
export async function createEmployee (req, res) {
  try {

    // note: assigns values from requesting procedure (eg. Postman body or frontend payload)
    const {
      user_id,
      date_hired,
      tax_identification_number,
      job_position = [],
      credentials = []
    } = req.body;

    // note: ensure that user_id and date_hired is not empty or null
    if (!user_id || !date_hired) {
      return res.status(400).json({
        message: 'user_id and date_hired are required'
      });
    }

    // note: ensure that user_id is not used by other employee
    const exists = await Employee.findOne({ user_id });
    if (exists) {
      return res.status(409).json({
        message: 'Employee already exists for this user'
      });
    }

    // note: ensure that user_id is not used by a client.
    const isClient = await Client.findOne({user_id});
    if (isClient){
      return res.status(409)
        .json({
          message: 'User Id has already been assigned to a client'
        });
    }

    const employeeCode = await generateFMHCode({
      type: 'employee',
      branch: 'DVO'
    });


    const employee = await Employee.create({      
      user_id,
      date_hired,
      tax_identification_number,
      job_position,
      credentials,
      employee_code: employeeCode
    });

    return res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (err) {
    console.error('Create employee error:', err);

    return res.status(500).json({
      message: err.message || 'Failed to create employee'
    });
  }
}


/**
 * GET (ACTIVE) EMPLOYEES (ADMIN)
 */
export async function getEmployees (req, res) {
  try {
    const employees = await Employee.find({
      date_retired: null   // ✅ Active employees only
    })
      .populate({
        path: 'user_id',
        select: 'email full_name first_name last_name is_deleted is_admin',
        match: { is_deleted: false }
    });

    // Normalize response (same pattern as Clients)
    const normalized = employees
      .filter(emp => emp.user_id) // drop employees with deleted users
      .map(emp => {

        const obj = emp.toObject();

        return {
          ...obj,
          user: obj.user_id,
          user_id: undefined
        };

      });

    // const normalized = employees.map(emp => {
    //   const obj = emp.toObject();
    //   return {
    //     ...obj,
    //     user: obj.user_id,
    //     user_id: undefined
    //   }
    // })

    return res.json(normalized);

  } catch (err) {
    console.error('GetEmployees error:', err);
    res.status(500).json({ message: 'Failed to load employees' });
  }
}


/**
 * GET EMPLOYEE BY ID (ADMIN)
 */
export async function getEmployeeById (req, res) {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate({
        path: 'user_id', 
        select: 'first_name last_name email'
      });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json({ 
      message: 'Employee fetched successfully', 
      employee 
    });

  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
}

/**
 * GET EMPLOYEE BY USER ID (ADMIN)
 */
export async function getEmployeeByUserId (req, res) {
  try {
    const { userId } = req.params;

    const employee = await Employee.findOne({
      user_id: userId,
      date_retired: null
    })
    .populate({
      path: 'user_id',
      select: 'first_name last_name email'
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.json({ 
      message: 'Employee fetched successfully', 
      employee 
    });

  } catch (err) {
    console.error('GetEmployeeByUserId error:', err);
    res.status(500).json({
      message: 'Failed to load employee'
    });
  }
}

/**
 * GET MY EMPLOYEE PROFILE (LOGGED-IN USER)
 */
export async function getMyEmployeeProfile (req, res) {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id })
      .populate({
        path: 'user_id', 
        select: 'first_name last_name email'
      });

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    return res.json({ 
      message: 'Employee fetched successfully', 
      employee 
    });

  } catch (err) {
    console.error('Get my employee error:', err);
    res.status(500).json({ message: 'Failed to fetch employee profile' });
  }
}

/**
 * UPDATE EMPLOYEE (ADMIN)
 */
export async function updateEmployee (req, res) {
  try {
    
    const allowedUpdates = [
      'date_hired',
      'tax_identification_number',
      'job_position',
      'credentials',
      'date_retired'
    ];
    
    // const updates = { ...req.body };
    const updates = {};

    for (const key of allowedUpdates){
      if (req.body[key] !== undefined){
        updates[key] = req.body[key];
      }
    }

    // delete updates.user_id; // prevent reassignment

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ message: 'Failed to update employee' });
  }
}

/**
 * ADD JOB POSITION (ADMIN)
 */
export async function addJobPosition (req, res) {
  try {
    const { title, entity, date_started } = req.body;

    if (!title || !entity || !date_started) {
      return res.status(400).json({ message: 'Title, entity and start date required' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.job_position.push({
      title,
      entity,
      date_started,
      is_active: true,
      date_ended: null
    });

    await employee.save();

    return res.json({
      message: 'Job position added successfully',
      job_position: employee.job_position
    });

  } catch (err) {
    console.error('Add job position error:', err);
    res.status(500).json({ message: 'Failed to add job position' });
  }
}

/**
 * UPDATE JOB POSITION (ADMIN)
 */
export async function updateJobPosition (req, res) {
  try {
    const { id, positionId } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const position = employee.job_position.id(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Job position not found' });
    }

    Object.assign(position, req.body);

    await employee.save();

    return res.json({
      message: 'Job position updated successfully',
      job_position: position
    });

  } catch (err) {
    console.error('Update job position error:', err);
    res.status(500).json({ message: 'Failed to update job position' });
  }
}

/**
 * END / DEACTIVATE JOB POSITION (ADMIN)
 */
export async function endJobPosition (req, res) {
  try {
    const { id, positionId } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const position = employee.job_position.id(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Job position not found' });
    }

    position.is_active = false;
    position.date_ended = new Date();

    await employee.save();

    return res.json({
      message: 'Job position ended successfully',
      job_position: position
    });

  } catch (err) {
    console.error('End job position error:', err);
    res.status(500).json({ message: 'Failed to end job position' });
  }
}

/**
 * REMOVE JOB POSITION (ADMIN – HARD REMOVE)
 */
export async function removeJobPosition (req, res) {
  try {
    const { id, positionId } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const position = employee.job_position.id(positionId);
    if (!position) {
      return res.status(404).json({ message: 'Job position not found' });
    }

    position.deleteOne();
    await employee.save();

    return res.json({ message: 'Job position removed permanently' });

  } catch (err) {
    console.error('Remove job position error:', err);
    res.status(500).json({ message: 'Failed to remove job position' });
  }
}

/**
 * ADD EMPLOYEE CREDENTIAL (ADMIN)
 */
export async function addCredential (req, res) {
  try {
    const { employeeId } = req.params;
    const {
      credential_type,
      value,
      acquire_on_date,
      expire_on_date
    } = req.body;

    if (!credential_type || !value || !acquire_on_date) {
      return res.status(400).json({
        message: 'credential_type, value, and acquire_on_date are required'
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.credentials.push({
      credential_type,
      value,
      acquire_on_date,
      expire_on_date
    });

    await employee.save();

    return res.status(201).json({
      message: 'Credential added successfully',
      credentials: employee.credentials
    });

  } catch (err) {
    console.error('AddCredential error:', err);
    res.status(500).json({ message: 'Failed to add credential' });
  }
}

/**
 * UPDATE EMPLOYEE CREDENTIAL (ADMIN)
 */
export async function updateCredential (req, res) {
  try {
    const { employeeId, credentialId } = req.params;
    const updates = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const credential = employee.credentials.id(credentialId);
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    Object.assign(credential, updates);

    await employee.save();

    return res.json({
      message: 'Credential updated successfully',
      credential
    });

  } catch (err) {
    console.error('UpdateCredential error:', err);
    res.status(500).json({ message: 'Failed to update credential' });
  }
}

/**
 * REMOVE EMPLOYEE CREDENTIAL (ADMIN)
 */
export async function removeCredential (req, res) {
  try {
    const { employeeId, credentialId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Remove the credential by filtering the array
    const credential = employee.credentials.id(credentialId);

    if (!credential){
      return res.status(404).json({
        message: 'Credential not found'
      });
    }

    credential.deleteOne();
    
    // employee.credentials = employee.credentials.filter(
    //   (cred) => cred._id.toString() !== credentialId
    // );

    await employee.save();

    return res.json({
      message: 'Credential removed successfully'
    });

  } catch (err) {
    console.error('RemoveCredential error:', err);
    res.status(500).json({ message: 'Failed to remove credential' });
  }
}

/**
 * GET EMPLOYEE CREDENTIALS (ADMIN)
 */
export async function getCredentials (req, res) {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Auto-deactivate expired credentials
    employee.deactivateExpiredCredentials();
    await employee.save();

    return res.json(employee.credentials);
  } catch (err) {
    console.error('GetCredentials error:', err);
    res.status(500).json({ message: 'Failed to fetch credentials' });
  }
}



