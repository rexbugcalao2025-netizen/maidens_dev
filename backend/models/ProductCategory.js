const mongoose = require('mongoose');

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
      trim: true, 
      unique: true 
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

/**
 * Automatically exclude soft-deleted categories
 */
productCategorySchema.pre(/^find/, function (next) {
  this.where({ is_deleted: false });  
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);
