// src/models/User.js
// Mongoose User model with password hashing and token versioning.

import mongoose from 'mongoose';
import { hashPassword, comparePassword } from '../utils/hash.util.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await hashPassword(this.password);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = function compare(candidate) {
  return comparePassword(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);

export default User;

