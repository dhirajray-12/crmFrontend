export const getLoginRedirectByRole = (role?: string | null) => {
  if (role === "admin" || role === "agent") {
    return "/login/admin";
  }

  if (role === "superadmin") {
    return "/login/superadmin";
  }

  if (role === "subadmin") {
    return "/login/subadmin";
  }

  return "/login/client";
};
