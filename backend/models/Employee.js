const mongoose = require('mongoose');

/**
 * Job Position sub-schema
 */
const jobPositionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    entity: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    date_started: {
      type: Date,
      required: true
    },

    date_ended: {
      type: Date,
      default: null
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true
  }
);


/**
 * Employee schema
 */
const employeeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // references users collection
      required: true,
      index: true
    },

    date_hired: {
      type: Date,
      required: true
    },

    date_retired: {
      type: Date,
      default: null
    },

    tax_identification_number: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    job_position: [jobPositionSchema]
  },
  {
    collection: 'employees',
    timestamps: true
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
