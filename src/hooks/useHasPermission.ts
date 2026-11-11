import { useAuthStore } from "@/Store/auth.store";
import type { PermissionKey } from "@/Constants/permissions";

// UX layer only — the backend (authorizePermission middleware) is the
// authoritative permission boundary. This hook just drives what subadmins
// see in the UI.
export const useHasPermission = (key: PermissionKey | string): boolean => {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;
  if (user.role === "admin" || user.role === "superadmin") return true;
  if (user.role === "subadmin") return (user.permissions || []).includes(key);
  return false;
};
