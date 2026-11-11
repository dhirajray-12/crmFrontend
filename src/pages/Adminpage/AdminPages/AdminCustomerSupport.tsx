import { AddAgentModal } from "@/AdminComponents/AdminCustomerSupport/AddAgentModal";
import { AgentsList } from "@/AdminComponents/AdminCustomerSupport/AgentsList";
import { CreateTicketModal } from "@/AdminComponents/AdminCustomerSupport/CreateTicketModal";
import { Header } from "@/AdminComponents/AdminCustomerSupport/Header";
import { TabNavigation } from "@/AdminComponents/AdminCustomerSupport/TabNavigation";
import { TicketDetailView } from "@/AdminComponents/AdminCustomerSupport/TicketDetailView";
import { TicketFilters } from "@/AdminComponents/AdminCustomerSupport/TicketFilters";
import { TicketTable } from "@/AdminComponents/AdminCustomerSupport/TicketTable";
import { useAuthStore } from "@/Store/auth.store";
import { useSupportStore } from "@/Store/support.store";
import { useToastStore } from "@/Store/toast.store";
import {
  useClients,
  useCreateTicket,
  useDeleteAgent,
  useRegisterAgent,
  useSendMessage,
  useTicket,
  useTickets,
  useUpdateTicket,
} from "@/hooks/useSupportQueries";
import type { Agent, Ticket } from "@/types/support.types";
import { useSocket } from "@/hooks/useSocket";
import { getSocketServerUrl } from "@/utils/socketUrl";
import {
  CircleDot,
  Clock3,
  Headset,
  type LucideIcon,
  Plus,
  ShieldCheck,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";

const SOCKET_URL = getSocketServerUrl();

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
  <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="mb-3 flex items-center justify-between">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
        {label}
      </div>
      <Icon className="h-4 w-4 text-body" />
    </div>
    <div className="text-2xl font-semibold tracking-tight text-heading">
      {value}
    </div>
    <div className="mt-1 text-sm text-body">{detail}</div>
  </div>
);

const statusCatalog: Array<{
  key: string;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "new", label: "New", icon: CircleDot },
  { key: "open", label: "Open", icon: Headset },
  { key: "inProgress", label: "In Progress", icon: Clock3 },
  { key: "resolved", label: "Resolved", icon: ShieldCheck },
  { key: "closed", label: "Closed", icon: UserRoundCog },
];

export default function CustomerSupportPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const isAgent = user?.role === "agent";
  const addToast = useToastStore((state) => state.addToast);
  const selectedTicketId = useSupportStore(
    (state) => state.selectedTicket?._id || "",
  );
  const selectedTicket = useSupportStore((state) => state.selectedTicket);
  const activeTab = useSupportStore((state) => state.activeTab);
  const tickets = useSupportStore((state) => state.tickets);
  const agents = useSupportStore((state) => state.agents);
  const clients = useSupportStore((state) => state.clients);
  const loading = useSupportStore((state) => state.loading);
  const socket = useSupportStore((state) => state.socket);
  const searchTerm = useSupportStore((state) => state.searchTerm);
  const filterStatus = useSupportStore((state) => state.filterStatus);
  const showCreateTicket = useSupportStore((state) => state.showCreateTicket);
  const showAddAgent = useSupportStore((state) => state.showAddAgent);
  const setShowCreateTicket = useSupportStore(
    (state) => state.setShowCreateTicket,
  );
  const setShowAddAgent = useSupportStore((state) => state.setShowAddAgent);
  const setSearchTerm = useSupportStore((state) => state.setSearchTerm);
  const setFilterStatus = useSupportStore((state) => state.setFilterStatus);
  const [agentPendingDelete, setAgentPendingDelete] = useState<Agent | null>(
    null,
  );

  const { data: ticketsData = [], refetch: refetchTickets } = useTickets();
  const { data: clientsData, refetch: refetchClients } = useClients(!isAgent);
  const { data: selectedTicketDetail } = useTicket(selectedTicketId);
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const sendMessage = useSendMessage();
  const registerAgent = useRegisterAgent();
  const deleteAgent = useDeleteAgent();

  const setTickets = useSupportStore((state) => state.setTickets);
  const setAgents = useSupportStore((state) => state.setAgents);
  const setClients = useSupportStore((state) => state.setClients);
  const setSocket = useSupportStore((state) => state.setSocket);
  const addMessageToTicket = useSupportStore(
    (state) => state.addMessageToTicket,
  );
  const setSelectedTicket = useSupportStore((state) => state.setSelectedTicket);
  const setActiveTab = useSupportStore((state) => state.setActiveTab);

  useEffect(() => {
    if (isAgent && activeTab === "agents") {
      setActiveTab("tickets");
    }
  }, [activeTab, isAgent, setActiveTab]);

  useEffect(() => {
    if (Array.isArray(ticketsData)) {
      setTickets(ticketsData);
    }

    if (clientsData) {
      setAgents(clientsData.agents);
      setClients(clientsData.clients);
    }
  }, [clientsData, setAgents, setClients, setTickets, ticketsData]);

  useEffect(() => {
    if (selectedTicketDetail) {
      setSelectedTicket(selectedTicketDetail);
    }
  }, [selectedTicketDetail, setSelectedTicket]);

  const { socket: sharedSocket, onMessageReceived } = useSocket({
    userId: isAuthInitialized ? user?._id || "" : "",
    serverUrl: SOCKET_URL,
  });

  useEffect(() => {
    setSocket(sharedSocket);
    return () => {
      setSocket(null);
    };
  }, [sharedSocket, setSocket]);

  useEffect(() => {
    const cleanup = onMessageReceived((data) => {
      const ticketId = data?.ticketId;
      const message = data?.message ?? data;

      if (ticketId) {
        addMessageToTicket(ticketId, message, data?.status);
      }
    });

    return cleanup;
  }, [onMessageReceived, addMessageToTicket]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTicket = async (formData: any) => {
    const result = await createTicket.mutateAsync(formData);

    if (formData.assignedTo && result) {
      await updateTicket.mutateAsync({
        ticketId: result._id,
        updates: { assignedTo: formData.assignedTo },
      });
    }

    addToast("success", "Ticket created successfully!");
    setShowCreateTicket(false);
    refetchTickets();
  };

  const handleAddAgent = async (formData: any) => {
    addToast("info", "Creating agent...");
    try {
      await registerAgent.mutateAsync(formData);
      addToast("success", "Agent added successfully!");
      setShowAddAgent(false);
      refetchClients();
    } catch (error: any) {
      addToast("error", error?.message || "Failed to create agent");
      throw error;
    }
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentPendingDelete(agent);
  };

  const confirmDeleteAgent = async () => {
    if (!agentPendingDelete) {
      return;
    }

    addToast("info", "Deleting agent...");

    try {
      await deleteAgent.mutateAsync(agentPendingDelete._id);
      addToast("success", "Agent deleted successfully!");
      setAgentPendingDelete(null);
      refetchClients();
    } catch (error: any) {
      addToast("error", error?.message || "Failed to delete agent");
    }
  };

  const handleSendMessage = async (
    ticketId: string,
    content: string,
    attachment?: File | null,
  ) => {
    const sentMessage = await sendMessage.mutateAsync({
      ticketId,
      content,
      attachment,
    });
    addMessageToTicket(ticketId, sentMessage);
  };

  const handleUpdateTicket = async (ticketId: string, updates: any) => {
    const result = await updateTicket.mutateAsync({ ticketId, updates });
    addToast("success", "Ticket updated successfully!");
    setSelectedTicket(result);
    refetchTickets();
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(
    (ticket) => ticket.status === "new" || ticket.status === "open",
  ).length;
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "inProgress",
  ).length;
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved" || ticket.status === "closed",
  ).length;
  const unassignedTickets = tickets.filter(
    (ticket) => !ticket.assignedTo,
  ).length;
  const activeAgents = agents.filter((agent) => agent.role === "agent").length;

  const statusHighlights = statusCatalog.map(({ key, label, icon: Icon }) => ({
    key,
    label,
    Icon,
    count: tickets.filter((ticket) => ticket.status === key).length,
  }));

  const busiestAgent =
    agents
      .filter((agent) => agent.role === "agent")
      .map((agent) => ({
        ...agent,
        activeTickets: tickets.filter(
          (ticket) =>
            ticket.assignedTo?._id === agent._id && ticket.status !== "closed",
        ).length,
      }))
      .sort((a, b) => b.activeTickets - a.activeTickets)[0] || null;

  const latestTicket = [...filteredTickets].sort(
    (a: Ticket, b: Ticket) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  if (selectedTicket) {
    return (
      <TicketDetailView
        ticket={selectedTicket}
        agents={agents}
        socket={socket}
        onBack={() => setSelectedTicket(null)}
        onSendMessage={handleSendMessage}
        onUpdateTicket={handleUpdateTicket}
      />
    );
  }

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
        <Header
          title="Customer Support Control Desk"
          subtitle="Track incoming requests, direct agent workload, and manage ticket conversations from one warmer operational view."
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile
            label="Support Queue"
            value={String(totalTickets)}
            detail={`${filteredTickets.length} visible after filters`}
            icon={Headset}
          />
          <SummaryTile
            label="Open Work"
            value={String(openTickets + inProgressTickets)}
            detail={`${unassignedTickets} ticket${unassignedTickets === 1 ? "" : "s"} waiting for assignment`}
            icon={Clock3}
          />
          <SummaryTile
            label="Active Agents"
            value={String(activeAgents)}
            detail={
              busiestAgent
                ? `${busiestAgent.firstname} ${busiestAgent.lastname} is handling the busiest queue`
                : "No active support agents yet"
            }
            icon={UserRoundCog}
          />
          <SummaryTile
            label="Resolved Flow"
            value={String(resolvedTickets)}
            detail="Resolved and closed conversations"
            icon={ShieldCheck}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[30px] border border-border bg-surface p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08),0_30px_70px_rgba(116,93,56,0.12)] ring-1 ring-white/65 dark:ring-white/10 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                  <Headset className="h-3.5 w-3.5" />
                  Support Operations
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading">
                  Queue overview and team routing
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
                  Review conversation pressure, spot unassigned tickets, and
                  move quickly between active requests and staffing.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isAgent ? (
                  <button
                    onClick={() => setShowCreateTicket(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Create Ticket
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {statusHighlights.map(({ key, label, Icon, count }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-border bg-surface-strong/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                      {label}
                    </span>
                    <Icon className="h-4 w-4 text-body" />
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-heading">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-surface-strong p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                  Live Snapshot
                </p>
                <h3 className="mt-2 text-xl font-semibold text-heading">
                  Routing focus
                </h3>
              </div>
              <div className="rounded-2xl border border-border bg-surface-strong p-2 text-body">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-surface-strong/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                  Latest ticket activity
                </p>
                <p className="mt-2 text-sm font-semibold text-heading">
                  {latestTicket?.subject || "No visible tickets yet"}
                </p>
                <p className="mt-1 text-sm text-body">
                  {latestTicket
                    ? `${latestTicket.ticketNumber} updated ${new Date(latestTicket.updatedAt).toLocaleString()}`
                    : "Create or unfilter tickets to populate this view."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface-strong/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                  Staffing note
                </p>
                <p className="mt-2 text-sm text-body">
                  {busiestAgent
                    ? `${busiestAgent.firstname} ${busiestAgent.lastname} currently carries ${busiestAgent.activeTickets} active ticket${busiestAgent.activeTickets === 1 ? "" : "s"}.`
                    : "No agent workload is available yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface-strong/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                  Queue balance
                </p>
                <p className="mt-2 text-sm text-body">
                  {unassignedTickets > 0
                    ? `${unassignedTickets} ticket${unassignedTickets === 1 ? "" : "s"} need assignment attention.`
                    : "All visible tickets already have an assigned owner."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-border bg-surface-strong/65 p-4 shadow-[0_18px_34px_rgba(116,93,56,0.08)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showAgentsTab={!isAgent}
            />

            {activeTab === "tickets" ? (
              <>
                <TicketFilters
                  searchTerm={searchTerm}
                  filterStatus={filterStatus}
                  onSearchChange={setSearchTerm}
                  onStatusChange={setFilterStatus}
                  ticketCount={filteredTickets.length}
                  totalCount={totalTickets}
                />

                <TicketTable
                  tickets={filteredTickets}
                  loading={loading}
                  onTicketSelect={setSelectedTicket}
                />
              </>
            ) : null}

            {!isAgent && activeTab === "agents" ? (
              <AgentsList
                agents={agents}
                tickets={tickets}
                loading={loading}
                onAddAgent={() => setShowAddAgent(true)}
                onDeleteAgent={handleDeleteAgent}
              />
            ) : null}
          </div>
        </section>
      </div>

      <CreateTicketModal
        isOpen={showCreateTicket}
        onClose={() => setShowCreateTicket(false)}
        clients={clients}
        agents={agents}
        onSubmit={handleCreateTicket}
      />

      <AddAgentModal
        isOpen={showAddAgent}
        onClose={() => setShowAddAgent(false)}
        onSubmit={handleAddAgent}
      />

      {agentPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-surface-strong p-6 shadow-[0_26px_60px_rgba(74,50,24,0.22)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-strong text-[#9a4d40] dark:text-[#cf958c]">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-heading">
                  Delete Agent
                </h3>
                <p className="text-sm text-body">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-body">
              Delete agent{" "}
              <span className="font-semibold text-heading">
                {agentPendingDelete.firstname} {agentPendingDelete.lastname}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAgentPendingDelete(null)}
                className="rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-medium text-body transition hover:bg-surface-strong"
                disabled={deleteAgent.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAgent}
                className="rounded-2xl bg-[#8b3a2f] px-4 py-2 text-sm font-medium text-heading transition hover:bg-[#742f26] disabled:opacity-50"
                disabled={deleteAgent.isPending}
              >
                {deleteAgent.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
