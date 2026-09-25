export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// One shared request helper: builds headers, attaches the token, and
// throws a normal Error (with .status and .data) on non-2xx responses.
export async function apiRequest(
  path,
  { method = "GET", body, token, params } = {},
) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== "",
      ),
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message || data.errors?.[0]?.msg || "Something went wrong";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
