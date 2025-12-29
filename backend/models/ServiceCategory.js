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
 * ServiceCategory schema
 */
const serviceCategorySchema = new mongoose.Schema(
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
    collection: 'service_categories',
    timestamps: true
  }
);

serviceCategorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

/**
 * Automatically exclude soft-deleted categories
 * unless explicitly requested
 */
serviceCategorySchema.pre(/^find/, function () {
  if (this.getOptions().includeDeleted) {
    return;
  }

  this.where({ is_deleted: false });
  
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
