// src/models/Clients.js

import mongoose from 'mongoose';

/**
 * Occupation sub-schema
 */
const occupationSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
      trim: true
    },
    company_name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    year_joined: {
      type: String,
      trim: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

/**
 * Client schema
 */
const clientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date_created: {
      type: Date,
      default: Date.now
    },
    occupation: [occupationSchema],
    notes: {
      type: String,
      trim: true
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    },    
    client_code: {
      type: String,
      unique: true,
      index: true
    }
  },   
  {
    collection: 'clients',
    timestamps: true
  }
);

/**
 * Soft delete middleware
 */
clientSchema.pre(/^find/, function () {
  this.where({ is_deleted: false });
});

export default mongoose.model('Client', clientSchema);
