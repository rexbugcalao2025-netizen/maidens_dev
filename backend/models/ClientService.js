const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    percentage_commission: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    }
  },
  { _id: true }
);

const serviceRenderedSchema = new mongoose.Schema(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    amount: {
      type: Number,
      min: 0,
      required: true
    },
    person_assigned: {
      type: [commissionSchema],
      default: []
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    type_of_payment: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      min: 0,
      required: true
    },
    reference_number: {
      type: String
    },
    date_paid: {
      type: Date,
      required: true
    }
  },
  { _id: true }
);

const clientServiceSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },

    date_rendered: {
      type: Date,
      required: true
    },

    date_completed: {
      type: Date
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    },

    service_rendered: {
      type: [serviceRenderedSchema],
      required: true
    },

    total_amount: {
      type: Number,
      min: 0
    },

    discount_amount: {
      type: Number,
      default: 0,
      min: 0
    },

    payment: {
      type: [paymentSchema],
      default: []
    },

    payment_status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid"
    },

    reference_code: {
      type: String
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    is_void: {
      type: Boolean,
      default: false
    },

    void_reason: {
      type: String
    }
  },
  {
    collection: 'client_services',
    timestamps: true
  }
);


/** 
* Auto-calculation Hooks
**/ 

clientServiceSchema.pre("save", async function () {
    let total = 0;

    this.service_rendered.forEach(service => {
        total += service.amount;
    });

    this.total_amount = Math.max(0, total - this.discount_amount);

    const paidAmount = this.payment.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    if (paidAmount === 0) {
        this.payment_status = "unpaid";
    } else if (paidAmount < this.total_amount) {
        this.payment_status = "partial";
    } else {
        this.payment_status = "paid";
    }

    if (this.status === "completed" && !this.date_completed) {
        this.date_completed = new Date();
    }
});


module.exports = mongoose.model('ClientService', clientServiceSchema);
