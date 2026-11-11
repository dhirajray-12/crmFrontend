import type { PaymentMethod } from "@/types/payment.types";
import {
  Bitcoin,
  Building2,
  CheckCircle2,
  Link2,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentMethod: Partial<PaymentMethod>;
  activeTab: "bank" | "wallet" | "other";
  dialogMode: "add" | "update";
  qrPreview: string | null;
  onTabChange: (tab: "bank" | "wallet" | "other") => void;
  onMethodChange: (method: Partial<PaymentMethod>) => void;
  onQRFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQRRemove: () => void;
  onSave: () => void;
}

type RouteTab = "bank" | "wallet" | "other";

const routeOptions: Array<{
  tab: RouteTab;
  title: string;
  subtitle: string;
  icon: typeof Building2;
  badge: string;
}> = [
  {
    tab: "bank",
    title: "Bank / Online",
    subtitle: "Accounts, transfers, and payment links",
    icon: Building2,
    badge: "Most used",
  },
  {
    tab: "wallet",
    title: "Crypto Wallet",
    subtitle: "Wallet address and QR based collection",
    icon: Bitcoin,
    badge: "Digital",
  },
  {
    tab: "other",
    title: "Other Method",
    subtitle: "Manual or custom collection route",
    icon: Wallet,
    badge: "Flexible",
  },
];

const fieldClassName =
  "h-12 w-full rounded-2xl border border-border bg-surface-strong px-4 text-sm text-heading outline-none transition-all placeholder:text-body focus:border-accent focus:bg-surface-strong";

const cardClassName =
  "rounded-[26px] border border-border bg-surface-strong shadow-[0_16px_28px_rgba(116,93,56,0.08)]";

const getRouteMeta = (tab: RouteTab) => {
  if (tab === "bank") {
    return {
      title: "Bank / Online route selected",
      description:
        "Configure account identity, transfer details, optional QR, and link support for direct deposit flow.",
      accent: "from-accent-hover to-accent-hover",
      chip: "Bank route",
      icon: Building2,
    };
  }

  if (tab === "wallet") {
    return {
      title: "Crypto wallet route selected",
      description:
        "Capture wallet identity, receiving address, QR code, and active availability for digital deposits.",
      accent: "from-[#4d6235] to-[#7b9a5d]",
      chip: "Wallet route",
      icon: Bitcoin,
    };
  }

  return {
    title: "Custom payment route selected",
    description:
      "Use this for manual channels, local collection methods, or custom instructions outside standard banking flows.",
    accent: "from-accent-hover to-accent-hover",
    chip: "Custom route",
    icon: Wallet,
  };
};

const FormField = ({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-body">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={fieldClassName}
    />
  </div>
);

export const PaymentForm = ({
  isOpen,
  onClose,
  currentMethod,
  activeTab,
  dialogMode,
  qrPreview,
  onTabChange,
  onMethodChange,
  onQRFileChange,
  onQRRemove,
  onSave,
}: PaymentFormProps) => {
  if (!isOpen) return null;

  const selectedRoute = getRouteMeta(activeTab);
  const SelectedIcon = selectedRoute.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[34px] border border-border bg-surface-strong shadow-[0_30px_80px_rgba(74,50,24,0.24)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                {dialogMode === "update" ? "Update Payment Route" : "Create Payment Route"}
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
                {dialogMode === "update"
                  ? "Refine the selected route"
                  : "Add a new route"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
                Choose the route type first, then fill in the exact payment
                instructions shown to the admin dashboard.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl border border-border bg-surface-strong p-3 text-body transition hover:bg-surface-strong"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className={cardClassName}>
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                  Route Selector
                </p>
                <h3 className="mt-2 text-xl font-semibold text-heading">
                  Select a payment route
                </h3>
                <div className="mt-5 space-y-3">
                  {routeOptions.map(({ tab, title, subtitle, icon: Icon, badge }) => {
                    const active = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`w-full rounded-[24px] border p-4 text-left transition-all duration-300 ${
                          active
                            ? "border-accent bg-surface-strong shadow-[0_16px_30px_rgba(116,93,56,0.14)]"
                            : "border-border bg-surface-strong/75 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-strong"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-2xl border p-3 ${
                              active
                                ? "border-accent bg-surface-strong text-body"
                                : "border-border bg-surface-strong text-body"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-heading">
                                {title}
                              </p>
                              <span className="rounded-full border border-border bg-surface-strong/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-body">
                                {badge}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-body">
                              {subtitle}
                            </p>
                          </div>
                          {active ? (
                            <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-body" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden rounded-[28px] border border-border bg-gradient-to-br ${selectedRoute.accent} text-heading shadow-[0_20px_36px_rgba(74,50,24,0.18)]`}
            >
              <div className="p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  <SelectedIcon className="h-3.5 w-3.5" />
                  {selectedRoute.chip}
                </div>
                <h3 className="mt-4 text-2xl font-semibold">
                  {selectedRoute.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-heading/85">
                  {selectedRoute.description}
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardClassName} p-5 sm:p-6`}>
            {activeTab === "bank" ? (
              <BankForm
                currentMethod={currentMethod}
                onMethodChange={onMethodChange}
                qrPreview={qrPreview}
                onQRFileChange={onQRFileChange}
                onQRRemove={onQRRemove}
              />
            ) : null}

            {activeTab === "wallet" ? (
              <WalletForm
                currentMethod={currentMethod}
                onMethodChange={onMethodChange}
                qrPreview={qrPreview}
                onQRFileChange={onQRFileChange}
                onQRRemove={onQRRemove}
              />
            ) : null}

            {activeTab === "other" ? (
              <OtherForm
                currentMethod={currentMethod}
                onMethodChange={onMethodChange}
                qrPreview={qrPreview}
                onQRFileChange={onQRFileChange}
                onQRRemove={onQRRemove}
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-sm text-body">
            The selected route determines which instructions and fields appear in
            the payment registry.
          </p>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl border border-border bg-surface-strong px-5 py-3 text-sm font-medium text-body transition hover:bg-surface-strong"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {dialogMode === "update" ? "Update Route" : "Save Route"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BankForm = ({
  currentMethod,
  onMethodChange,
  qrPreview,
  onQRFileChange,
  onQRRemove,
}: any) => (
  <div className="space-y-5">
    <SectionHeader
      title="Bank route details"
      description="Add the account identity, bank details, and optional payment link used by this route."
    />

    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Account Holder Name"
        placeholder="Enter account holder name"
        value={currentMethod?.accountHolderName || ""}
        onChange={(value) =>
          onMethodChange({
            ...currentMethod,
            accountHolderName: value,
            type: "Bank Account",
          })
        }
      />
      <FormField
        label="Account Number"
        placeholder="Enter account number"
        value={currentMethod?.accountNumber || ""}
        onChange={(value) =>
          onMethodChange({ ...currentMethod, accountNumber: value })
        }
      />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="IFSC / SWIFT Code"
        placeholder="Enter IFSC or SWIFT code"
        value={currentMethod?.ifsc_swift || ""}
        onChange={(value) =>
          onMethodChange({ ...currentMethod, ifsc_swift: value })
        }
      />
      <FormField
        label="Bank Name"
        placeholder="Enter bank name"
        value={currentMethod?.bankName || ""}
        onChange={(value) =>
          onMethodChange({ ...currentMethod, bankName: value })
        }
      />
    </div>

    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <QRUploadSection
        qrPreview={qrPreview}
        onQRFileChange={onQRFileChange}
        onQRRemove={onQRRemove}
      />
      <div className="rounded-[24px] border border-border bg-surface-strong/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-body">
          <Link2 className="h-4 w-4" />
          <p className="text-sm font-semibold">Payment Link</p>
        </div>
        <input
          type="text"
          value={currentMethod?.paymentLink || ""}
          onChange={(e) =>
            onMethodChange({ ...currentMethod, paymentLink: e.target.value })
          }
          placeholder="Optional payment link"
          className={fieldClassName}
        />
        <p className="mt-2 text-xs leading-5 text-subtle">
          Use this when the route also supports a hosted payment page or direct
          transfer shortcut.
        </p>
      </div>
    </div>

    <ActiveCheckbox
      checked={currentMethod?.active || false}
      onChange={(checked: boolean) =>
        onMethodChange({ ...currentMethod, active: checked })
      }
      id="bank-active"
    />
  </div>
);

const WalletForm = ({
  currentMethod,
  onMethodChange,
  qrPreview,
  onQRFileChange,
  onQRRemove,
}: any) => (
  <div className="space-y-5">
    <SectionHeader
      title="Wallet route details"
      description="Add the digital asset name, recipient identity, wallet address, and QR code for wallet based deposits."
    />

    <FormField
      label="Wallet Name"
      placeholder="Bitcoin, Ethereum, USDT, etc."
      value={currentMethod?.walletName || ""}
      onChange={(value) =>
        onMethodChange({
          ...currentMethod,
          walletName: value,
          type: "Crypto Wallet",
        })
      }
    />

    <FormField
      label="Account Holder Name"
      placeholder="Enter account holder name"
      value={currentMethod?.accountHolderName || ""}
      onChange={(value) =>
        onMethodChange({
          ...currentMethod,
          accountHolderName: value,
        })
      }
    />

    <FormField
      label="Wallet Address"
      placeholder="Enter wallet address"
      value={currentMethod?.walletAddress || ""}
      onChange={(value) =>
        onMethodChange({ ...currentMethod, walletAddress: value })
      }
    />

    <QRUploadSection
      qrPreview={qrPreview}
      onQRFileChange={onQRFileChange}
      onQRRemove={onQRRemove}
    />

    <ActiveCheckbox
      checked={currentMethod?.active || false}
      onChange={(checked: boolean) =>
        onMethodChange({ ...currentMethod, active: checked })
      }
      id="wallet-active"
    />
  </div>
);

const OtherForm = ({
  currentMethod,
  onMethodChange,
  qrPreview,
  onQRFileChange,
  onQRRemove,
}: any) => (
  <div className="space-y-5">
    <SectionHeader
      title="Custom route details"
      description="Use a flexible setup for local methods, manual rails, or any custom payment instructions outside the standard bank and wallet flows."
    />

    <FormField
      label="Payment Method Name"
      placeholder="Enter payment method name"
      value={currentMethod?.name || ""}
      onChange={(value) =>
        onMethodChange({
          ...currentMethod,
          name: value,
          type: "Other",
        })
      }
    />

    <div>
      <label className="mb-2 block text-sm font-medium text-body">
        Payment Details
      </label>
      <textarea
        value={currentMethod?.accounts || ""}
        onChange={(e) =>
          onMethodChange({ ...currentMethod, accounts: e.target.value })
        }
        placeholder="Enter payment details"
        className="min-h-[120px] w-full rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading outline-none transition-all placeholder:text-body focus:border-accent focus:bg-surface-strong"
      />
    </div>

    <QRUploadSection
      qrPreview={qrPreview}
      onQRFileChange={onQRFileChange}
      onQRRemove={onQRRemove}
    />

    <ActiveCheckbox
      checked={currentMethod?.active || false}
      onChange={(checked: boolean) =>
        onMethodChange({ ...currentMethod, active: checked })
      }
      id="other-active"
    />
  </div>
);

const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
      Route Form
    </p>
    <h3 className="mt-2 text-xl font-semibold text-heading">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-body">{description}</p>
  </div>
);

const QRUploadSection = ({ qrPreview, onQRFileChange, onQRRemove }: any) => (
  <div className="rounded-[24px] border border-border bg-surface-strong/70 p-4">
    <p className="text-sm font-semibold text-body">QR Code</p>
    <p className="mt-1 text-xs leading-5 text-subtle">
      Upload a JPEG, PNG, or GIF up to 5MB.
    </p>

    <input
      id="qr-file-input"
      type="file"
      accept="image/jpeg,image/png,image/gif"
      onChange={onQRFileChange}
      className="mt-4 block w-full rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-body file:mr-3 file:rounded-xl file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-body"
    />

    {qrPreview ? (
      <div className="relative mt-4 inline-flex rounded-[22px] border border-border bg-surface-strong p-3 shadow-[0_8px_20px_rgba(116,93,56,0.08)]">
        <img
          src={qrPreview}
          alt="QR Preview"
          className="h-36 w-36 rounded-2xl object-contain"
        />
        <button
          onClick={onQRRemove}
          className="absolute -right-2 -top-2 rounded-full bg-[#8b3a2f] p-1.5 text-heading shadow-lg transition hover:bg-[#742f26]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ) : null}
  </div>
);

const ActiveCheckbox = ({ checked, onChange, id }: any) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-center justify-between gap-4 rounded-[22px] border border-border bg-surface-strong/70 p-4"
  >
    <div>
      <p className="text-sm font-semibold text-heading">Set as active</p>
      <p className="mt-1 text-sm text-body">
        Active methods appear as live routes in the registry.
      </p>
    </div>
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="h-7 w-12 rounded-full bg-surface transition peer-checked:bg-[#6b8a51]" />
      <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-surface-strong transition peer-checked:translate-x-5" />
    </div>
  </label>
);
