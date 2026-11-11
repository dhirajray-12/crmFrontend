import { Sparkles } from "lucide-react";
import type { AccountType, UserInfo } from "@/types/OpenAccount.type";
import { getUserDisplayName } from "@/utils/OpenAccount.Helper";
import { FeatureList } from "@/components/OpenNewAccount/common/FeatureList";

interface AccountDetailsPreviewProps {
  accountType: AccountType;
  user: UserInfo | null;
}

export const AccountDetailsPreview = ({
  accountType,
  user,
}: AccountDetailsPreviewProps) => {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent/25">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent/80">
        Account preview
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface-strong/[0.05] text-2xl transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
          {accountType.icon}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold text-heading">
            {accountType.name} Account
          </h4>
          <p className="truncate text-xs text-subtle">
            {accountType.server}
          </p>
        </div>
      </div>

      {user && (
        <div className="mt-4 rounded-xl border border-border bg-field p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              Account holder
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-200">
              <Sparkles className="h-3 w-3" />
              Verified
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-heading">
            {getUserDisplayName(user)}
          </p>
          <p className="break-all text-xs text-subtle">{user.email}</p>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <FeatureList features={accountType.features} />
      </div>
    </div>
  );
};
