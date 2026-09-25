import { apiRequest } from "./client";

export const listRequests = (token, { city, bloodType } = {}) =>
  apiRequest("/requests", { token, params: { city, bloodType } });

export const getRequest = (token, id) => apiRequest(`/requests/${id}`, { token });

export const getMyRequests = (token) => apiRequest("/requests/me", { token });

export const createRequest = (token, payload) =>
  apiRequest("/requests", { method: "POST", body: payload, token });

export const getCompatibleDonors = (token, id) =>
  apiRequest(`/requests/${id}/compatible-donors`, { token });

export const updateRequestStatus = (token, id, status) =>
  apiRequest(`/requests/${id}/status`, { method: "PUT", body: { status }, token });
