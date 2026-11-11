import type { ToastState } from "@/types/payment.types";

interface ToastProps extends ToastState {
  onClose: () => void;
}

export const Toast = ({ show, message, type }: ToastProps) => {
  if (!show) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-heading font-medium animate-fade-in`}
    >
      {message}
    </div>
  );
};
