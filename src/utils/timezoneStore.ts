// Holds the superadmin-configured CRM timezone outside of React so plain
// (non-hook) utility functions — like formatDate/formatTime in
// utils/helpers.ts — can format dates in it without needing to be components.
//
// Populated by ThemeProvider from the public platform-status endpoint (same
// source it already uses for the color theme), so it's available pre-login too.
import { DEFAULT_APP_TIMEZONE } from "@/hooks/useBillingSuspension";

let configuredTimezone: string = DEFAULT_APP_TIMEZONE;

export function setConfiguredTimezone(timezone: string | undefined | null) {
  configuredTimezone = timezone && timezone.trim() ? timezone : DEFAULT_APP_TIMEZONE;
}

export function getConfiguredTimezone(): string {
  return configuredTimezone;
}

// date-fns's `format()` (unlike Intl's toLocaleString) always reads a Date's
// *local* (browser system timezone) getters — it has no timeZone option of
// its own. To make it show the configured CRM timezone instead, re-anchor
// the Date first: parsing the value's wall-clock string *in that timezone*
// back into a new Date makes the new Date's local getters return that
// timezone's wall-clock numbers, which is what format() then reads.
export function toConfiguredZonedDate(value: Date | string | number): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return date;
  return new Date(date.toLocaleString("en-US", { timeZone: getConfiguredTimezone() }));
}