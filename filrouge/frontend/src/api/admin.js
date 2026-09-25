import { apiRequest } from "./client";

export const getUsers = (token) => apiRequest("/admin/users", { token });

export const updateUser = (token, id, payload) =>
  apiRequest(`/admin/users/${id}`, { method: "PUT", body: payload, token });

export const deleteUser = (token, id) =>
  apiRequest(`/admin/users/${id}`, { method: "DELETE", token });

export const getAdminRequests = (token) => apiRequest("/admin/requests", { token });

export const updateAdminRequestStatus = (token, id, status) =>
  apiRequest(`/admin/requests/${id}/status`, { method: "PUT", body: { status }, token });

export const getStatistics = (token) => apiRequest("/admin/statistics", { token });
