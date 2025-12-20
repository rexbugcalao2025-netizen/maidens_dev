const mongoose = require('mongoose');

/**
 * Cart Item sub-schema
 */
const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    subtotal: {
    type: Number,
    min: 0,
    default: 0
    }
  },
  { _id: true }
);

/**
 * Cart schema
 */
const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true
    },

    items: {
      type: [cartItemSchema],
      default: []
    },

    total_amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    status: {
      type: String,
      enum: ['active', 'checked_out', 'abandoned'],
      default: 'active',
      index: true
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'carts',
    timestamps: true
  }
);

/**
 * Auto-calculate totals before save
 */
cartSchema.pre('save', function (next) {
  let total = 0;

  this.items.forEach(item => {
    item.subtotal = item.quantity * item.price;
    total += item.subtotal;
  });

  this.total_amount = total;
});

/**
 * Exclude soft-deleted carts
 */
cartSchema.pre(/^find/, function () {
  this.where({ is_deleted: false });
});

module.exports = mongoose.model('Cart', cartSchema);
