import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString(undefined, {
    timeZone: getConfiguredTimezone(),
  });
};

export const sortAccountsByDate = (accounts: any[]): any[] => {
  return [...accounts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
