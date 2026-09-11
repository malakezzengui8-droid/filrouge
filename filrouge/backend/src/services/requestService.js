import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { getCompatibleDonorTypes } from '../utils/compatibility.js';

// + publish()
async function publishRequest(userId, { bloodTypeNeeded, city, hospital, reason }) {
  const request = await BloodRequest.create({
    createdBy: userId,
    bloodTypeNeeded,
    city,
    hospital,
    reason
  });

  return request;
}

async function getActiveRequests({ city, bloodType }) {
  const filter = { status: 'ACTIVE' };

  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (bloodType) filter.bloodTypeNeeded = bloodType;

  // populate: replaces createdBy (an ObjectId) with actual user fields
  const requests = await BloodRequest.find(filter)
    .populate('createdBy', 'name city phone')
    .sort({ createdAt: -1 }); // newest first

  return requests;
}

async function getRequestById(requestId) {
  const request = await BloodRequest.findById(requestId).populate('createdBy', 'name city phone');

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  return request;
}

// + updateStatus()
async function updateRequestStatus(requestId, userId, userRole, newStatus) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  // only the creator OR an admin can change the status
  const isOwner = request.createdBy.toString() === userId;
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    const error = new Error('You are not allowed to update this request');
    error.statusCode = 403;
    throw error;
  }

  request.status = newStatus;
  await request.save();

  return request;
}

// <<extend>> Find potentially compatible donors for a given request
async function findCompatibleDonors(requestId) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  const compatibleTypes = getCompatibleDonorTypes(request.bloodTypeNeeded);

  const donors = await User.find({
    role: 'USER',
    bloodType: { $in: compatibleTypes },
    city: new RegExp(`^${request.city}$`, 'i') // prioritize donors in the same city
  }).select('name city bloodType phone');

  return donors;
}

export { publishRequest, getActiveRequests, getRequestById, updateRequestStatus, findCompatibleDonors };