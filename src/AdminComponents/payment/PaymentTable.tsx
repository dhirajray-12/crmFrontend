import { Eye, Pencil, Trash2, Check, Bitcoin, Building2 } from "lucide-react";
import type { PaymentMethod } from "@/types/payment.types";

interface PaymentTableProps {
  paymentMethods: PaymentMethod[];
  startIndex?: number;
  onView: (method: PaymentMethod) => void;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  onToggleActive: (method: PaymentMethod, checked: boolean) => void;
}

export const PaymentTable = ({
  paymentMethods,
  startIndex = 0,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: PaymentTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="text-left p-4 font-semibold text-body">
              S.No.
            </th>
            <th className="text-left p-4 font-semibold text-body">Name</th>
            <th className="text-left p-4 font-semibold text-body">
              Payment Type
            </th>
            <th className="text-left p-4 font-semibold text-body">
              Account Details
            </th>
            <th className="text-left p-4 font-semibold text-body">
              Status
            </th>
            <th className="text-right p-4 font-semibold text-body">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {paymentMethods.map((method, index) => (
            <tr
              key={method._id}
              className="border-b border-border hover:bg-surface transition-colors"
            >
              <td className="p-4 font-medium text-heading">
                {startIndex + index + 1}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {method.type === "Crypto Wallet" ? (
                    <Bitcoin className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Building2 className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-heading">
                    {method.type === "Crypto Wallet"
                      ? method.walletName
                      : method.accountHolderName}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {method.type}
                </span>
              </td>
              <td className="p-4">
                <button
                  onClick={() => onView(method)}
                  className="flex items-center gap-2 text-body hover:text-blue-600 transition-colors"
                >
                  <Eye className="h-4 w-4" /> View
                </button>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleActive(method, !method.active)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                      method.active
                        ? "bg-green-500 border-green-500"
                        : "border-border"
                    }`}
                  >
                    {method.active && <Check className="h-3 w-3 text-heading" />}
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      method.active ? "text-green-600" : "text-subtle"
                    }`}
                  >
                    {method.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(method)}
                    className="p-2 border border-border rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(method)}
                    className="p-2 border border-border rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {paymentMethods.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-subtle">
                No payment methods found. Add one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
