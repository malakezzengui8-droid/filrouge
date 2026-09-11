import * as adminService from '../services/adminService.js';

// GET /api/admin/users
async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/users/:id
async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res, next) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/requests
async function getAllRequests(req, res, next) {
  try {
    const requests = await adminService.getAllRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/requests/:id/status
async function updateRequestStatus(req, res, next) {
  try {
    const request = await adminService.updateRequestStatusAsAdmin(req.params.id, req.body.status);
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/statistics
async function getStatistics(req, res, next) {
  try {
    const stats = await adminService.getStatistics();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

export { getAllUsers, getUser, updateUser, deleteUser, getAllRequests, updateRequestStatus, getStatistics };