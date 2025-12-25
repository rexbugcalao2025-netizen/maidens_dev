const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
      min: 0
    }
  },
  { _id: true }
);

const serviceSchema = new mongoose.Schema(
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

    category: {
      type: String,
      enum: ["beauty", "automotive", "repair", "other"],
      default: "other"
    },

    duration_in_minutes: {
      type: Number,
      min: 1
    },

    labor_price: {
      type: Number,
      default: 0,
      min: 0
    },

    materials: {
      type: [materialSchema],
      default: []
    },

    total_price: {
      type: Number,
      min: 0
    },

    date_offered: {
      type: Date
    },

    date_ended: {
      type: Date
    },

    is_active: {
      type: Boolean,
      default: true
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save hook
 * - Calculates material subtotals
 * - Calculates total price
 * - Auto-updates isActive
 * - Validates date logic
 */
serviceSchema.pre("save", function (next) {
  let materialsTotal = 0;

  this.materials.forEach(material => {
    material.subtotal = material.quantity * material.price;
    materialsTotal += material.subtotal;
  });

  this.total_price = materialsTotal + this.labor_price;

  if (this.date_ended) {
    this.is_active = false;
  }

  if (this.date_offered && this.date_ended && this.date_ended <= this.date_offered) {
    return next(new Error("date_ended must be later than date_offered"));
  }
});

module.exports = mongoose.model("Service", serviceSchema);
