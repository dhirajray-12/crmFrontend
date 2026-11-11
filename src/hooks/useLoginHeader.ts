import { useMemo } from "react";
import type { Role } from "@/types/auth.types";

export const useLoginHeader = (role: Role) => {
  const headerText = useMemo(() => {
    if (role === "admin") return "Admin Portal";
    if (role === "superadmin") return "Super Admin Portal";
    if (role === "agent") return "Support Agent Portal";
    if (role === "subadmin") return "Subadmin Portal";
    return "Welcome Back";
  }, [role]);

  const subText = useMemo(() => {
    if (
      role === "admin" ||
      role === "superadmin" ||
      role === "agent" ||
      role === "subadmin"
    ) {
      return "Secure access to system controls";
    }
    return "Continue your trading journey";
  }, [role]);

  return { headerText, subText };
};
