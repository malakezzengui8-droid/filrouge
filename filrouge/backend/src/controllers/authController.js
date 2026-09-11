import * as authService from '../services/authService.js';

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me  (protected route)
async function getMe(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/me  (protected route)
async function updateMe(req, res, next) {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/auth/me  (protected route)
async function deleteMe(req, res, next) {
  try {
    await authService.deleteUserAccount(req.user.id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/eligibility  (protected route)
async function getEligibility(req, res, next) {
  try {
    const eligibility = await authService.getEligibility(req.user.id);
    res.status(200).json(eligibility);
  } catch (error) {
    next(error);
  }
}

export { register, login, getMe, updateMe, deleteMe, getEligibility };