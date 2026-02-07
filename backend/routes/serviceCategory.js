// src/routes/serviceCategory.js

import express from 'express';
import * as serviceCategoryController from '../controllers/serviceCategory.controller.js';
import { verify, verifyAdmin } from '../auth.js'; // Optional: restrict to admin

const router = express.Router();

// Category routes
router.post('/', verify, verifyAdmin, serviceCategoryController.createCategory);
router.get('/', verify, serviceCategoryController.getCategories);
router.get('/:id', verify, serviceCategoryController.getCategory);
router.put('/:id', verify, verifyAdmin, serviceCategoryController.updateCategory);
router.delete('/:id', verify, verifyAdmin, serviceCategoryController.deleteCategory);

router.patch(
    '/:id/restore',
    verify,
    verifyAdmin,
    serviceCategoryController.restoreCategory
);
// router.patch('/:id', verify, verifyAdmin, serviceCategoryController.restoreCategory);

// Sub-category routes
router.post('/:id/sub', verify, verifyAdmin, serviceCategoryController.addSubCategory);
router.delete('/:id/sub/:subId', verify, verifyAdmin, serviceCategoryController.removeSubCategory);

export default router;
