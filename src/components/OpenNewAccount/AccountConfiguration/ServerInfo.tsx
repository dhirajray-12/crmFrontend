import { Server } from "lucide-react";
import { GradientIcon } from "@/components/OpenNewAccount/common/GradientIcon";

interface ServerInfoProps {
  server: string;
}

export const ServerInfo = ({ server }: ServerInfoProps) => {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent/25">
      <div className="flex items-center gap-3">
        <div className="transition-transform duration-300 group-hover:scale-110">
          <GradientIcon tone="sky" icon={<Server className="h-4 w-4 sm:h-5 sm:w-5" />} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-heading sm:text-base">
            Server routing
          </h3>
          <p className="text-xs text-subtle">
            Execution endpoint for this profile
          </p>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-field px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
          Current server
        </p>
        <p className="mt-1 break-all text-sm font-medium text-heading">
          {server}
        </p>
      </div>
    </div>
  );
};
