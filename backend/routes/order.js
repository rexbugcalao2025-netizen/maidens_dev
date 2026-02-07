// src/routes/order.js

import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verify, verifyAdmin } from '../auth.js';

const router = express.Router();
/**
 * USER ROUTES
 */

// Get my orders
router.get('/my', verify, orderController.getMyOrders);

// Get single order (owned by user)
router.get('/:id', verify, orderController.getOrderById);

/**
 * ADMIN ROUTES
 */

// Get all orders
router.get('/', verify, verifyAdmin, orderController.getAllOrders);

// Update order status
router.patch('/:id/status', verify, verifyAdmin, orderController.updateOrderStatus);

// Add payment to order
router.post('/:id/payment', verify, verifyAdmin, orderController.addPayment);

// Soft delete order
router.delete('/:id', verify, verifyAdmin, orderController.deleteOrder);

export default router;
