const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    product_name: {
      type: String,
      required: true,
      trim: true      
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
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
        required: true
      },
      name: {
        type: String,
        required: true
      },

      is_deleted: {
      type: Boolean,
      default: false    
      }
    },

    sub_category: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      
      is_deleted: {
      type: Boolean,
      default: false
    
      },

    },

    // duration_in_minutes: {
    //   type: Number,
    //   min: 1,
    //   required: true
    // },

    duration: {
      type: Number,
      min: 1,
      required: true
    },

    duration_unit: {
      type: String,
      required: true,
      enum: ['minute', 'hour', 'day']
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
      type: Date,
      default: Date.now
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
serviceSchema.pre("save", function () {
  let materialsTotal = 0;

  this.materials.forEach(material => {
    material.subtotal = material.quantity * material.price;
    materialsTotal += material.subtotal;
  });

  if (this.total_price === 0 || !this.total_price || this.total_price === null) { 
    this.total_price = materialsTotal + this.labor_price;
  }  

  if (this.date_ended) {
    this.is_active = false;
  }

  if (
    this.date_offered &&
    this.date_ended &&
    this.date_ended <= this.date_offered
  ) {
    throw new Error("date_ended must be later than date_offered");
  }
});

serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ "sub_category.id": 1 });
serviceSchema.index({ is_active: 1 });

module.exports = mongoose.model("Service", serviceSchema);
