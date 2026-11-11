import { Eye } from "lucide-react";
import type { Partner } from "@/types/commissionPage.types";
import { useCommissionStore } from "@/Store/commission.store";

interface PartnerMobileCardProps {
  partner: Partner;
}

export const PartnerMobileCard = ({ partner }: PartnerMobileCardProps) => {
  const { setSelectedPartner } = useCommissionStore();

  return (
    <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
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
          <p className="text-subtle">Country</p>
          <p className="mt-0.5 truncate font-semibold text-heading">
            {partner.country}
          </p>
        </div>
        <div>
          <p className="text-subtle">Total Volume</p>
          <p className="mt-0.5 truncate font-semibold text-heading">
            {partner.totalVolume.toFixed(4)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-subtle">Commission Earned</p>
          <p className="mt-0.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            ${partner.totalEarned.toFixed(4)}
          </p>
        </div>
      </div>

      <button
        onClick={() => setSelectedPartner(partner)}
        data-voice-target={`view partner ${partner.userId.firstName} ${partner.userId.lastName}`}
        data-voice-value={`${partner.userId.firstName} ${partner.userId.lastName} ${partner.userId.email} level ${partner.level}`}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2 text-sm font-semibold text-heading transition hover:bg-surface-strong/[0.08] hover:text-heading"
      >
        <Eye className="h-4 w-4" />
        View Details
      </button>
    </div>
  );
};
