// src/models/user.js

import mongoose from 'mongoose';

/**
 * Phone sub-schema
 */
const phoneSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['mobile', 'home', 'work', 'other']
    },
    value: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          // 7–15 digit phone numbers
          return /^\d{7,15}$/.test(v.toString());
        },
        message: 'Invalid phone number'
      }
    }
  },  
  { _id: true }
);

/**
 * User schema
 */
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      default:'',
      trim: true
    },

    last_name: {
      type: String,
      default:'',
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false   // never returned unless explicitly selected
    },

    phones: [phoneSchema],

    address: {
      type: String,
      trim: true
    },

    is_admin: {
      type: Boolean,
      default: false
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    },

    date_of_birth: {
      type: Date
    },

    resetPasswordToken: {
    type: String,
    select: false
    },

    resetPasswordExpires: {
    type: Date,
    select: false
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    }
  },
  {
    collection: 'users',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//
// 👤 VIRTUAL: FULL NAME
//
userSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

userSchema.virtual('is_profile_complete').get(function () {
  return !!(this.first_name && this.last_name);
});


//
// 🧹 SOFT DELETE QUERY FILTER
//
userSchema.pre(/^find/, function () {
  this.where({ is_deleted: false });
});

//
// 🧼 CLEAN OUTPUT
//
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  // Remove sensitive fields
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;

  return obj;
};

export default mongoose.model('User', userSchema);