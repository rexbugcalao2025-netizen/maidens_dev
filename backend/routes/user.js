// src/routes/user.js

import express from 'express';
import * as userController from '../controllers/user.js';
import { verify, verifyAdmin } from '../auth.js';
// import auth from '../auth.js';
import { addPhone, updatePhone, removePhone } from '../controllers/user.js';

const router = express.Router();

/* ============================
   AUTH (PUBLIC)
============================ */

/**
 * Register
 */
router.post('/register', userController.register);

/**
 * Login
 */
router.post('/login', userController.login);

/**
 * Request password reset
 */
router.post('/password-reset/request', userController.requestPasswordReset);

/**
 * Reset password (with token)
 */
router.post('/password-reset/confirm', userController.resetPassword);

/* ============================
   USER (AUTHENTICATED)
============================ */

/**
 * Get current logged-in user
 */
router.get('/me', auth.verify, userController.getMe);

/**
 * Update current user profile
 */
router.put('/me', auth.verify, userController.updateMe);

/* ============================
   ADMIN (PROTECTED)
============================ */

/**
 * Get all users
 */
router.get('/', auth.verify, auth.verifyAdmin, userController.getUsers);

// ✅ Get user by ID (admin)
router.get('/:id', auth.verify, auth.verifyAdmin, userController.getUserById);

/**
 * Soft delete user
 */
router.delete('/:id', auth.verify, auth.verifyAdmin, userController.deleteUser);


/**
 * User Phones 
 */
router.post('/phones', verify, addPhone); // add a phone
router.patch('/phones/:phoneId', verify, updatePhone); // update a phone
router.delete('/phones/:phoneId', verify, removePhone); // remove a phone


export default router;
