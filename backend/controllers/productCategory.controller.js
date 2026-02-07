// src/controllers/productCategory.js


import ProductCategory from '../models/ProductCategory.js';

/**
 * CREATE CATEGORY
 */
export async function createCategory(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ 
        message: 'Category name is required' 
      });
    }

    const existing = await ProductCategory.findOne({ name });
    
    if (existing) {
      return res.status(409).json({ 
        message: 'Category already exists' 
      });
    }

    const category = await ProductCategory.create({ name });

    res.status(201).json({ 
      message: 'Category created', category 
    });

  } catch (err) {
    console.error('CreateCategory error:', err);
    res.status(500).json({ message: 'Failed to create category' });
  }
}

/**
 * GET ALL CATEGORIES
 */
export async function getCategories(req, res) {
  try {
    const categories = await ProductCategory
      .find()
      .setOptions({ includeDeleted: true }) // ✅ OVERRIDE SOFT DELETE
      .sort({ createdAt: -1 });

    return res.status(200).json(categories);

  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ 
      error: 'Error fetching categories' 
    });
  }
}

/**
 * GET SINGLE CATEGORY
 */
export async function getCategory(req, res) {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      }); 
    }

    return res.json(category);

  } catch (err) {
    console.error('GetCategory error:', err);
    return res.status(500).json({ 
      message: 'Failed to fetch category' 
    });
  }
}

/**
 * UPDATE CATEGORY
 */
export async function updateCategory(req, res) {
  try {
    const { name } = req.body;

    // const category = await ProductCategory.findByIdAndUpdate(
    //   req.params.id,
    //   { name },
    //   { new: true, runValidators: true }
    // );

    const category = await ProductCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found' 
      });
    }
    
    // BUSINESS RULE: Archived categories can only be restored but not edited.
    if (category.is_deleted) {
      return res.status(400).json({
        message: 'Cannot edit a Category in archive'
      });
    }

    if(!name){
      return res.status(400).json({
        message: 'Category name is required'
      });
    }

    category.name = name;
    await category.save();

    return res.json({ message: 'Category updated', category });

  } catch (err) {
    console.error('UpdateCategory error:', err);
    return res.status(500).json({ 
      message: 'Failed to update category' 
    });
  }
}

/**
 * SOFT DELETE CATEGORY
 */
export async function deleteCategory(req, res) {
  try {
    const category = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    res.json({
       message: 'Category deleted (soft delete)' 
      });

  } catch (err) {
    console.error('DeleteCategory error:', err);
    return res.status(500).json({ 
      message: 'Failed to delete category' 
    });
  }
}


/**
 * RESTORE CATEGORY
 */
export async function restoreCategory(req, res) {
  try {
    const result = await ProductCategory.updateOne(
      { _id: req.params.id },
      { $set: { is_deleted: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    return res.json({ message: 'Category restored' });

  } catch (err){
    console.error('RestoreCategory error:', err);
    return res.status(500).json({
      message: 'Failed to restore category'
    });
  }
  
}


/**
 * ADD SUB-CATEGORY
 */
export async function addSubCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ 
        message: 'Sub-category name is required' 
      });
    }

    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' });
    }

    // Check for duplicates
    const exists = category.sub_categories.some(sc => sc.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      return res.status(409).json({ 
        message: 'Sub-category already exists' 
      });
    }

    category.sub_categories.push({ name });
    await category.save();

    return res.json({ message: 'Sub-category added', category });

  } catch (err) {
    console.error('AddSubCategory error:', err);
    return res.status(500).json({ 
      message: 'Failed to add sub-category' 
    });
  }
}

/**
 * REMOVE SUB-CATEGORY
 */
export async function removeSubCategory(req, res) {
  try {
    const { subId } = req.params;

    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    const subIndex = category.sub_categories.findIndex(sc => sc._id.toString() === subId);
    if (subIndex === -1) {
      return res.status(404).json({ 
        message: 'Sub-category not found' 
      });
    }

    category.sub_categories.splice(subIndex, 1);
    await category.save();

    return res.json({ message: 'Sub-category removed', category });

  } catch (err) {
    console.error('RemoveSubCategory error:', err);
    return res.status(500).json({ 
        message: 'Failed to remove sub-category' 
      });
    
  }
}
