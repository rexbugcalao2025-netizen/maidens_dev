const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { verify, verifyAdmin } = require('../auth');

// Public
router.get('/', productController.getProducts);

// Admin only
router.post('/', verify, verifyAdmin, productController.createProduct);
router.put('/:id', verify, verifyAdmin, productController.updateProduct);
router.put('/:id/images', verify, verifyAdmin, productController.addImages);
router.delete('/:id', verify, verifyAdmin, productController.deleteProduct);

module.exports = router;
