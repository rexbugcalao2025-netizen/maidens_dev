const express = require('express');
const router = express.Router();

const serviceCategoryController = require('../controllers/serviceCategory.js');
const { verify, verifyAdmin } = require('../auth.js'); // Optional: restrict to admin

// Category routes
router.post('/', verify, verifyAdmin, serviceCategoryController.createCategory);
router.get('/', verify, serviceCategoryController.getCategories);
router.get('/:id', verify, serviceCategoryController.getCategory);
router.put('/:id', verify, verifyAdmin, serviceCategoryController.updateCategory);
router.delete('/:id', verify, verifyAdmin, serviceCategoryController.deleteCategory);
router.patch('/:id', verify, verifyAdmin, serviceCategoryController.restoreCategory);

// Sub-category routes
router.post('/:id/sub', verify, verifyAdmin, serviceCategoryController.addSubCategory);
router.delete('/:id/sub/:subId', verify, verifyAdmin, serviceCategoryController.removeSubCategory);

module.exports = router;
