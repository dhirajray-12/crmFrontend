// NEW file - following your Zustand patterns
import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  createdAt: number;
}

const TOAST_TYPES = new Set<Toast["type"]>([
  "success",
  "error",
  "info",
  "warning",
]);

interface ToastStore {
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (type, message) => {
    const normalizedType = TOAST_TYPES.has(type)
      ? type
      : TOAST_TYPES.has(message as Toast["type"])
        ? (message as Toast["type"])
        : "info";
    const normalizedMessage = TOAST_TYPES.has(type)
      ? message
      : typeof type === "string" && type.trim().length > 0
        ? type
        : message;
    const createdAt = Date.now();
    const id = `${createdAt}-${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({
      toasts: state.toasts.some(
        (toast) =>
          toast.type === normalizedType &&
          toast.message === normalizedMessage &&
          createdAt - toast.createdAt < 1200,
      )
          ? state.toasts
        : [
            ...state.toasts,
            {
              id,
              type: normalizedType,
              message: normalizedMessage,
              createdAt,
            },
          ],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));
