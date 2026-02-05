// src/models/Product.js

import mongoose from 'mongoose';

/**
 * Price History sub-schema
 */
const priceHistorySchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true
    },
    date_changed: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

/**
 * Product schema
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    price_history: [priceHistorySchema],
    images: [
      {
        type: String, // can store URL or file path
        trim: true
      }
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      required: true
    },
    sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory'
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'products',
    timestamps: true
  }
);

/**
 * Soft delete middleware
 */
productSchema.pre(/^find/, function () {
  this.where({ is_deleted: false });
});

export default mongoose.model('Product', productSchema);
