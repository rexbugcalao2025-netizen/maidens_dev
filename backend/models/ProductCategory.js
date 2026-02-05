// src/models/ProductCategory.js

import mongoose from 'mongoose';

/**
 * Sub-category sub-schema
 */
const subCategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    }
  },
  { _id: true }
);

/**
 * ProductCategory schema
 */
const productCategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true
    },
    sub_categories: [subCategorySchema],
    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'product_categories',
    timestamps: true
  }
);

productCategorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

/**
 * Automatically exclude soft-deleted categories
 * unless explicitly requested
 */
productCategorySchema.pre(/^find/, function () {
  if (this.getOptions().includeDeleted) {
    return;
  }

  this.where({ is_deleted: false });
  
});

export default mongoose.model('ProductCategory', productCategorySchema);
