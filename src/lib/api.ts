import axios from "axios";
import { navigateTo } from "./navigation";

/**
 * Creates an instance of Axios with a base URL set to the value of
 * `import.meta.env.VITE_BACKEND_URL`.
 * @see https://github.com/axios/axios#creating-an-instance
 * @returns {AxiosInstance} - The created Axios instance.
 */
export const api = axios.create({
  /**
   * The base URL to use when making requests.
   * @see https://github.com/axios/axios#creating-an-instance
   */
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("client_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Intercepts responses from the API and handles errors.
 * If the response status code is 401 (Unauthorized), it removes the auth token from local storage and navigates to the login page.
 * Otherwise, it rejects the error.
 */
api.interceptors.response.use(
  /**
   * Handles successful responses.
   * @param {Object} response - The successful response object.
   * @returns {Object} - The successful response object.
   */
  (response) => response,
  /**
   * Handles errors.
   * If the error status code is 401 (Unauthorized), it removes the auth token from local storage and navigates to the login page.
   * Otherwise, it rejects the error.
   * @param {Object} error - The error object.
   * @returns {Promise} - A promise that resolves or rejects the error object.
   */
  (error) => {
    if (error?.response?.status === 401) {
      navigateTo("/login");
    }
    return Promise.reject(error);
  },
);
