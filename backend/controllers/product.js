// src/controllers/product.js

import Product from '../models/Product.js';

/**
 * Create Product
 */
export async function createProduct(req, res) {
  try {
    const { name, description, price, category, sub_category } = req.body;

    if (!name || price === undefined || !category) {
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
}

/**
 * Add Images to Product
 */
export async function addImages(req, res) {
  try {
    const { id } = req.params;
    const { images } = req.body; // expect array of URLs or paths

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.images = product.images || [];
    product.images.push(...images);
    await product.save();

    res.json({ message: 'Images added', product });
  } catch (err) {
    console.error('AddImages error:', err);
    res.status(500).json({ message: 'Failed to add images' });
  }
}

/**
 * Update Product
 */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    /* PRICE CHANGE DETECTION */
    if (
      typeof updates.price === 'number' &&
      updates.price !== product.price
    ) {
      product.price = updates.price;
      product.price_history.push({
        price: updates.price,
        date_changed: new Date()
      });
    }

    /* OTHER FIELDS */
    if (typeof updates.name === 'string') {
      product.name = updates.name;
    }

    if (typeof updates.description === 'string') {
      product.description = updates.description;
    }

    if (updates.category) {
      product.category = updates.category;
    }

    // allow explicit null (important)
    if ('sub_category' in updates) {
      product.sub_category = updates.sub_category;
    }

    await product.save();

    res.json({ message: 'Product updated', product });

  } catch (err) {
    console.error('UpdateProduct error:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
}


/**
 * Replace Product Images (used for removal)
 */
export async function updateImages(req, res) {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.images = images;
    await product.save();

    res.json({ message: 'Images updated', product });

  } catch (err) {
    console.error('UpdateImages error:', err);
    res.status(500).json({ message: 'Failed to update images' });
  }
}

/**
 * Get All Products
 */
export async function getProducts(req, res) {
  try {
      const products = await Product.find({ is_deleted: false })
        .populate({
          path: 'category',
          select: '_id name is_deleted' // ✅ exclude sub_categories
        })
        // ❌ DO NOT populate sub_category
        .sort({ createdAt: -1 });

      res.json(products);
    } catch (err) {
      console.error('GetProducts error:', err);
      res.status(500).json({ message: 'Failed to fetch products' });
  }
}

export async function getProductsById(req, res) {
  try {

    const product = await Product.findById(req.params.id);
    if (!product) return  res.status(404).json({message: 'Product not found'});
    res.json(product);

  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({message: 'Failed to fetch product'});
  }

}

/**
 * Soft Delete Product
 */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully', product });
  } catch (err) {
    console.error('DeleteProduct error:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
}
