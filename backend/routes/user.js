// src/routes/user.js

import express from 'express';
import * as userController from '../controllers/user.js';
import { verify, verifyAdmin } from '../auth.js';


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
router.get('/me', verify, userController.getMe);

/**
 * Update current user profile
 */
router.put('/me', verify, userController.updateMe);

/* ============================
   ADMIN (PROTECTED)
============================ */

/**
 * Get all users
 */
router.get('/', verify, verifyAdmin, userController.getUsers);

// ✅ Get user by ID (admin)
router.get('/:id', verify, verifyAdmin, userController.getUserById);

/**
 * Soft delete user
 */
router.delete('/:id', verify, verifyAdmin, userController.deleteUser);


/**
 * User Phones 
 */
router.post('/phones', verify, userController.addPhone); // add a phone
router.patch('/phones/:phoneId', verify, userController.updatePhone); // update a phone
router.delete('/phones/:phoneId', verify, userController.removePhone); // remove a phone


export default router;
