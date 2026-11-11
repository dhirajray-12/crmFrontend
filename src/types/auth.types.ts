export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateofbirth: string;
  countryCode: string;
  phone: string;
  zipCode: string;
  state: string;
  country: string;
}

export interface SignupRequestData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  zipCode: string;
  state: string;
  dateofbirth: string;
  country: string;
  referralCode?: string;
}

export interface ReferralInfo {
  code: string;
  referrerName: string;
}

export interface ReferralResponse {
  success: boolean;
  message?: string;
  referralInfo?: {
    referringUserName: string;
  };
}

export interface SignupResponse {
  referralCode: any;
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface IBConfigurationResponse {
  success: boolean;
  message?: string;
  ibConfiguration?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
  loginType: Role;
  locationContext?: {
    permission:
      | "granted"
      | "denied"
      | "prompt"
      | "unavailable"
      | "timeout"
      | "error";
    source: "gps" | "ip";
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    capturedAt?: string;
  };
}

export interface LoginResponse {
  token?: string;
  user: {
    _id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
  session?: {
    sessionId: string;
    deviceId: string;
    isTrusted: boolean;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type Role = "superadmin" | "admin" | "agent" | "subadmin" | "client";
