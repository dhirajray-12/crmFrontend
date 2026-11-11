// Applies the superadmin-controlled color theme (light/dark mode + accent
// color) as CSS custom properties + a data attribute on <html>, so every
// themed CSS class (client-theme-*, admin-theme-*, auth-*, etc.) and every
// Tailwind color token (accent, accent-foreground, ...) picks it up live.
//
// Sourced from the public platform-status endpoint (not the authenticated
// app-settings one) so it applies before login too — on the auth pages.
import { useEffect, type ReactNode } from "react";
import {
  usePublicPlatformStatus,
  DEFAULT_APP_THEME,
  DEFAULT_APP_TIMEZONE,
  type AppThemeSettings,
} from "@/hooks/useBillingSuspension";
import { getContrastForeground, mix, toRgbaString } from "@/lib/color";
import { setConfiguredTimezone } from "@/utils/timezoneStore";

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

export function applyTheme(theme: AppThemeSettings) {
  const root = document.documentElement;
  root.dataset.themeMode = theme.mode;

  const accent = theme.accentColor;
  const foreground = getContrastForeground(accent);
  // Hover state leans toward black in light mode, white in dark mode —
  // matches how most UI kits deepen an accent on hover per background.
  const hoverTarget = theme.mode === "light" ? BLACK : WHITE;

  root.style.setProperty("--accent-color", accent);
  root.style.setProperty("--accent-foreground", foreground);
  root.style.setProperty("--accent-hover", mix(accent, hoverTarget, 0.15));
  root.style.setProperty("--accent-soft", toRgbaString(accent, 0.16));
  root.style.setProperty("--accent-glow", toRgbaString(accent, 0.28));
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: platformStatus } = usePublicPlatformStatus();
  const theme = platformStatus?.theme ?? DEFAULT_APP_THEME;
  const timezone = platformStatus?.timezone ?? DEFAULT_APP_TIMEZONE;

  useEffect(() => {
    applyTheme(theme);
  }, [theme.mode, theme.accentColor]);

  useEffect(() => {
    setConfiguredTimezone(timezone);
  }, [timezone]);

  return <>{children}</>;
}
