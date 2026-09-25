import Appointment from '../models/Appointment.js';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { DONATION_INTERVAL_DAYS, calculateNextDonationDate, checkEligibility } from '../utils/eligibility.js';
import { isCompatibleDonor } from '../utils/compatibility.js';

async function checkDonorCanApply(donor, request) {
  if (!isCompatibleDonor(donor.bloodType, request.bloodTypeNeeded)) {
    const error = new Error('This donor blood type is not compatible with the request');
    error.statusCode = 409;
    throw error;
  }

  if (!checkEligibility(donor.lastDonationDate).eligible) {
    const error = new Error('This donor is not eligible to donate yet');
    error.statusCode = 409;
    throw error;
  }

  const confirmedAppointment = await Appointment.findOne({
    donor: donor._id,
    status: 'CONFIRMED'
  });

  if (confirmedAppointment) {
    const error = new Error('This donor already has a confirmed appointment');
    error.statusCode = 409;
    throw error;
  }
}

// Donor proposes to help with a request -> creates a PENDING appointment (initiatedBy: DONOR)
async function createAppointment(requestId, donorId) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'ACTIVE') {
    const error = new Error('This request is no longer active');
    error.statusCode = 400;
    throw error;
  }

  const donor = await User.findById(donorId);
  if (!donor || donor.role !== 'USER') {
    const error = new Error('Donor not found');
    error.statusCode = 404;
    throw error;
  }

  await checkDonorCanApply(donor, request);

  const existing = await Appointment.findOne({
    request: requestId,
    donor: donorId,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });

  if (existing) {
    const error = new Error('You already have a pending or confirmed appointment for this request');
    error.statusCode = 409;
    throw error;
  }

  const appointment = await Appointment.create({
    request: requestId,
    donor: donorId,
    initiatedBy: 'DONOR'
  });

  return appointment;
}

// Request owner (or admin) invites a specific donor -> creates a PENDING appointment (initiatedBy: REQUESTER)
async function inviteDonor(requestId, donorId, requesterId, requesterRole) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = request.createdBy.toString() === requesterId;
  if (!isOwner && requesterRole !== 'ADMIN') {
    const error = new Error('You are not allowed to invite donors for this request');
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== 'ACTIVE') {
    const error = new Error('This request is no longer active');
    error.statusCode = 400;
    throw error;
  }

  const donor = await User.findById(donorId);
  if (!donor || donor.role !== 'USER') {
    const error = new Error('Donor not found');
    error.statusCode = 404;
    throw error;
  }

  await checkDonorCanApply(donor, request);

  const existing = await Appointment.findOne({
    request: requestId,
    donor: donorId,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });

  if (existing) {
    const error = new Error('This donor already has a pending or confirmed appointment for this request');
    error.statusCode = 409;
    throw error;
  }

  const appointment = await Appointment.create({
    request: requestId,
    donor: donorId,
    initiatedBy: 'REQUESTER'
  });

  return appointment.populate('donor', 'name city phone bloodType');
}

// Request owner (or admin) views all appointments proposed/sent for their request
async function getRequestAppointments(requestId, userId, userRole) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = request.createdBy.toString() === userId;
  if (!isOwner && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to view appointments for this request');
    error.statusCode = 403;
    throw error;
  }

  return Appointment.find({ request: requestId }).populate('donor', 'name city phone bloodType');
}

// Donor views their own appointments: offers they made + invitations they received
async function getMyAppointments(donorId) {
  return Appointment.find({ donor: donorId })
    .populate('request', 'bloodTypeNeeded city hospital status')
    .sort({ createdAt: -1 });
}

// Whoever did NOT initiate the appointment confirms it: sets date/location, moves to CONFIRMED
async function confirmAppointment(appointmentId, userId, userRole, { appointmentDate, location }) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  const isDonor = appointment.donor.toString() === userId;

  const canAct =
    appointment.initiatedBy === 'DONOR'
      ? isRequestOwner || userRole === 'ADMIN'
      : isDonor || userRole === 'ADMIN';

  if (!canAct) {
    const error = new Error('You are not allowed to confirm this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== 'PENDING') {
    const error = new Error('Only a pending appointment can be confirmed');
    error.statusCode = 400;
    throw error;
  }

  const donationDate = new Date(appointmentDate);
  const donor = await User.findById(appointment.donor);

  if (!donor || !isCompatibleDonor(donor.bloodType, appointment.request.bloodTypeNeeded)) {
    const error = new Error('The donor blood type is not compatible with this request');
    error.statusCode = 409;
    throw error;
  }

  const nextDonationDate = calculateNextDonationDate(donor?.lastDonationDate);

  if (nextDonationDate && donationDate < nextDonationDate) {
    const error = new Error(`A donor can only donate once every ${DONATION_INTERVAL_DAYS} days`);
    error.statusCode = 409;
    throw error;
  }

  const intervalInMs = DONATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
  const intervalStart = new Date(donationDate.getTime() - intervalInMs);
  const intervalEnd = new Date(donationDate.getTime() + intervalInMs);
  const existingDonation = await Appointment.findOne({
    donor: appointment.donor,
    status: { $in: ['CONFIRMED', 'COMPLETED'] },
    appointmentDate: { $gt: intervalStart, $lt: intervalEnd },
    _id: { $ne: appointment._id }
  });

  if (existingDonation) {
    const error = new Error(`This donor already has a donation within ${DONATION_INTERVAL_DAYS} days`);
    error.statusCode = 409;
    throw error;
  }

  appointment.status = 'CONFIRMED';
  appointment.appointmentDate = appointmentDate;
  if (location) appointment.location = location;
  await appointment.save();

  return appointment.populate('donor', 'name city phone bloodType');
}

// Whoever did NOT initiate the appointment rejects a pending one
async function rejectAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  const isDonor = appointment.donor.toString() === userId;

  const canAct =
    appointment.initiatedBy === 'DONOR'
      ? isRequestOwner || userRole === 'ADMIN'
      : isDonor || userRole === 'ADMIN';

  if (!canAct) {
    const error = new Error('You are not allowed to reject this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== 'PENDING') {
    const error = new Error('Only a pending appointment can be rejected');
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'REJECTED';
  await appointment.save();

  return appointment.populate('donor', 'name city phone bloodType');
}

// Either participant (or an admin) can cancel a pending or confirmed appointment.
async function cancelAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  const isDonor = appointment.donor.toString() === userId;
  if (!isRequestOwner && !isDonor && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to cancel this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    const error = new Error('This appointment cannot be cancelled');
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'CANCELLED';
  await appointment.save();
  return appointment.populate('donor', 'name city phone bloodType');
}

// The request owner (or an admin) confirms that a scheduled donation really happened.
async function completeAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  if (!isRequestOwner && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to complete this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (!['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    const error = new Error('Only a confirmed appointment can be completed');
    error.statusCode = 400;
    throw error;
  }

  if (!appointment.appointmentDate || appointment.appointmentDate > new Date()) {
    const error = new Error('A future appointment cannot be completed');
    error.statusCode = 400;
    throw error;
  }

  // Saving first, then accepting COMPLETED on retries, makes this operation safe to repeat.
  if (appointment.status !== 'COMPLETED') {
    appointment.status = 'COMPLETED';
    await appointment.save();
  }

  // $max prevents an older appointment from replacing a newer donation date.
  await User.findByIdAndUpdate(appointment.donor, {
    $max: { lastDonationDate: appointment.appointmentDate }
  });

  return appointment.populate('donor', 'name city phone bloodType');
}

export {
  createAppointment,
  inviteDonor,
  getRequestAppointments,
  getMyAppointments,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment
};
