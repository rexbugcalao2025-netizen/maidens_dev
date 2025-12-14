const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { createAccessToken } = require('../auth');

const SALT_ROUNDS = 10;

/* ============================
   AUTH
============================ */

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phones,
      address,
      date_of_birth,
      gender
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phones,
      address,
      date_of_birth,
      gender
    });

    const accessToken = createAccessToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({
      email,
      is_deleted: false
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = createAccessToken(user);

    res.json({
      message: 'Login successful',
      user,
      accessToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

/* ============================
   USER (SELF)
============================ */

/**
 * GET CURRENT USER
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      is_deleted: false
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

/**
 * UPDATE CURRENT USER
 */
exports.updateMe = async (req, res) => {
  try {
    const allowedFields = [
      'first_name',
      'last_name',
      'phones',
      'address',
      'date_of_birth',
      'gender',
      'password'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user.id, is_deleted: false },
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated',
      user
    });
  } catch (err) {
    console.error('UpdateMe error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/* ============================
   ADMIN
============================ */

/**
 * GET ALL USERS
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ is_deleted: false }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('GetUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * SOFT DELETE USER
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { is_deleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('DeleteUser error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/* ============================
   PASSWORD RESET
============================ */

/**
 * REQUEST PASSWORD RESET
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({
      email,
      is_deleted: false
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.json({ message: 'If the email exists, a reset link was sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    // TODO: send email
    console.log(
      'RESET PASSWORD LINK:',
      `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    );

    res.json({ message: 'Password reset link sent' });
  } catch (err) {
    console.error('Request reset error:', err);
    res.status(500).json({ message: 'Failed to request password reset' });
  }
};

/**
 * RESET PASSWORD
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      is_deleted: false
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};


/*
  User add a phone information
*/ 

exports.addPhone = async (req, res) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) return res.status(400).json({ message: "Phone type and value are required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.phones.push({ type, value });
    await user.save();

    res.json({ message: "Phone added successfully", phones: user.phones });
  } catch (err) {
    console.error("Add phone error:", err);
    res.status(500).json({ message: "Failed to add phone" });
  }
};

/*
  User updates a phone information
*/ 

exports.updatePhone = async (req, res) => {
  try {
    const { phoneId } = req.params;
    const { type, value } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const phone = user.phones.id(phoneId);
    if (!phone) return res.status(404).json({ message: "Phone not found" });

    if (type) phone.type = type;
    if (value) phone.value = value;

    await user.save();
    res.json({ message: "Phone updated successfully", phones: user.phones });
  } catch (err) {
    console.error("Update phone error:", err);
    res.status(500).json({ message: "Failed to update phone" });
  }
};


/*
  User removes a phone information
*/ 
exports.removePhone = async (req, res) => {
  try {
    const { phoneId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const initialCount = user.phones.length;
    user.phones = user.phones.filter(p => p._id.toString() !== phoneId);

    if (user.phones.length === initialCount) {
      return res.status(404).json({ message: "Phone not found" });
    }

    await user.save();

    res.json({ message: "Phone removed successfully", phones: user.phones });
  } catch (err) {
    console.error("Remove phone error:", err);
    res.status(500).json({ message: "Failed to remove phone" });
  }
};