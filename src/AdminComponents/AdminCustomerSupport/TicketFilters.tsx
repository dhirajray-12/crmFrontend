import { Funnel, Search, Ticket } from "lucide-react";

interface TicketFiltersProps {
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  ticketCount?: number;
  totalCount?: number;
}

export const TicketFilters = ({
  searchTerm,
  filterStatus,
  onSearchChange,
  onStatusChange,
  ticketCount = 0,
  totalCount = 0,
}: TicketFiltersProps) => (
  <div className="rounded-[26px] border border-border bg-surface-strong p-4 shadow-[0_16px_32px_rgba(116,93,56,0.07)] sm:p-5">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
          <Funnel className="h-3.5 w-3.5" />
          Filter Queue
        </div>
        <p className="mt-3 text-sm text-body">
          Showing <span className="font-semibold text-heading">{ticketCount}</span>{" "}
          of <span className="font-semibold text-heading">{totalCount}</span>{" "}
          tickets after search and status filtering.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row xl:min-w-[640px]">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by subject or ticket number"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface-strong/85 py-3 pl-11 pr-4 text-sm text-heading outline-none transition focus:border-accent focus:bg-surface-strong"
          />
        </div>

        <div className="relative min-w-[220px]">
          <Ticket className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-border bg-surface-strong/85 py-3 pl-11 pr-4 text-sm text-heading outline-none transition focus:border-accent focus:bg-surface-strong"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="inProgress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);
