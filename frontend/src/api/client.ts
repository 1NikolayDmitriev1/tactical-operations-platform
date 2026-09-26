const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import type { ApiOptions } from "../types";
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  options: ApiOptions = {},
) => {
  const { body, headers, ...restOptions } = options;
  const token = localStorage.getItem("token");
  const configHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  const config: RequestInit = {
    method,
    headers: configHeaders,
    ...restOptions,
  };
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(
        `Server Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Request error ${endpoint}:`, error);
    throw error;
  }
};
