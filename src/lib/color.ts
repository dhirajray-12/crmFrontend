// Small color-math helpers backing the runtime accent-color theming system.
// Given any arbitrary hex color picked by a superadmin, these derive
// readable foreground text and hover/soft variants at runtime.

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const DEFAULT_RGB: RGB = { r: 56, g: 189, b: 248 }; // #38bdf8 fallback

export function hexToRgb(hex: string): RGB {
  const normalized = hex?.trim().replace(/^#/, "");
  if (!normalized || !/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return DEFAULT_RGB;
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// WCAG relative luminance (sRGB).
export function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// Picks black or white text — whichever reads better on the given background.
export function getContrastForeground(hex: string): string {
  const luminance = relativeLuminance(hexToRgb(hex));
  return luminance > 0.45 ? "#0f172a" : "#ffffff";
}

// Mixes `hex` toward `target` by `amount` (0-1). Used for hover/soft accent variants.
export function mix(hex: string, target: RGB, amount: number): string {
  const base = hexToRgb(hex);
  const t = Math.min(1, Math.max(0, amount));
  return rgbToHex({
    r: base.r + (target.r - base.r) * t,
    g: base.g + (target.g - base.g) * t,
    b: base.b + (target.b - base.b) * t,
  });
}

export function toRgbaString(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex?.trim() || "");
}
