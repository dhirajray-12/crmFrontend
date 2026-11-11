// src/components/WithdrawalForm/methods/CardRefundInfo.tsx
// Card withdrawals go back to the card the client deposited with (a Stripe
// refund), so they are limited to the client's largest card payment.
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import api from "@/API/axiosInstance";

/** The most the client can withdraw to their card, in dollars. */
export const useCardRefundable = (enabled = true) =>
  useQuery({
    queryKey: ["stripe-card-refundable"],
    queryFn: async () => (await api.get("/withdrawals/stripe/refundable")).data?.data?.maxAmount as number,
    staleTime: 30_000,
    enabled,
  });

export const CardRefundInfo: React.FC<{ amount?: string }> = ({ amount }) => {
  const { data, isLoading } = useCardRefundable();
  const max = data ?? 0;
  const value = Number(amount || 0);
  const tooMuch = value > 0 && value > max;

  return (
    <div className="rounded-2xl border border-border bg-surface-strong/[0.05] p-4 text-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold text-heading">
        <CreditCard className="h-4 w-4 text-sky-700 dark:text-sky-300" /> Back to your card
      </div>
      {isLoading ? (
        <p className="flex items-center gap-2 text-subtle">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your card payments…
        </p>
      ) : max > 0 ? (
        <p className="text-subtle">
          The money is refunded to the card you deposited with. You can withdraw up to{" "}
          <span className="font-semibold text-heading">${max.toFixed(2)}</span> to your card; use bank or e-wallet for more.
          After approval it reaches your card in 5-10 business days.
        </p>
      ) : (
        <p className="text-subtle">
          Card withdrawals go back to a card you deposited with, and you have no card deposit yet. Use bank or e-wallet.
        </p>
      )}
      {tooMuch && (
        <p className="mt-2 font-medium text-rose-700 dark:text-rose-300">
          ${value.toFixed(2)} is more than can go back to your card (${max.toFixed(2)}).
        </p>
      )}
    </div>
  );
};
