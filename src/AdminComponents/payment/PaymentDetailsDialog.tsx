import type { PaymentMethod } from "@/types/payment.types";
import {
  CheckCircle2,
  Coins,
  CreditCard,
  ExternalLink,
  Landmark,
  WalletCards,
  X,
} from "lucide-react";

interface PaymentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethod | null;
}

export const PaymentDetailsDialog = ({
  isOpen,
  onClose,
  method,
}: PaymentDetailsDialogProps) => {
  if (!isOpen || !method) return null;

  const isBankType =
    method.type === "Bank Account" || method.type === "Online Banking";
  const isWalletType = method.type === "Crypto Wallet";

  const Icon = isBankType
    ? Landmark
    : isWalletType
      ? Coins
      : method.type === "Other"
        ? WalletCards
        : CreditCard;

  const accent = isBankType
    ? {
        soft: "rgba(232, 193, 122, 0.18)",
        border: "var(--accent-color)",
        text: "#8a6329",
        badge: "#fff4dd",
      }
    : isWalletType
      ? {
          soft: "rgba(138, 184, 138, 0.18)",
          border: "#b8d0af",
          text: "#46683c",
          badge: "#eef8eb",
        }
      : {
          soft: "rgba(196, 160, 85, 0.14)",
          border: "var(--border)",
          text: "#6f5627",
          badge: "#fdf6e8",
        };

  const title =
    method.bankName || method.walletName || method.name || method.type;

  const detailRows = [
    { label: "Account Holder", value: method.accountHolderName },
    { label: "Account Number", value: method.accountNumber },
    { label: "IFSC / SWIFT", value: method.ifsc_swift },
    { label: "Bank Name", value: method.bankName },
    { label: "Wallet Name", value: method.walletName },
    { label: "Wallet Address", value: method.walletAddress },
    { label: "Accounts", value: method.accounts },
  ].filter((row) => row.value && String(row.value).trim() !== "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(49,34,13,0.42)] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] border border-border bg-surface shadow-[0_28px_70px_rgba(74,50,24,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-strong/85 text-body transition hover:bg-surface-strong"
            aria-label="Close payment details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <section className="rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_16px_30px_rgba(141,109,60,0.08)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[22px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  style={{
                    background: accent.soft,
                    borderColor: accent.border,
                    color: accent.text,
                  }}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <div
                    className="inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{
                      background: accent.badge,
                      borderColor: accent.border,
                      color: accent.text,
                    }}
                  >
                    {method.type}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
                    {title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
                    {method.paymentLink
                      ? "This method has a payment link configured and is ready for routing review."
                      : "This method is configured for manual payment instructions without a payment link."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                    method.active
                      ? "border border-[#b8d0af] bg-[#eef8eb] text-[#46683c]"
                      : "border border-accent bg-surface-strong text-body"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${method.active ? "bg-[#5f8a51]" : "bg-accent"}`}
                  />
                  {method.active ? "Active" : "Inactive"}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/80 px-4 py-2 text-xs font-semibold text-body">
                  <CheckCircle2 className="h-4 w-4 text-body" />
                  {method.paymentLink ? "Linked Route" : "Manual Route"}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[26px] border border-border bg-surface-strong/70 p-5 shadow-[0_14px_28px_rgba(116,93,56,0.06)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                Payment Details
              </p>

              {detailRows.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {detailRows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-2xl border border-border bg-surface-strong p-4"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
                        {row.label}
                      </p>
                      <p className="mt-2 break-all font-mono text-sm text-body">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-border bg-surface-strong p-4 text-sm text-body">
                  No additional payment details are available for this method.
                </div>
              )}
            </section>

            <section className="space-y-5">
              {method.paymentLink ? (
                <div className="rounded-[26px] border border-border bg-surface-strong/70 p-5 shadow-[0_14px_28px_rgba(116,93,56,0.06)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                    Payment Link
                  </p>
                  <a
                    href={method.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface-strong p-4 text-sm font-medium text-body transition hover:bg-surface-strong"
                  >
                    <span className="break-all">{method.paymentLink}</span>
                    <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  </a>
                </div>
              ) : null}

              {method.qrCode ? (
                <div className="rounded-[26px] border border-border bg-surface-strong/70 p-5 shadow-[0_14px_28px_rgba(116,93,56,0.06)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                    QR Preview
                  </p>
                  <div className="mt-4 rounded-[24px] border border-border bg-surface-strong p-4">
                    <img
                      src={method.qrCode}
                      alt="QR Code"
                      className="mx-auto max-h-[320px] w-full rounded-2xl object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-[26px] border border-border bg-surface-strong/70 p-5 shadow-[0_14px_28px_rgba(116,93,56,0.06)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                    QR Preview
                  </p>
                  <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface-strong p-6 text-sm text-body">
                    No QR code is attached to this payment method.
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
