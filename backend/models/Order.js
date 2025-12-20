const mongoose = require('mongoose');

/**
 * Order item snapshot
 */
const orderItemSchema = new mongoose.Schema(
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
      required: true,
      min: 0
    }
  },
  { _id: true }
);

/**
 * Payment record
 */
const paymentSchema = new mongoose.Schema(
  {
    type_of_payment: {
      type: String,
      enum: ['cash', 'card', 'gcash', 'bank_transfer', 'other'],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    reference_number: {
      type: String,
      trim: true
    },

    paid_at: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

/**
 * Order schema
 */
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: true
    },

    total_amount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        'placed',
        'paid',
        'processing',
        'shipped',
        'completed',
        'cancelled'
      ],
      default: 'placed',
      index: true
    },

    payment_status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
      index: true
    },

    payment: {
      type: [paymentSchema],
      default: []
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'orders',
    timestamps: true
  }
);

/**
 * Exclude soft-deleted orders
 */
orderSchema.pre(/^find/, function () {
  this.where({ is_deleted: false });
});

module.exports = mongoose.model('Order', orderSchema);
