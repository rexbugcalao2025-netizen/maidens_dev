const ProductCategory = require('../models/ProductCategory');

/**
 * CREATE CATEGORY
 */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await ProductCategory.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = await ProductCategory.create({ name });
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    console.error('CreateCategory error:', err);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

/**
 * GET ALL CATEGORIES
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error('GetCategories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

/**
 * GET SINGLE CATEGORY
 */
exports.getCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    console.error('GetCategory error:', err);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

/**
 * UPDATE CATEGORY
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated', category });
  } catch (err) {
    console.error('UpdateCategory error:', err);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

/**
 * SOFT DELETE CATEGORY
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted (soft delete)' });
  } catch (err) {
    console.error('DeleteCategory error:', err);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};


/**
 * RESTORE CATEGORY
 */
exports.restoreCategory = async (req, res) => {
  const result = await ProductCategory.updateOne(
    { _id: req.params.id },
    { $set: { is_deleted: false } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json({ message: 'Category restored' });
};


/**
 * ADD SUB-CATEGORY
 */
exports.addSubCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Sub-category name is required' });

    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check for duplicates
    const exists = category.sub_categories.some(sc => sc.name.toLowerCase() === name.toLowerCase());
    if (exists) return res.status(409).json({ message: 'Sub-category already exists' });

    category.sub_categories.push({ name });
    await category.save();

    res.json({ message: 'Sub-category added', category });
  } catch (err) {
    console.error('AddSubCategory error:', err);
    res.status(500).json({ message: 'Failed to add sub-category' });
  }
};

/**
 * REMOVE SUB-CATEGORY
 */
exports.removeSubCategory = async (req, res) => {
  try {
    const { subId } = req.params;

    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const subIndex = category.sub_categories.findIndex(sc => sc._id.toString() === subId);
    if (subIndex === -1) return res.status(404).json({ message: 'Sub-category not found' });

    category.sub_categories.splice(subIndex, 1);
    await category.save();

    res.json({ message: 'Sub-category removed', category });
  } catch (err) {
    console.error('RemoveSubCategory error:', err);
    res.status(500).json({ message: 'Failed to remove sub-category' });
  }
};
