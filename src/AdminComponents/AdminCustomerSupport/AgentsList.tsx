import type { Agent, Ticket } from "@/types/support.types";
import { Loader, Plus, Trash2, UserRound, Users2 } from "lucide-react";

interface AgentsListProps {
  agents: Agent[];
  tickets: Ticket[];
  loading: boolean;
  onAddAgent: () => void;
  onDeleteAgent: (agent: Agent) => void;
}

export const AgentsList = ({
  agents,
  tickets,
  loading,
  onAddAgent,
  onDeleteAgent,
}: AgentsListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[26px] border border-border bg-surface-strong/75 py-20">
        <Loader className="h-10 w-10 animate-spin text-body" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_16px_32px_rgba(116,93,56,0.07)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
            <Users2 className="h-3.5 w-3.5" />
            Agent Coverage
          </div>
          <h4 className="mt-3 text-2xl font-semibold text-heading">
            Support staffing and workload
          </h4>
          <p className="mt-2 text-sm text-body">
            Manage the support team, review active assignments, and remove
            redundant coverage when needed.
          </p>
        </div>

        <button
          onClick={onAddAgent}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-border bg-surface-strong px-6 py-16 text-center">
          <p className="text-lg font-semibold text-heading">No agents found</p>
          <p className="mt-2 text-sm text-body">
            Create the first support agent to start routing tickets.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const activeTickets = tickets.filter(
              (ticket) =>
                ticket.assignedTo?._id === agent._id && ticket.status !== "closed",
            ).length;

            return (
              <div
                key={agent._id}
                className="rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_16px_30px_rgba(116,93,56,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-hover text-accent-foreground shadow-[0_10px_20px_rgba(74,50,24,0.16)]">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-heading">
                        {agent.firstname} {agent.lastname}
                      </h3>
                      <p className="text-sm text-body">{agent.email}</p>
                    </div>
                  </div>

                  {agent.role === "agent" ? (
                    <button
                      type="button"
                      onClick={() => onDeleteAgent(agent)}
                      className="rounded-full border border-border p-2 text-[#9a4d40] dark:text-[#cf958c] transition hover:bg-surface-strong"
                      title="Delete agent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-body">
                      Role
                    </div>
                    <div className="mt-1 text-sm font-semibold capitalize text-heading">
                      {agent.role}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-body">
                      Active Tickets
                    </div>
                    <div className="mt-1 text-sm font-semibold text-heading">
                      {activeTickets}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
