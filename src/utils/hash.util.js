// src/utils/hash.util.js
// Password hashing helpers built on bcrypt.

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (candidate, hash) => {
  return bcrypt.compare(candidate, hash);
};

export default {
  hashPassword,
  comparePassword,
};

