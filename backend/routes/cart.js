// src/routes/cart

import express from 'express';
import * as cartController from '../controllers/cart.js';
import { verify } from '../auth.js';

const router = express.Router();

/**
 * CART ROUTES (Authenticated Users)
 */

// Get active cart (or create one)
router.get('/', verify, cartController.getMyCart);

// Add item to cart
router.post('/items', verify, cartController.addItem);

// Update cart item quantity
router.put('/items/:itemId', verify, cartController.updateItem);

// Remove item from cart
router.delete('/items/:itemId', verify, cartController.removeItem);

// Checkout (convert cart → order)
router.post('/checkout', verify, cartController.checkout);

export default router;
