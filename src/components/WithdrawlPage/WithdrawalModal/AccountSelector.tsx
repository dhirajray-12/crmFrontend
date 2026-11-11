import type { Account } from "@/types/WithdrawalPage.types";
import { getAccountColor } from "@/utils/helpers";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelect: (account: Account) => void;
}

export const AccountSelector = ({
  accounts,
  selectedAccount,
  onSelect,
}: AccountSelectorProps) => {
  const getAccountDisplayName = (type: string) => {
    const names: Record<string, string> = {
      BASIC: "💼 BASIC",
      PRIME: "✨ PRIME",
      ALPHA: "⚡ ALPHA",
      PROEDGE: "✨ PROEDGE",
      INFINITY: "⚡ INFINITY",
    };
    return names[type] || type;
  };

  const getAccountAccent = (type: string) => {
    const accents: Record<string, string> = {
      BASIC: "from-accent to-blue-500",
      PRIME: "from-amber-300 to-orange-400",
      ALPHA: "from-emerald-300 to-green-500",
      PROEDGE: "from-accent to-accent-hover",
      INFINITY: "from-fuchsia-300 to-violet-500",
    };

    return accents[type] || "from-slate-300 to-slate-500";
  };

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="mb-3 text-base font-semibold text-heading sm:mb-4 sm:text-lg">
        Select Account
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {accounts.map((account) => (
          <button
            key={account.account}
            onClick={() => onSelect(account)}
            data-voice-target={`withdrawal account ${account.accountType} ${account.account}`}
            data-voice-value={`withdrawal account ${account.account}`}
            className={`group relative overflow-hidden rounded-xl p-3 text-left shadow-[0_12px_30px_rgba(2,6,23,0.2)] transition-all duration-300 hover:scale-[1.02] hover:bg-surface-strong/[0.08] active:scale-95 sm:rounded-2xl sm:p-4 ${
              selectedAccount?.account === account.account
                ? "bg-surface-strong/[0.1] ring-2 ring-orange-300/20"
                : "border border-border bg-surface-strong/[0.05]"
            }`}
          >
            {selectedAccount?.account === account.account && (
              <>
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(120deg,rgba(251,146,60,0.18),rgba(251,191,36,0.95),rgba(248,113,113,0.7),rgba(251,146,60,0.18))] bg-[length:220%_220%] p-[1px] animate-[withdrawal-border-fire_2.6s_linear_infinite] sm:rounded-2xl">
                  <div className="h-full w-full rounded-[calc(theme(borderRadius.xl)-1px)] bg-surface-strong sm:rounded-[calc(theme(borderRadius.2xl)-1px)]" />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_0_26px_rgba(251,146,60,0.28),0_0_44px_rgba(248,113,113,0.18)] sm:rounded-2xl" />
              </>
            )}
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90 ${getAccountAccent(account.accountType)}`}
            />
            <div
              className="absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-20 blur-2xl"
              style={{ background: getAccountColor(account.accountType) }}
            />
            <div className="relative">
              <p className="mb-1 text-sm font-semibold text-heading">
                {getAccountDisplayName(account.accountType)}
              </p>
              <p className="mb-2 font-mono text-sm text-subtle">
                {account.account}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-subtle">
                Available
              </p>
              <p className="text-xl font-bold text-heading">
                {account.balance}
              </p>
            </div>
          </button>
        ))}
      </div>
      <style>{`
        @keyframes withdrawal-border-fire {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
