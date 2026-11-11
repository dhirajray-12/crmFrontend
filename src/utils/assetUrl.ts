const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");

export const normalizeAssetUrl = (
  value?: string | null,
  options?: { uploadsOnly?: boolean },
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  let normalizedPath = trimmedValue.replace(/\\/g, "/");

  if (options?.uploadsOnly) {
    normalizedPath = normalizedPath.replace(/^\/+/, "");

    const uploadsMatch = normalizedPath.match(/(?:^|\/)(uploads\/.*)$/i);
    normalizedPath = uploadsMatch?.[1] ?? normalizedPath;

    if (!/^uploads\//i.test(normalizedPath)) {
      normalizedPath = `uploads/${normalizedPath}`;
    }

    return `${BACKEND_ORIGIN}/${normalizedPath}`;
  }

  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }

  return `${BACKEND_ORIGIN}${normalizedPath}`;
};
