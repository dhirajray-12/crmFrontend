import { useCommissionStore } from "@/Store/commission.store";
import type { Partner } from "@/types/commissionPage.types";
import { Eye } from "lucide-react";
import { memo } from "react";

interface PartnerRowProps {
  partner: Partner;
}

export const PartnerRow = memo(({ partner }: PartnerRowProps) => {
  const { setSelectedPartner } = useCommissionStore();

  return (
    <tr className="border-b border-border transition hover:bg-surface-strong/[0.03]">
      <td className="px-3 py-3">
        <p className="font-semibold text-heading">
          {partner.userId.firstName} {partner.userId.lastName}
        </p>
        <p className="text-xs text-subtle">{partner.userId.email}</p>
      </td>
      <td className="px-3 py-3 text-subtle">{partner.country}</td>
      <td className="px-3 py-3">
        <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
          L{partner.level}
        </span>
      </td>
      <td className="px-3 py-3 text-right font-semibold text-heading">
        {partner.totalVolume.toFixed(4)}
      </td>
      <td className="px-3 py-3 text-right font-bold text-emerald-700 dark:text-emerald-300">
        ${partner.totalEarned.toFixed(4)}
      </td>
      <td className="px-3 py-3 text-right">
        <button
          onClick={() => setSelectedPartner(partner)}
          data-voice-target={`view partner ${partner.userId.firstName} ${partner.userId.lastName}`}
          data-voice-value={`${partner.userId.firstName} ${partner.userId.lastName} ${partner.userId.email} level ${partner.level}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1.5 text-sm font-semibold text-heading transition hover:bg-surface-strong/[0.08] hover:text-heading"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      </td>
    </tr>
  );
});

PartnerRow.displayName = "PartnerRow";
