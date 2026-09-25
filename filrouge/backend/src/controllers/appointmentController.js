import * as appointmentService from '../services/appointmentService.js';

// POST /api/requests/:id/appointments
async function createAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.createAppointment(req.params.id, req.user.id);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

// POST /api/requests/:id/invite  (body: { donorId })
async function inviteDonor(req, res, next) {
  try {
    const appointment = await appointmentService.inviteDonor(
      req.params.id,
      req.body.donorId,
      req.user.id,
      req.user.role
    );
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id/appointments
async function getRequestAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getRequestAppointments(req.params.id, req.user.id, req.user.role);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
}

// GET /api/appointments/me
async function getMyAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getMyAppointments(req.user.id);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/confirm
async function confirmAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.confirmAppointment(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/reject
async function rejectAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.rejectAppointment(req.params.id, req.user.id, req.user.role);
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/cancel
async function cancelAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.user.role);
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/complete
async function completeAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.completeAppointment(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
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
