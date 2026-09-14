import Appointment from '../models/Appointment.js';
import BloodRequest from '../models/BloodRequest.js';

// Donor proposes to help with a request -> creates a PENDING appointment
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

  // prevent the same donor from applying twice to the same request
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
    donor: donorId
  });

  return appointment;
}

// Request owner (or admin) views all appointments proposed for their request
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

// Donor views their own appointments (requests they applied to)
async function getMyAppointments(donorId) {
  return Appointment.find({ donor: donorId })
    .populate('request', 'bloodTypeNeeded city hospital status');
}

// Request owner (or admin) confirms an appointment: sets the date/location
async function confirmAppointment(appointmentId, userId, userRole, { appointmentDate, location }) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = appointment.request.createdBy.toString() === userId;
  if (!isOwner && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to confirm this appointment');
    error.statusCode = 403;
    throw error;
  }

  appointment.status = 'CONFIRMED';
  appointment.appointmentDate = appointmentDate;
  if (location) appointment.location = location;
  await appointment.save();

  return appointment;
}

// Request owner (or admin) rejects a pending appointment
async function rejectAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = appointment.request.createdBy.toString() === userId;
  if (!isOwner && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to reject this appointment');
    error.statusCode = 403;
    throw error;
  }

  appointment.status = 'REJECTED';
  await appointment.save();

  return appointment;
}

export {
  createAppointment,
  getRequestAppointments,
  getMyAppointments,
  confirmAppointment,
  rejectAppointment
};