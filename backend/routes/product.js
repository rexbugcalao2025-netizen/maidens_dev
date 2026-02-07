// src/routes/product.js

import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { verify, verifyAdmin } from '../auth.js';

const router = express.Router();

// Public
router.get('/', productController.getProducts); // TODO: MODIFY FOR PUBLIC USE
// Admin
router.get('/admin/all',verify, verifyAdmin, productController.getProducts);
// Public
router.get('/:id', productController.getProductsById);

// Admin only
router.post('/', verify, verifyAdmin, productController.createProduct);
router.put('/:id', verify, verifyAdmin, productController.updateProduct);
router.put('/:id/images', verify, verifyAdmin, productController.addImages);
router.put('/:id/images/replace', verify, verifyAdmin, productController.updateImages);
router.delete('/:id', verify, verifyAdmin, productController.deleteProduct);

export default router;
