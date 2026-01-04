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
 * Credential sub-schema
 */
const credentialSchema = new mongoose.Schema(
  {
    credential_type: {
      type: String,
      enum: [
          'drivers_license',
          'prc_license',
          'tesda_certificate',
          'training_certificate',
          'other'
        ],
      required: true,
      trim: true
    },

    value: {
      type: String,
      required: true,
      trim: true
    },

    acquire_on_date: {
      type: Date,
      required: true
    },

    expire_on_date: {
      type: Date
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
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
      trim: true,
      unique: true,
      sparse: true // ⭐ IMPORTANT
    },

    job_position: {
      type: [jobPositionSchema],
      default: []
    },    
    credentials: {
      type: [credentialSchema],
      default: [] 
    },    
    employee_code: {
      type: String,
      unique: true,
      index: true
    }
  },    
  {
    collection: 'employees',
    timestamps: true
  }
);

/**
 * Index for credential expiration queries
 */
employeeSchema.index(
  { 'credentials.expire_on_date': 1 },
  { partialFilterExpression: { 'credentials.expire_on_date': { $exists: true } } }
);

/**
 * Instance method: deactivate expired credentials
 */
employeeSchema.methods.deactivateExpiredCredentials = function () {
  const now = new Date();

  this.credentials.forEach((cred) => {
    if (cred.expire_on_date && cred.expire_on_date < now) {
      cred.is_active = false;
    }
  });
};


module.exports = mongoose.model('Employee', employeeSchema);
