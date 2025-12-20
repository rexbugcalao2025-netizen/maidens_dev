const express = require('express');
const router = express.Router();

const productCategoryController = require('../controllers/productCategory.js');
const { verify, verifyAdmin } = require('../auth'); // Optional: restrict to admin

// Category routes
router.post('/', verify, verifyAdmin, productCategoryController.createCategory);
router.get('/', verify, productCategoryController.getCategories);
router.get('/:id', verify, productCategoryController.getCategory);
router.put('/:id', verify, verifyAdmin, productCategoryController.updateCategory);
router.delete('/:id', verify, verifyAdmin, productCategoryController.deleteCategory);
router.patch('/:id', verify, verifyAdmin, productCategoryController.restoreCategory);

// Sub-category routes
router.post('/:id/sub', verify, verifyAdmin, productCategoryController.addSubCategory);
router.delete('/:id/sub/:subId', verify, verifyAdmin, productCategoryController.removeSubCategory);

module.exports = router;
