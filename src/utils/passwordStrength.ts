interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { strength: 0, label: "", color: "" };

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength: 1, label: "Weak", color: "bg-red-500" };
  if (strength <= 3)
    return { strength: 2, label: "Medium", color: "bg-yellow-500" };
  return { strength: 3, label: "Strong", color: "bg-emerald-500" };
};
