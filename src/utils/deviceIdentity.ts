const DEVICE_ID_STORAGE_KEY = "crm_device_id";

const createDeviceId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getDeviceId = (): string => {
  const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const next = createDeviceId();
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
};

export const getDeviceName = (): string => {
  const ua = navigator.userAgent || "";

  if (/iphone|ipad|ios/i.test(ua)) return "Apple mobile device";
  if (/android/i.test(ua)) return "Android device";
  if (/macintosh|mac os x/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows PC";
  if (/linux/i.test(ua)) return "Linux device";

  return "Browser device";
};
