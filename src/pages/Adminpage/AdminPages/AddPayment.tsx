import { DeleteConfirmationDialog } from "@/AdminComponents/payment/DeleteConfirmationDialog";
import { PaymentDetailsDialog } from "@/AdminComponents/payment/PaymentDetailsDialog";
import { PaymentForm } from "@/AdminComponents/payment/PaymentForm";
import { usePaymentStore } from "@/Store/payment.store";
import { useToastStore } from "@/Store/toast.store";
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useTogglePaymentMethod,
  useUpdatePaymentMethod,
} from "@/hooks/usePaymentQueries";
import type { PaymentMethod } from "@/types/payment.types";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  Eye,
  Landmark,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";

const typeIcon = (type: string) => {
  if (type === "Bank Account" || type === "Online Banking") return Landmark;
  if (type === "Crypto Wallet") return Coins;
  return CreditCard;
};

const typeAccent = (type: string) => {
  if (type === "Bank Account" || type === "Online Banking") {
    return {
      soft: "rgba(232, 193, 122, 0.18)",
      border: "var(--accent-color)",
      text: "#8a6329",
      badge: "#fff4dd",
    };
  }

  if (type === "Crypto Wallet") {
    return {
      soft: "rgba(138, 184, 138, 0.18)",
      border: "#b8d0af",
      text: "#46683c",
      badge: "#eef8eb",
    };
  }

  return {
    soft: "rgba(196, 160, 85, 0.14)",
    border: "var(--border)",
    text: "#6f5627",
    badge: "#fdf6e8",
  };
};

type DetailRow = {
  label: string;
  value: string;
};

const SummaryTile = ({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <div className="relative overflow-hidden rounded-[26px] border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-surface" />
    <div className="mb-3 flex items-center justify-between">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
        {label}
      </div>
      <div className="rounded-2xl border border-border bg-surface-strong/70 p-2">
        <Icon className="h-4 w-4 text-body" />
      </div>
    </div>
    <div className="text-[30px] font-semibold leading-none tracking-tight text-heading">
      {value}
    </div>
    <div className="mt-2 text-sm leading-6 text-body">{detail}</div>
  </div>
);

const isDetailRow = (row: DetailRow | null): row is DetailRow => row !== null;

export default function AddPaymentMethodPage() {
  const store = usePaymentStore();
  const addToast = useToastStore((state) => state.addToast);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const itemsPerPage = 6;

  const { data: paymentMethods = [] } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();
  const toggleMutation = useTogglePaymentMethod();

  const filtered = paymentMethods.filter((method) => {
    const matchSearch =
      !search ||
      method.type?.toLowerCase().includes(search.toLowerCase()) ||
      method.bankName?.toLowerCase().includes(search.toLowerCase()) ||
      method.walletName?.toLowerCase().includes(search.toLowerCase()) ||
      method.accountHolderName?.toLowerCase().includes(search.toLowerCase()) ||
      method.accountNumber?.toLowerCase().includes(search.toLowerCase()) ||
      method.walletAddress?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || method.type === typeFilter;
    const matchActive =
      activeFilter === "All" ||
      (activeFilter === "Active" && method.active) ||
      (activeFilter === "Inactive" && !method.active);

    return matchSearch && matchType && matchActive;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, activeFilter]);

  const handleSave = async () => {
    try {
      if (!store.currentMethod) return;

      const formData = new FormData();
      Object.keys(store.currentMethod).forEach((key) => {
        const value = store.currentMethod[key as keyof PaymentMethod];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (store.qrFile) {
        formData.append("qrCode", store.qrFile);
      }

      if (store.dialogMode === "update" && store.currentMethod._id) {
        await updateMutation.mutateAsync({
          id: store.currentMethod._id,
          formData,
        });
        addToast("success", "Payment method updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        addToast("success", "Payment method created successfully");
      }

      store.setDialogOpen(false);
      store.resetForm();
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || "Failed to save payment method",
      );
    }
  };

  const handleDelete = async () => {
    try {
      if (!store.currentMethod?._id) return;
      await deleteMutation.mutateAsync(store.currentMethod._id);
      addToast("success", "Payment method deleted successfully");
      store.setDeleteDialogOpen(false);
    } catch (error: any) {
      addToast("error", error.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggle = async (method: PaymentMethod) => {
    try {
      await toggleMutation.mutateAsync({
        id: method._id,
        active: !method.active,
      });
      addToast("success", "Status updated successfully");
    } catch {
      addToast("error", "Failed to update status");
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    store.setCurrentMethod(method);
    store.setDialogMode("update");
    store.setQrPreview(null);
    store.setQrFile(null);

    if (method.type === "Bank Account" || method.type === "Online Banking") {
      store.setActiveTab("bank");
    } else if (method.type === "Crypto Wallet") {
      store.setActiveTab("wallet");
    } else {
      store.setActiveTab("other");
    }

    store.setDialogOpen(true);
  };

  const handleQRFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      addToast("error", "Invalid file type. Please upload JPEG, PNG, or GIF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "File too large. Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => store.setQrPreview(reader.result as string);
    reader.readAsDataURL(file);
    store.setQrFile(file);
  };

  const openAdd = (type: "bank" | "wallet" | "other") => {
    const defaults: Record<string, Partial<PaymentMethod>> = {
      bank: {
        type: "Bank Account",
        accountHolderName: "",
        accountNumber: "",
        ifsc_swift: "",
        bankName: "",
        paymentLink: "",
        qrCode: null,
        active: true,
      },
      wallet: {
        type: "Crypto Wallet",
        walletName: "",
        accountHolderName: "",
        walletAddress: "",
        paymentLink: "",
        qrCode: null,
        active: true,
      },
      other: {
        type: "Other",
        name: "",
        accounts: "",
        paymentLink: "",
        qrCode: null,
        active: true,
      },
    };

    store.setCurrentMethod(defaults[type]);
    store.setDialogMode("add");
    store.setActiveTab(type);
    store.setDialogOpen(true);
  };

  const bankCount = paymentMethods.filter(
    (method) =>
      method.type === "Bank Account" || method.type === "Online Banking",
  ).length;
  const cryptoCount = paymentMethods.filter(
    (method) => method.type === "Crypto Wallet",
  ).length;
  const otherCount = paymentMethods.filter(
    (method) => method.type === "Other",
  ).length;
  const activeCount = paymentMethods.filter((method) => method.active).length;
  const inactiveCount = Math.max(paymentMethods.length - activeCount, 0);
  const latestMethod = paymentMethods[0] || null;
  const liveCoverage = paymentMethods.length
    ? Math.round((activeCount / paymentMethods.length) * 100)
    : 0;
  const latestMethodLabel =
    latestMethod?.bankName ||
    latestMethod?.walletName ||
    latestMethod?.name ||
    latestMethod?.type ||
    "No active payment route yet";

  const quickActions = [
    {
      label: "Bank / Online",
      detail: "Account and wire instructions",
      icon: Landmark,
      onClick: () => openAdd("bank"),
    },
    {
      label: "Crypto Wallet",
      detail: "Wallet addresses and QR routing",
      icon: Coins,
      onClick: () => openAdd("wallet"),
    },
    {
      label: "Other Method",
      detail: "Custom rails and manual channels",
      icon: WalletCards,
      onClick: () => openAdd("other"),
    },
  ];

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222,204,168,0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <section className="rounded-[30px] border border-border bg-surface p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08),0_30px_70px_rgba(116,93,56,0.12)] ring-1 ring-white/65 dark:ring-white/10 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                <WalletCards className="h-3.5 w-3.5" />
                Payment Operations
              </div>
              <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
                Payment Methods
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-body">
                Manage deposit rails, availability, and payment instructions.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => openAdd("bank")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </button>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong/65 px-4 py-3 text-sm text-body">
                  <ShieldCheck className="h-4 w-4 text-body" />
                  {liveCoverage}% of methods are live
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_12px_22px_rgba(116,93,56,0.08)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                  Live Snapshot
                </p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-semibold tracking-tight text-heading">
                      {liveCoverage}%
                    </p>
                    <p className="mt-2 text-sm text-body">
                      Active route coverage across the full payment registry.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-strong p-3 text-body">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-border bg-surface-strong/90 p-5 shadow-[0_12px_22px_rgba(116,93,56,0.06)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                  Latest Registry Entry
                </p>
                <p className="mt-3 text-lg font-semibold text-heading">
                  {latestMethodLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-body">
                  {latestMethod
                    ? `${latestMethod.type} is currently ${latestMethod.active ? "live" : "inactive"} in the dashboard view.`
                    : "Create a new method to start building the payment registry."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              label="Total Methods"
              value={String(paymentMethods.length)}
              detail={`${filtered.length} visible after filters`}
              icon={WalletCards}
            />
            <SummaryTile
              label="Active Routes"
              value={String(activeCount)}
              detail={`${inactiveCount} currently inactive`}
              icon={ShieldCheck}
            />
            <SummaryTile
              label="Bank + Online"
              value={String(bankCount)}
              detail="Traditional rails and transfer methods"
              icon={Landmark}
            />
            <SummaryTile
              label="Crypto Wallets"
              value={String(cryptoCount)}
              detail={`${otherCount} additional custom payment method${otherCount === 1 ? "" : "s"}`}
              icon={Coins}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-border bg-surface-strong p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                  Registry Snapshot
                </p>
                <h2 className="mt-2 text-xl font-semibold text-heading">
                  Operational highlights
                </h2>
              </div>
              <div className="rounded-2xl border border-border bg-surface-strong p-2 text-body">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "All methods",
                  value: paymentMethods.length,
                },
                {
                  label: "Bank share",
                  value: bankCount,
                },
                {
                  label: "Crypto share",
                  value: cryptoCount,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-surface-strong/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-heading">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface-strong/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                Health note
              </p>
              <p className="mt-2 text-sm leading-6 text-body">
                {inactiveCount > 0
                  ? `${inactiveCount} method${inactiveCount === 1 ? "" : "s"} are inactive and may need admin review before showing them as available deposit options.`
                  : "All configured payment methods are currently marked active."}
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-surface-strong/65 p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08)] backdrop-blur-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                  Quick Actions
                </p>
                <h2 className="mt-2 text-xl font-semibold text-heading">
                  Add a new route
                </h2>
              </div>
              <div className="rounded-2xl border border-border bg-surface-strong p-2 text-body">
                <Plus className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {quickActions.map(({ label, detail, icon: Icon, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="group flex w-full items-center gap-4 rounded-[22px] border border-border bg-surface-strong/80 px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-surface-strong hover:shadow-[0_16px_28px_rgba(116,93,56,0.12)]"
                >
                  <div className="rounded-2xl border border-border bg-surface-strong p-3 text-body transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-heading">
                      {label}
                    </p>
                    <p className="mt-1 text-sm text-body">{detail}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-body transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-border bg-surface-strong/65 p-4 shadow-[0_18px_34px_rgba(116,93,56,0.08)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                  Payment Registry
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-heading">
                  Live methods and availability
                </h2>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                <input
                  type="text"
                  placeholder="Search by name, account, wallet, or type"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border bg-surface-strong pl-10 pr-4 text-sm text-heading outline-none transition-colors placeholder:text-body focus:border-accent"
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_auto_auto] xl:items-center">
              <div className="rounded-2xl border border-border bg-surface-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                  Activity note
                </p>
                <p className="mt-2 text-sm text-body">
                  {latestMethod
                    ? `${latestMethod.bankName || latestMethod.walletName || latestMethod.name || latestMethod.type} is the latest visible payment record in the registry.`
                    : "No payment methods are available yet. Add one to start populating the registry."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["All", "Bank Account", "Crypto Wallet", "Other"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className="rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300"
                      style={
                        typeFilter === type
                          ? {
                              background:
                                "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                              color: "var(--heading)",
                              boxShadow: "0 10px 18px rgba(74,50,24,0.18)",
                            }
                          : {
                              background: "var(--surface-strong)",
                              border: "1px solid var(--border)",
                              color: "var(--body)",
                            }
                      }
                    >
                      {type === "Bank Account"
                        ? "Bank"
                        : type === "Crypto Wallet"
                          ? "Crypto"
                          : type}
                    </button>
                  ),
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {["All", "Active", "Inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className="rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300"
                    style={
                      activeFilter === status
                        ? {
                            background:
                              "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                            color: "var(--heading)",
                            boxShadow: "0 10px 18px rgba(74,50,24,0.18)",
                          }
                        : {
                            background: "var(--surface-strong)",
                            border: "1px solid var(--border)",
                            color: "var(--body)",
                          }
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {totalItems === 0 ? (
              <div className="rounded-[26px] border border-dashed border-border bg-surface-strong p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-strong text-body">
                  <WalletCards className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-heading">
                  No payment methods found
                </h3>
                <p className="mt-2 text-sm text-body">
                  Adjust the filters or create a new payment route to populate
                  this registry.
                </p>
                <button
                  onClick={() => openAdd("bank")}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add First Method
                </button>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {paginated.map((method) => {
                  const Icon = typeIcon(method.type);
                  const accent = typeAccent(method.type);
                  const title =
                    method.bankName ||
                    method.walletName ||
                    method.name ||
                    method.type;

                  const detailRows = [
                    method.accountHolderName
                      ? {
                          label: "Holder",
                          value: method.accountHolderName,
                        }
                      : null,
                    method.accountNumber
                      ? {
                          label: "Account No.",
                          value: method.accountNumber,
                        }
                      : null,
                    method.walletAddress
                      ? {
                          label: "Wallet Address",
                          value: method.walletAddress,
                        }
                      : null,
                    method.ifsc_swift
                      ? {
                          label: "IFSC / SWIFT",
                          value: method.ifsc_swift,
                        }
                      : null,
                    method.walletName
                      ? {
                          label: "Wallet",
                          value: method.walletName,
                        }
                      : null,
                    method.accounts
                      ? {
                          label: "Accounts",
                          value: method.accounts,
                        }
                      : null,
                  ]
                    .filter(isDetailRow)
                    .slice(0, 3);

                  return (
                    <article
                      key={method._id}
                      className="group relative overflow-hidden rounded-[28px] border border-border bg-surface-strong p-5 shadow-[0_14px_28px_rgba(116,93,56,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(116,93,56,0.16)]"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, ${accent.border}, rgba(255,255,255,0))`,
                        }}
                      />
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            style={{
                              background: accent.soft,
                              borderColor: accent.border,
                              color: accent.text,
                            }}
                          >
                            <Icon className="h-6 w-6" />
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
                            <h3 className="mt-3 text-xl font-semibold text-heading">
                              {title}
                            </h3>
                            <p className="mt-1 text-sm text-body">
                              {method.paymentLink
                                ? "Payment link configured and ready for review."
                                : "No payment link attached to this method yet."}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <button
                            onClick={() => handleToggle(method)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                              method.active
                                ? "border border-[#b8d0af] bg-[#eef8eb] text-[#46683c]"
                                : "border border-accent bg-surface-strong text-body"
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${method.active ? "bg-[#5f8a51]" : "bg-accent"}`}
                            />
                            {method.active ? "Active" : "Inactive"}
                          </button>
                          <span className="text-xs text-subtle">
                            {method.paymentLink
                              ? "Linked route"
                              : "Manual route"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {detailRows.length > 0 ? (
                          detailRows.map((row) => (
                            <div
                              key={row.label}
                              className="rounded-2xl border border-border bg-surface-strong/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
                                {row.label}
                              </p>
                              <p className="mt-2 break-all font-mono text-xs text-body">
                                {row.value}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-border bg-surface-strong/70 p-4 text-sm text-body sm:col-span-3">
                            No additional payment details available for this
                            method.
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-body">
                          {method.paymentLink
                            ? "Linked for payment flow"
                            : "Manual payment instructions only"}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              store.setSelectedMethodDetails(method);
                              store.setDetailsDialogOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-body transition hover:bg-surface-strong"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(method)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-body transition hover:bg-surface-strong"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              store.setCurrentMethod(method);
                              store.setDeleteDialogOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-[#9a4d40] dark:text-[#cf958c] transition hover:bg-surface-strong"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {totalItems > 0 ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-strong p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-body">
                  Showing{" "}
                  <span className="font-semibold text-heading">
                    {startIndex + 1}
                  </span>
                  {" - "}
                  <span className="font-semibold text-heading">
                    {Math.min(startIndex + itemsPerPage, totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-heading">
                    {totalItems}
                  </span>{" "}
                  methods
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-body transition hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  <div className="rounded-full border border-border bg-surface-strong px-4 py-2 text-sm font-semibold text-body">
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-body transition hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <PaymentForm
        isOpen={store.isDialogOpen}
        onClose={() => {
          store.setDialogOpen(false);
          store.resetForm();
        }}
        currentMethod={store.currentMethod}
        activeTab={store.activeTab}
        dialogMode={store.dialogMode}
        qrPreview={store.qrPreview}
        onTabChange={store.setActiveTab}
        onMethodChange={store.setCurrentMethod}
        onQRFileChange={handleQRFileChange}
        onQRRemove={() => {
          store.setQrFile(null);
          store.setQrPreview(null);
          const element = document.getElementById(
            "qr-file-input",
          ) as HTMLInputElement;
          if (element) {
            element.value = "";
          }
        }}
        onSave={handleSave}
      />

      <DeleteConfirmationDialog
        isOpen={store.isDeleteDialogOpen}
        onClose={() => store.setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Remove from Registry"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
      />

      <PaymentDetailsDialog
        isOpen={store.isDetailsDialogOpen}
        onClose={() => store.setDetailsDialogOpen(false)}
        method={store.selectedMethodDetails}
      />
    </div>
  );
}
