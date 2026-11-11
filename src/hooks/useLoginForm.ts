import { useState } from "react";
import type { LoginFormData } from "@/types/auth.types";

export const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const updateField = <K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      rememberMe: false,
    });
    setShowPassword(false);
  };

  return {
    formData,
    showPassword,
    updateField,
    togglePasswordVisibility,
    resetForm,
  };
};
