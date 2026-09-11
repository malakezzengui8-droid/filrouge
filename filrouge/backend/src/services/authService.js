import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { checkEligibility } from '../utils/eligibility.js';

async function registerUser({ name, email, password, CIN, phone, city, bloodType }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const existingCIN = await User.findOne({ CIN });
  if (existingCIN) {
    const error = new Error('CIN is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, CIN, phone, city, bloodType });
  console.log(user.body)

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      CIN: user.CIN,
      role: user.role,
      city: user.city,
      bloodType: user.bloodType
    }
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      CIN: user.CIN,
      role: user.role,
      city: user.city,
      bloodType: user.bloodType
    }
  };
}

async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function updateUserProfile(userId, updates) {
  const allowedFields = ['name', 'phone', 'city', 'bloodType', 'lastDonationDate'];
  const safeUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      safeUpdates[field] = updates[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, safeUpdates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function deleteUserAccount(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function getEligibility(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return checkEligibility(user.lastDonationDate);
}

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getEligibility
};