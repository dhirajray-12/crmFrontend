import type { Ticket } from "@/types/support.types";
import {
  ArrowRight,
  Clock3,
  Loader,
  MessageSquareText,
  UserRound,
} from "lucide-react";

interface TicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  onTicketSelect: (ticket: Ticket) => void;
}

const statusStyles: Record<string, string> = {
  new: "border-[#e7d2f3] bg-[#f7ecff] text-[#7c4c9f]",
  open: "border-[#cfe1c7] bg-[#edf8e7] text-[#567d34]",
  inProgress: "border-border bg-surface-strong text-body",
  resolved: "border-[#c9ddd4] bg-[#ebf7f1] text-[#2c7a5e]",
  closed: "border-border bg-surface-strong text-body",
};

const getStatusLabel = (status: string) =>
  status === "inProgress"
    ? "In Progress"
    : status.charAt(0).toUpperCase() + status.slice(1);

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

export const TicketTable = ({
  tickets,
  loading,
  onTicketSelect,
}: TicketTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[26px] border border-border bg-surface-strong/75 py-20">
        <Loader className="h-10 w-10 animate-spin text-body" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-[26px] border border-dashed border-border bg-surface-strong px-6 py-16 text-center">
        <p className="text-lg font-semibold text-heading">No tickets found</p>
        <p className="mt-2 text-sm text-body">
          Adjust the current filters or create a new support request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-[28px] border border-border bg-surface-strong shadow-[0_18px_34px_rgba(116,93,56,0.08)] xl:block">
        <table className="w-full">
          <thead className="bg-surface-strong">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
              <th className="px-6 py-4">Ticket</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Assigned Agent</th>
              <th className="px-6 py-4">Last Activity</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket._id}
                onClick={() => onTicketSelect(ticket)}
                className="cursor-pointer border-t border-border transition hover:bg-surface-strong"
              >
                <td className="px-6 py-5">
                  <div className="font-semibold text-heading">
                    {ticket.subject}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-body">
                    {ticket.ticketNumber}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusStyles[ticket.status] || statusStyles.closed
                    }`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-body">
                  {ticket.category}
                </td>
                <td className="px-6 py-5 text-sm text-body">
                  {ticket.createdBy
                    ? `${ticket.createdBy.firstname} ${ticket.createdBy.lastname}`
                    : "Unknown"}
                </td>
                <td className="px-6 py-5 text-sm text-body">
                  {ticket.assignedTo
                    ? `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}`
                    : "Unassigned"}
                </td>
                <td className="px-6 py-5 text-sm text-body">
                  {formatDate(ticket.updatedAt)}
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-body">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 xl:hidden">
        {tickets.map((ticket) => (
          <button
            key={ticket._id}
            type="button"
            onClick={() => onTicketSelect(ticket)}
            className="rounded-[26px] border border-border bg-surface-strong p-5 text-left shadow-[0_16px_30px_rgba(116,93,56,0.07)] transition hover:-translate-y-0.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-body">
                  {ticket.ticketNumber}
                </div>
                <h4 className="mt-2 text-lg font-semibold text-heading">
                  {ticket.subject}
                </h4>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusStyles[ticket.status] || statusStyles.closed
                }`}
              >
                {getStatusLabel(ticket.status)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-body">
                <MessageSquareText className="h-4 w-4 text-body" />
                {ticket.category}
              </div>
              <div className="flex items-center gap-2 text-sm text-body">
                <UserRound className="h-4 w-4 text-body" />
                {ticket.assignedTo
                  ? `${ticket.assignedTo.firstname} ${ticket.assignedTo.lastname}`
                  : "Unassigned"}
              </div>
              <div className="flex items-center gap-2 text-sm text-body sm:col-span-2">
                <Clock3 className="h-4 w-4 text-body" />
                Updated {formatDate(ticket.updatedAt)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
