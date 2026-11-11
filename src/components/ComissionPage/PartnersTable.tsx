import { useCommissionStore } from "@/Store/commission.store";
import { Menu, Users } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { PartnerFilters } from "./PartnerFilters";
import { PartnerMobileCard } from "./PartnerMobileCard";
import { PartnerRow } from "./PartnerRow";

export const PartnersTable = () => {
  const {
    getFilteredPartners,
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    partners,
  } = useCommissionStore();
  const filteredPartners = getFilteredPartners();
  const activePartners = partners.filter((partner) => partner.totalTrades > 0);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
            <Users className="h-5 w-5 text-accent" />
            IB Partners
          </h2>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1.5 text-xs font-semibold text-subtle">
              {filteredPartners.length} / {partners.length}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1.5 text-sm font-semibold text-heading transition hover:bg-surface-strong/[0.08] md:hidden"
            >
              <Menu className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              Network size
            </p>
            <p className="mt-1 text-base font-semibold text-heading">
              {partners.length} partners
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              Active
            </p>
            <p className="mt-1 text-base font-semibold text-heading">
              {activePartners.length} trading
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              Filtered view
            </p>
            <p className="mt-1 text-base font-semibold text-heading">
              {filteredPartners.length} visible
            </p>
          </div>
        </div>

        <div className={`${showFilters ? "block" : "hidden"} md:block`}>
          <input
            type="text"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none"
          />
        </div>

        <PartnerFilters showFilters={showFilters} searchTerm={searchTerm} />
      </div>

      {filteredPartners.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-heading/30" />}
          title="No IB Partners Found"
          description={
            searchTerm || showFilters
              ? "Try adjusting your filters"
              : "IB partners will appear here once you have referrals"
          }
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredPartners.map((partner) => (
              <PartnerMobileCard key={partner._id} partner={partner} />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Name / Email
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Country
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Level
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Total Volume
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Commission Earned
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <PartnerRow key={partner._id} partner={partner} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
