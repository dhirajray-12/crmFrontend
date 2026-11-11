// src/Store/error.store.ts
import { create } from "zustand";

export interface AppError {
  id: string;
  message: string;
  code?: string;
  status?: number;
  timestamp: Date;
  dismissed: boolean;
  type: "error" | "warning" | "info" | "network";
}
type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
      errorCode?: string;
    };
    status?: number;
  };
  message?: string;
};
interface ErrorStore {
  errors: AppError[];
  globalError: AppError | null;

  // Actions
  addError: (error: Omit<AppError, "id" | "timestamp" | "dismissed">) => string;
  dismissError: (id: string) => void;
  dismissAll: () => void;
  setGlobalError: (error: AppError | null) => void;
  clearGlobalError: () => void;

  // Utilities
  handleApiError: (error: unknown, context?: string) => string;
}

export const useErrorStore = create<ErrorStore>((set, get) => ({
  errors: [],
  globalError: null,

  addError: (error) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    const newError: AppError = {
      ...error,
      id,
      timestamp: new Date(),
      dismissed: false,
    };

    set((state) => ({
      errors: [newError, ...state.errors].slice(0, 50), // Keep last 50 errors
    }));

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[${error.code || "ERROR"}]:`, error.message);
    }

    return id;
  },

  dismissError: (id) =>
    set((state) => ({
      errors: state.errors.map((e) =>
        e.id === id ? { ...e, dismissed: true } : e,
      ),
    })),

  dismissAll: () =>
    set((state) => ({
      errors: state.errors.map((e) => ({ ...e, dismissed: true })),
    })),

  setGlobalError: (error) => set({ globalError: error }),

  clearGlobalError: () => set({ globalError: null }),

  handleApiError: (error, context) => {
    let message = "An unexpected error occurred";
    let code = "UNKNOWN_ERROR";
    let status = 500;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object") {
      const err = error as ApiErrorShape;

      if (err.response?.data) {
        message = err.response.data.message || message;
        code = err.response.data.errorCode || code;
        status = err.response.status || status;
      } else if (err.message) {
        message = err.message;
      }
    }

    const errorId = get().addError({
      message,
      code,
      status,
      type: "error",
      
    });

    // Log with context
    console.error(`[${context || "API"}]:`, error);

    return errorId;
  },
}));
