const Employee = require('../models/Employee');

/**
 * CREATE EMPLOYEE (ADMIN ONLY)
 */
exports.createEmployee = async (req, res) => {
  try {
    const {
      user_id,
      date_hired,
      tax_identification_number,
      job_position
    } = req.body;

    if (!user_id || !date_hired || !tax_identification_number) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const exists = await Employee.findOne({ user_id });
    if (exists) {
      return res.status(409).json({ message: 'Employee already exists for this user' });
    }

    const employee = await Employee.create({
      user_id,
      date_hired,
      tax_identification_number,
      job_position
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ message: 'Failed to create employee' });
  }
};

/**
 * GET ALL EMPLOYEES (ADMIN)
 */
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user_id', 'first_name last_name email');

    res.json(employees);
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

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
