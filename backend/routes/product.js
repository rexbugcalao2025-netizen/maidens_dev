const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { verify, verifyAdmin } = require('../auth');

// Public
router.get('/', productController.getProducts); // TODO: MODIFY FOR PUBLIC USE
router.get('/:id', productController.getProductsById);

// Admin only
router.get('/admin/all',verify, verifyAdmin, productController.getProducts);
router.post('/', verify, verifyAdmin, productController.createProduct);
router.put('/:id', verify, verifyAdmin, productController.updateProduct);
router.put('/:id/images', verify, verifyAdmin, productController.addImages);
router.put('/:id/images/replace', verify, verifyAdmin, productController.updateImages);
router.delete('/:id', verify, verifyAdmin, productController.deleteProduct);

module.exports = router;
