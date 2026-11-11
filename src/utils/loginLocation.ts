export type LoginLocationPermission =
  | "granted"
  | "denied"
  | "prompt"
  | "unavailable"
  | "timeout"
  | "error";

export interface LoginLocationContext {
  permission: LoginLocationPermission;
  source: "gps" | "ip";
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  capturedAt?: string;
}

const GEOLOCATION_TIMEOUT_MS = 600;
const GEOLOCATION_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const LOGIN_LOCATION_FALLBACK: LoginLocationContext = {
  permission: "unavailable",
  source: "ip",
};

const getBrowserPermissionState = async (): Promise<
  PermissionState | "unsupported"
> => {
  if (!("permissions" in navigator) || !navigator.permissions?.query) {
    return "unsupported";
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "unsupported";
  }
};

export const requestLoginLocation = async (): Promise<LoginLocationContext> => {
  if (typeof window === "undefined" || !("navigator" in window)) {
    return LOGIN_LOCATION_FALLBACK;
  }

  if (!navigator.geolocation) {
    return LOGIN_LOCATION_FALLBACK;
  }

  const permissionState = await getBrowserPermissionState();
  if (permissionState === "denied") {
    return { permission: "denied", source: "ip" };
  }

  // Avoid blocking login behind a browser permission prompt.
  if (permissionState === "prompt") {
    return { permission: "prompt", source: "ip" };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_CACHE_MAX_AGE_MS,
      });
    });

    return {
      permission: "granted",
      source: "gps",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      capturedAt: new Date(position.timestamp).toISOString(),
    };
  } catch (error: any) {
    if (typeof error?.code === "number") {
      if (error.code === 1) {
        return { permission: "denied", source: "ip" };
      }
      if (error.code === 3) {
        return { permission: "timeout", source: "ip" };
      }
    }

    return { permission: "error", source: "ip" };
  }
};
