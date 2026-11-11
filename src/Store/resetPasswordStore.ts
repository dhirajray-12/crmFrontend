import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ResetPasswordState {
  // State
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  error: string;
  success: boolean;

  // Actions
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: boolean) => void;
  toggleShowPassword: () => void;
  toggleShowConfirmPassword: () => void;
  resetForm: () => void;
}

export const useResetPasswordStore = create<ResetPasswordState>()(
  devtools(
    (set) => ({
      // Initial state
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      error: "",
      success: false,

      // Actions
      setPassword: (password) => set({ password }),
      setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
      setShowPassword: (show) => set({ showPassword: show }),
      setShowConfirmPassword: (show) => set({ showConfirmPassword: show }),
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
      toggleShowPassword: () =>
        set((state) => ({ showPassword: !state.showPassword })),
      toggleShowConfirmPassword: () =>
        set((state) => ({ showConfirmPassword: !state.showConfirmPassword })),
      resetForm: () =>
        set({
          password: "",
          confirmPassword: "",
          error: "",
          success: false,
          showPassword: false,
          showConfirmPassword: false,
        }),
    }),
    { name: "ResetPasswordStore" },
  ),
);
