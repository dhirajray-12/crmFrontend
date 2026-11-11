import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ForgotPasswordState {
  // State
  email: string;
  error: string;
  success: boolean;

  // Actions
  setEmail: (email: string) => void;
  setError: (error: string) => void;
  setSuccess: (success: boolean) => void;
  resetForm: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>()(
  devtools(
    (set) => ({
      // Initial state
      email: "",
      error: "",
      success: false,

      // Actions
      setEmail: (email) => set({ email }),
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
      resetForm: () =>
        set({
          email: "",
          error: "",
          success: false,
        }),
    }),
    { name: "ForgotPasswordStore" },
  ),
);
