import { apiRequest } from "./client";

export const register = (payload) =>
  apiRequest("/auth/register", { method: "POST", body: payload });

export const login = (payload) =>
  apiRequest("/auth/login", { method: "POST", body: payload });

export const getMe = (token) => apiRequest("/auth/me", { token });

export const updateMe = (token, payload) =>
  apiRequest("/auth/me", { method: "PUT", body: payload, token });

export const deleteMe = (token) => apiRequest("/auth/me", { method: "DELETE", token });

export const getEligibility = (token) => apiRequest("/auth/eligibility", { token });
