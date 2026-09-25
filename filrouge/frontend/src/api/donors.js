import { apiRequest } from "./client";

export const searchDonors = (token, { city, bloodType } = {}) =>
  apiRequest("/donors", { token, params: { city, bloodType } });
