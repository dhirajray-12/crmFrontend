// authService.ts
// Centralized API service for all authentication operations
import { getDeviceId, getDeviceName } from "@/utils/deviceIdentity";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Types for API requests and responses
interface SignupData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  zipCode: string;
  state: string;
  dateofbirth: string;
  country: string[];
}

interface LoginData {
  email: string;
  password: string;
  loginType: "client" | "admin" | "superadmin";
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
  message?: string;
}

interface ApiError {
  message: string;
  status?: number;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  let data;

  try {
    data = await response.json();
  } catch {
    throw {
      message: "Server did not return valid JSON",
      status: response.status,
    } as ApiError;
  }

  if (!response.ok) {
    throw {
      message: data.message || "Request failed",
      status: response.status,
    } as ApiError;
  }

  return data;
}

// Authentication Service
export const authService = {
  /**
   * Create a new user account
   */
  async signup(formData: SignupData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
     headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify(formData),
    });

    await handleResponse<{ message: string }>(response);
  },

  /**
   * Login user with credentials
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
          "x-device-id": getDeviceId(),
          "x-device-name": getDeviceName(),
        },
      credentials: "include",
      body: JSON.stringify(loginData),
    });

    const data = await handleResponse<AuthResponse>(response);

    // Validate response structure
    if (!data.user) {
      throw {
        message: "Invalid server response",
        status: 500,
      } as ApiError;
    }

    return data;
  },

  /**
   * Logout user (client-side cleanup)
   */

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
          "x-device-id": getDeviceId(),
          "x-device-name": getDeviceName(),
        },
      body: JSON.stringify({ refreshToken }),
    });

    return handleResponse<{ token: string }>(response);
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
          "x-device-id": getDeviceId(),
          "x-device-name": getDeviceName(),
        },
      body: JSON.stringify({ email }),
    });

    return handleResponse<{ message: string }>(response);
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
     headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify({ token, newPassword }),
    });

    return handleResponse<{ message: string }>(response);
  },

  /**
   * Verify user email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify({ token }),
    });

    return handleResponse<{ message: string }>(response);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token;
  },

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  /**
   * Get stored user data
   */
  getUser(): any | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
