import React from "react";
import { Search, Users } from "lucide-react";
import { usePartnerStore } from "@/Store/PartnerDasboardStore";
import type { Partner } from "@/types/PartnerDasboard.types";
import { formatCurrency, formatDate } from "@/utils/PartnerDashboard.utils";
import { PartnersEmptyState } from "./PartnersEmptyState";

interface PartnersTableProps {
  partners: Partner[];
}

export const PartnersTable: React.FC<PartnersTableProps> = ({ partners }) => {
  const {
    partnerSearchTerm,
    partnerLevelFilter,
    setPartnerSearchTerm,
    setPartnerLevelFilter,
  } = usePartnerStore();

  if (partners.length === 0) {
    return <PartnersEmptyState />;
  }

  const levels = Array.from(new Set(partners.map((partner) => partner.level))).sort(
    (a, b) => a - b,
  );

  const filteredPartners = partners.filter((partner) => {
    const normalizedSearch = partnerSearchTerm.trim().toLowerCase();
    const fullName =
      `${partner.userId.firstName || ""} ${partner.userId.lastName || ""}`.trim();
    const matchesSearch =
      !normalizedSearch ||
      fullName.toLowerCase().includes(normalizedSearch) ||
      partner.userId.email.toLowerCase().includes(normalizedSearch) ||
      partner.referralCode.toLowerCase().includes(normalizedSearch);
    const matchesLevel =
      partnerLevelFilter === "all" || partner.level === partnerLevelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
            <Users className="h-5 w-5 text-accent" />
            Partner Network
          </h2>
          <span className="rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1.5 text-xs font-semibold text-subtle">
            {filteredPartners.length} / {partners.length}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-subtle" />
            <input
              type="text"
              value={partnerSearchTerm}
              onChange={(event) => setPartnerSearchTerm(event.target.value)}
              placeholder="Search name, email, or referral code"
              className="w-full min-w-0 bg-transparent text-sm text-heading placeholder:text-subtle focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPartnerLevelFilter("all")}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                partnerLevelFilter === "all"
                  ? "bg-accent/15 text-accent"
                  : "border border-border bg-surface-strong/[0.04] text-subtle hover:bg-surface-strong/[0.08]"
              }`}
            >
              All
            </button>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setPartnerLevelFilter(level)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  partnerLevelFilter === level
                    ? "bg-accent/15 text-accent"
                    : "border border-border bg-surface-strong/[0.04] text-subtle hover:bg-surface-strong/[0.08]"
                }`}
              >
                L{level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredPartners.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-base font-medium text-heading/70">
            No partners match this view
          </p>
          <p className="mt-1 text-sm text-subtle">
            Clear the search or switch level filters to widen the network list.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 sm:hidden">
            {filteredPartners.map((partner) => (
              <div
                key={partner._id}
                className="rounded-lg border border-border bg-surface-strong/[0.03] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-heading">
                      {partner.userId.firstName} {partner.userId.lastName}
                    </p>
                    <p className="truncate text-xs text-subtle">
                      {partner.userId.email}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                    L{partner.level}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-subtle">Referral Code</p>
                    <p className="mt-0.5 font-semibold text-heading">
                      {partner.referralCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtle">Joined</p>
                    <p className="mt-0.5 text-heading">
                      {formatDate(partner.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtle">Volume</p>
                    <p className="mt-0.5 font-semibold text-heading">
                      {partner.totalVolume.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtle">Total Equity</p>
                    <p className="mt-0.5 font-semibold text-heading">
                      {partner.totalEquity.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtle">Commission Earned</p>
                    <p className="mt-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(partner.totalEarned, 4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtle">Balance</p>
                    <p className="mt-0.5 text-heading">
                      {formatCurrency(partner.totalBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-subtle">Max Commission</p>
                    <p className="mt-0.5 font-semibold text-heading">
                      {partner.isPendingAssignment ? (
                        <span className="rounded-md border border-amber-400/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                          Pending
                        </span>
                      ) : (
                        `$${(partner.maximumCommission ?? 0).toFixed(2)}/lot`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Partner
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Referral Code
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Level
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Volume
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Total Equity
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Commission Earned
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Balance
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Max Commission
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr
                    key={partner._id}
                    className="border-b border-border transition hover:bg-surface-strong/[0.03]"
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-heading">
                        {partner.userId.firstName} {partner.userId.lastName}
                      </p>
                      <p className="text-xs text-subtle">
                        {partner.userId.email}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                        {partner.referralCode}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                        L{partner.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-heading">
                      {partner.totalVolume.toFixed(4)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-heading">
                      {partner.totalEquity.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(partner.totalEarned, 4)}
                    </td>
                    <td className="px-3 py-3 text-right text-heading">
                      {formatCurrency(partner.totalBalance)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {partner.isPendingAssignment ? (
                        <span className="rounded-md border border-amber-400/20 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Pending
                        </span>
                      ) : (
                        <span className="text-heading">
                          ${(partner.maximumCommission ?? 0).toFixed(2)}/lot
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-subtle">
                      {formatDate(partner.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
