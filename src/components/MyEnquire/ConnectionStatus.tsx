import { Loader } from "lucide-react";

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "error" | "disconnected";
  agentOnline: boolean;
}

export const ConnectionStatus = ({
  status,
  agentOnline,
}: ConnectionStatusProps) => {
  if (status === "connecting") {
    return (
      <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <Loader className="animate-spin" size={14} />
        Connecting to live chat…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
        Live chat unavailable
      </div>
    );
  }

  if (status === "connected" && !agentOnline) {
    return (
      <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.05] px-3 py-1.5 text-xs font-semibold text-subtle">
        Agent is offline
      </div>
    );
  }

  return null;
};
