const Product = require('../models/Product');

/**
 * Create Product
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sub_category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      price_history: [{ price }],
      category,
      sub_category
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (err) {
    console.error('CreateProduct error:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

/**
 * Add Images to Product
 */
exports.addImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // expect array of URLs or paths

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.images.push(...images);
    await product.save();

    res.json({ message: 'Images added', product });
  } catch (err) {
    console.error('AddImages error:', err);
    res.status(500).json({ message: 'Failed to add images' });
  }
};

/**
 * Update Product
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // If price changes, add to price history
    if (updates.price) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (updates.price !== product.price) {
        product.price = updates.price;
        product.price_history.push({ price: updates.price });
      }

      // Update other fields
      if (updates.name) product.name = updates.name;
      if (updates.description) product.description = updates.description;
      if (updates.category) product.category = updates.category;
      if (updates.sub_category) product.sub_category = updates.sub_category;

      await product.save();
      return res.json({ message: 'Product updated', product });
    }

    // For non-price updates
    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product updated', product });
  } catch (err) {
    console.error('UpdateProduct error:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

/**
 * Get All Products
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .populate('sub_category')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error('GetProducts error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

/**
 * Soft Delete Product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully', product });
  } catch (err) {
    console.error('DeleteProduct error:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
