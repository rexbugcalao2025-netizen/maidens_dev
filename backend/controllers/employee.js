const Employee = require('../models/Employee');
const Client = require('../models/Client');
const generateFMHCode = require('../utils/generateFMHCode');

/**
 * CREATE EMPLOYEE (ADMIN ONLY)
 */
exports.createEmployee = async (req, res) => {
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
};


/**
 * GET (ACTIVE) EMPLOYEES (ADMIN)
 */
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      date_retired: null   // ✅ Active employees only
    })
      .populate(
        'user_id',
        'email full_name first_name last_name is_deleted is_admin'
      )

      // Normalize response (same pattern as Clients)
    const normalized = employees.map(emp => {
      const obj = emp.toObject()
      return {
        ...obj,
        user: obj.user_id,
        user_id: undefined
      }
    })

    res.json(normalized)
  } catch (err) {
    console.error('GetEmployees error:', err)
    res.status(500).json({ message: 'Failed to load employees' })
  }
}


/**
 * GET EMPLOYEE BY ID (ADMIN)
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user_id', 'first_name last_name email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
};

/**
 * GET EMPLOYEE BY USER ID (ADMIN)
 */
exports.getEmployeeByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    const employee = await Employee.findOne({
      user_id: userId,
      date_retired: null
    })

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      })
    }

    res.json(employee)
  } catch (err) {
    console.error('GetEmployeeByUserId error:', err)
    res.status(500).json({
      message: 'Failed to load employee'
    })
  }
}

/**
 * GET MY EMPLOYEE PROFILE (LOGGED-IN USER)
 */
exports.getMyEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id })
      .populate('user_id', 'first_name last_name email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error('Get my employee error:', err);
    res.status(500).json({ message: 'Failed to fetch employee profile' });
  }
};

/**
 * UPDATE EMPLOYEE (ADMIN)
 */
exports.updateEmployee = async (req, res) => {
  try {
    const updates = { ...req.body };

    delete updates.user_id; // prevent reassignment

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

/**
 * ADD JOB POSITION (ADMIN)
 */
exports.addJobPosition = async (req, res) => {
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

    res.json({
      message: 'Job position added successfully',
      job_position: employee.job_position
    });
  } catch (err) {
    console.error('Add job position error:', err);
    res.status(500).json({ message: 'Failed to add job position' });
  }
};

/**
 * UPDATE JOB POSITION (ADMIN)
 */
exports.updateJobPosition = async (req, res) => {
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

    res.json({
      message: 'Job position updated successfully',
      job_position: position
    });
  } catch (err) {
    console.error('Update job position error:', err);
    res.status(500).json({ message: 'Failed to update job position' });
  }
};

/**
 * END / DEACTIVATE JOB POSITION (ADMIN)
 */
exports.endJobPosition = async (req, res) => {
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

    res.json({
      message: 'Job position ended successfully',
      job_position: position
    });
  } catch (err) {
    console.error('End job position error:', err);
    res.status(500).json({ message: 'Failed to end job position' });
  }
};

/**
 * REMOVE JOB POSITION (ADMIN – HARD REMOVE)
 */
exports.removeJobPosition = async (req, res) => {
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

    res.json({ message: 'Job position removed permanently' });
  } catch (err) {
    console.error('Remove job position error:', err);
    res.status(500).json({ message: 'Failed to remove job position' });
  }
};

/**
 * ADD EMPLOYEE CREDENTIAL (ADMIN)
 */
exports.addCredential = async (req, res) => {
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

    res.status(201).json({
      message: 'Credential added successfully',
      credentials: employee.credentials
    });
  } catch (err) {
    console.error('AddCredential error:', err);
    res.status(500).json({ message: 'Failed to add credential' });
  }
};

/**
 * UPDATE EMPLOYEE CREDENTIAL (ADMIN)
 */
exports.updateCredential = async (req, res) => {
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

    res.json({
      message: 'Credential updated successfully',
      credential
    });
  } catch (err) {
    console.error('UpdateCredential error:', err);
    res.status(500).json({ message: 'Failed to update credential' });
  }
};

/**
 * REMOVE EMPLOYEE CREDENTIAL (ADMIN)
 */
exports.removeCredential = async (req, res) => {
  try {
    const { employeeId, credentialId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Remove the credential by filtering the array
    employee.credentials = employee.credentials.filter(
      (cred) => cred._id.toString() !== credentialId
    );

    await employee.save();

    res.json({
      message: 'Credential removed successfully'
    });
  } catch (err) {
    console.error('RemoveCredential error:', err);
    res.status(500).json({ message: 'Failed to remove credential' });
  }
};

/**
 * GET EMPLOYEE CREDENTIALS (ADMIN)
 */
exports.getCredentials = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Auto-deactivate expired credentials
    employee.deactivateExpiredCredentials();
    await employee.save();

    res.json(employee.credentials);
  } catch (err) {
    console.error('GetCredentials error:', err);
    res.status(500).json({ message: 'Failed to fetch credentials' });
  }
};



