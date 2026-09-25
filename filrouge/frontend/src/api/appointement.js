import { apiRequest } from "./client";

export const createAppointment = (token, requestId) =>
  apiRequest(`/requests/${requestId}/appointments`, { method: "POST", token });

export const getRequestAppointments = (token, requestId) =>
  apiRequest(`/requests/${requestId}/appointments`, { token });

export const inviteDonor = (token, requestId, donorId) =>
  apiRequest(`/requests/${requestId}/invite`, { method: "POST", body: { donorId }, token });

export const getMyAppointments = (token) => apiRequest("/appointments/me", { token });

export const confirmAppointment = (token, id, payload) =>
  apiRequest(`/appointments/${id}/confirm`, { method: "PUT", body: payload, token });

export const rejectAppointment = (token, id) =>
  apiRequest(`/appointments/${id}/reject`, { method: "PUT", token });

export const cancelAppointment = (token, id) =>
  apiRequest(`/appointments/${id}/cancel`, { method: "PUT", token });

export const completeAppointment = (token, id) =>
  apiRequest(`/appointments/${id}/complete`, { method: "PUT", token });
