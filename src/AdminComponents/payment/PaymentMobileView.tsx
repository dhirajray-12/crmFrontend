import { Eye, Pencil, Trash2 } from "lucide-react";
import type { PaymentMethod } from "@/types/payment.types";

interface PaymentMobileViewProps {
  paymentMethods: PaymentMethod[];
  startIndex?: number;
  onView: (method: PaymentMethod) => void;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
}

export const PaymentMobileView = ({
  paymentMethods,
  startIndex = 0,
  onView,
  onEdit,
  onDelete,
}: PaymentMobileViewProps) => {
  return (
    <div className="block md:hidden space-y-4 p-4">
      {paymentMethods.map((method, index) => (
        <div
          key={method._id}
          className="bg-surface-strong rounded-lg border border-border shadow-sm p-4 space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-heading">
              #{startIndex + index + 1} {method.type}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                method.active
                  ? "bg-green-100 text-green-700"
                  : "bg-surface-strong text-subtle"
              }`}
            >
              {method.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="text-sm text-body">
            {method.type === "Crypto Wallet"
              ? method.walletName
              : method.accountHolderName}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => onView(method)}
              className="text-blue-600 text-sm flex items-center gap-1"
            >
              <Eye className="w-4 h-4" /> View
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(method)}
                className="p-2 border rounded-md"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(method)}
                className="p-2 border rounded-md text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
