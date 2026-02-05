// src/routes/productCategory.js


import express from 'express';
import * as productCategoryController from '../controllers/productCategory.js';
import { verify, verifyAdmin } from '../auth.js'; // Optional: restrict to admin

const router = express.Router();
// Category routes
router.post('/', verify, verifyAdmin, productCategoryController.createCategory);
router.get('/', verify, productCategoryController.getCategories);
router.get('/:id', verify, productCategoryController.getCategory);
router.put('/:id', verify, verifyAdmin, productCategoryController.updateCategory);
router.delete('/:id', verify, verifyAdmin, productCategoryController.deleteCategory);

router.patch(
    '/:id/restore',
    verify,
    verifyAdmin,
    productCategoryController.restoreCategory
);
// router.patch('/:id', verify, verifyAdmin, productCategoryController.restoreCategory);

// Sub-category routes
router.post('/:id/sub', verify, verifyAdmin, productCategoryController.addSubCategory);
router.delete('/:id/sub/:subId', verify, verifyAdmin, productCategoryController.removeSubCategory);

export default router;
