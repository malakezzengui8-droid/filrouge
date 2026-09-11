import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';

// manageUsers() -> list all users
async function getAllUsers() {
  return User.find(); // password is excluded automatically (select: false in schema)
}

async function getUserById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function updateUser(userId, updates) {
  // admin is allowed to change more fields than a regular user updating themselves,
  // including the role (e.g. promote a user to ADMIN)
  const allowedFields = ['name', 'phone', 'city', 'bloodType', 'role', 'lastDonationDate'];
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

async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

// manageRequests() -> list ALL requests, whatever their status
async function getAllRequests() {
  return BloodRequest.find()
    .populate('createdBy', 'name city phone')
    .sort({ createdAt: -1 });
}

// manageRequests() -> admin can force-update any request's status
async function updateRequestStatusAsAdmin(requestId, newStatus) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  request.status = newStatus;
  await request.save();

  return request;
}

// viewStatistics() -> aggregate counts for the admin dashboard
async function getStatistics() {
  const [totalUsers, totalAdmins, totalRequests, activeRequests, fulfilledRequests, cancelledRequests] =
    await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'ADMIN' }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'ACTIVE' }),
      BloodRequest.countDocuments({ status: 'FULFILLED' }),
      BloodRequest.countDocuments({ status: 'CANCELLED' })
    ]);

  return {
    totalUsers,
    totalAdmins,
    totalRequests,
    activeRequests,
    fulfilledRequests,
    cancelledRequests
  };
}

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRequests,
  updateRequestStatusAsAdmin,
  getStatistics
};