import { useToastStore } from "@/Store/toast.store";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Paperclip,
  Search,
  Send,
  Users,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface EmailLogEntry {
  id: string;
  recipientId: string | null;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  message: string;
  status: "sent" | "failed";
  error?: string;
  batch: "single" | "all";
  sentByName: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

interface EmailLogsResponse {
  success: boolean;
  data: EmailLogEntry[];
  total: number;
  page: number;
  pages: number;
}

interface ClientEmailStat {
  clientId: string;
  name: string;
  email: string;
  single: number;
  broadcast: number;
  count: number;
}

interface EmailStatsResponse {
  success: boolean;
  total: number;
  totalSingle: number;
  totalBroadcast: number;
  perClient: ClientEmailStat[];
  clientsTotal: number;
  clientsPage: number;
  clientsPages: number;
}

interface ClientEmailLogEntry {
  _id: string;
  subject: string;
  status: "sent" | "failed";
  batch: "single" | "all";
  error?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

interface ClientEmailLogsResponse {
  success: boolean;
  single: number;
  broadcast: number;
  total: number;
  data: ClientEmailLogEntry[];
}

const EmailLogsPage = () => {
  const [search, setSearch] = useState("");
  // Only committed on form submit (matches the original behavior: typing
  // alone didn't refetch, pressing "search" did) — as its own state instead
  // of an imperative fetch call so the query key stays the single source of
  // truth and there's no stale-closure race between it and the page-reset.
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [batch, setBatch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<EmailLogEntry | null>(null);
  const limit = 20;

  const [clientSearch, setClientSearch] = useState("");
  const [debouncedClientSearch, setDebouncedClientSearch] = useState("");
  const [clientPage, setClientPage] = useState(1);
  const clientLimit = 10;
  const [selectedClient, setSelectedClient] = useState<ClientEmailStat | null>(
    null,
  );

  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const {
    data: logsResponse,
    isLoading: loading,
    error: logsError,
  } = useQuery({
    queryKey: ["adminEmailLogs", page, status, batch, submittedSearch],
    queryFn: async () => {
      const response = await axios.get<EmailLogsResponse>(
        `${VITE_BACKEND_URL}/clients/email-logs`,
        {
          params: { page, limit, search: submittedSearch, status, batch },
          withCredentials: true,
        },
      );
      if (!response.data.success) throw new Error("Failed to fetch email logs");
      return response.data;
    },
    staleTime: 15 * 1000,
  });
  const logs = logsResponse?.data ?? [];
  const pages = logsResponse?.pages ?? 1;

  useEffect(() => {
    if (!logsError) return;
    const error = logsError as any;
    if (error.response?.status === 401) {
      addToast("error", error.response?.data?.message);
      navigate("/login/admin");
    } else {
      addToast(
        "error",
        "Error fetching email logs: " + error.response?.data?.message,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsError]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedClientSearch(clientSearch), 300);
    return () => clearTimeout(timeout);
  }, [clientSearch]);

  const { data: stats } = useQuery({
    queryKey: ["adminEmailStats", clientPage, debouncedClientSearch],
    queryFn: async () => {
      const response = await axios.get<EmailStatsResponse>(
        `${VITE_BACKEND_URL}/clients/email-stats`,
        {
          params: { page: clientPage, limit: clientLimit, search: debouncedClientSearch },
          withCredentials: true,
        },
      );
      if (!response.data.success) throw new Error("Failed to fetch email stats");
      return response.data;
    },
    staleTime: 15 * 1000,
  });

  const {
    data: clientLogs,
    isLoading: loadingClientLogs,
    error: clientLogsError,
  } = useQuery({
    queryKey: ["adminClientEmailLogs", selectedClient?.clientId],
    queryFn: async () => {
      const response = await axios.get<ClientEmailLogsResponse>(
        `${VITE_BACKEND_URL}/clients/${selectedClient!.clientId}/email-logs`,
        { withCredentials: true },
      );
      if (!response.data.success) throw new Error("Failed to load client's email history");
      return response.data;
    },
    enabled: !!selectedClient,
  });

  useEffect(() => {
    if (!clientLogsError) return;
    addToast("error", "Failed to load client's email history");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientLogsError]);

  const handleClientSearchChange = (value: string) => {
    setClientSearch(value);
    setClientPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleSelectClient = (client: ClientEmailStat) => {
    setSelectedClient(client);
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ background: "linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 100%)" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface-strong border border-border flex items-center justify-center">
            <Mail className="w-5 h-5 text-body" />
          </div>
          <div>
            <h1
              className="text-2xl font-light text-heading"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              Email Logs
            </h1>
            <p className="text-xs text-body">
              Track every custom email sent to clients
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-surface-strong p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-strong border border-border flex items-center justify-center">
              <Send className="w-5 h-5 text-body" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-body">
                Total Sent
              </div>
              <div className="text-2xl font-semibold text-heading">
                {stats?.total ?? 0}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-strong p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#e8f0dc] dark:bg-surface-strong border border-[#c8ddb8] dark:border-border flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#3a6a2a] dark:text-[#9cd18a]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#4a6a2a] dark:text-[#add18a]">
                Single Emails
              </div>
              <div className="text-2xl font-semibold text-[#2a5a1a] dark:text-[#97da81]">
                {stats?.totalSingle ?? 0}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-strong p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#e8ddf4] dark:bg-surface-strong border border-[#c8a8e8] dark:border-border flex items-center justify-center">
              <Users className="w-5 h-5 text-[#5a3a8a] dark:text-[#a78ccf]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5a3a8a] dark:text-[#a78ccf]">
                Broadcast Emails
              </div>
              <div className="text-2xl font-semibold text-[#3a2360] dark:text-[#a487d3]">
                {stats?.totalBroadcast ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Per-client breakdown */}
        <div className="rounded-2xl border border-border overflow-hidden bg-surface-strong">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-heading">
              Emails Received by Client
            </h2>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent" />
              <input
                type="text"
                placeholder="Search client…"
                value={clientSearch}
                onChange={(e) => handleClientSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 h-9 rounded-lg border border-border bg-surface-strong text-heading placeholder:text-accent text-xs focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-strong border-b border-border">
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-body">
                    Client
                  </th>
                  <th className="px-5 py-3 text-right text-xs uppercase tracking-widest text-body">
                    Single
                  </th>
                  <th className="px-5 py-3 text-right text-xs uppercase tracking-widest text-body">
                    Broadcast
                  </th>
                  <th className="px-5 py-3 text-right text-xs uppercase tracking-widest text-body">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {!stats || stats.perClient.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-body">
                      No clients have received an email yet
                    </td>
                  </tr>
                ) : (
                  stats.perClient.map((c) => (
                    <tr
                      key={c.clientId}
                      onClick={() => handleSelectClient(c)}
                      className="border-b border-border last:border-0 hover:bg-surface-strong cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="text-sm text-heading font-medium">
                          {c.name || "—"}
                        </div>
                        <div className="text-xs text-accent">{c.email}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-heading">
                        {c.single}
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-heading">
                        {c.broadcast}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-heading">
                        {c.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[#ede0c0]">
            {!stats || stats.perClient.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-body">
                No clients have received an email yet
              </p>
            ) : (
              stats.perClient.map((c) => (
                <button
                  key={c.clientId}
                  onClick={() => handleSelectClient(c)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface-strong transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-heading font-medium truncate">
                      {c.name || "—"}
                    </div>
                    <div className="text-xs text-accent truncate">
                      {c.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-body">
                        Single
                      </div>
                      <div className="text-sm text-heading">{c.single}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-body">
                        Broadcast
                      </div>
                      <div className="text-sm text-heading">
                        {c.broadcast}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-body">
                        Total
                      </div>
                      <div className="text-sm font-semibold text-heading">
                        {c.count}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-4 border-t border-border">
            <span className="text-xs text-body text-center sm:text-left">
              Page {stats?.clientsPage ?? clientPage} of{" "}
              {stats?.clientsPages ?? 1} · {stats?.clientsTotal ?? 0} client
              {stats?.clientsTotal === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                disabled={clientPage === 1}
                className="w-8 h-8 rounded-lg border border-border bg-surface-strong flex items-center justify-center text-body disabled:opacity-40 hover:bg-surface transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setClientPage((p) =>
                    Math.min(stats?.clientsPages ?? 1, p + 1),
                  )
                }
                disabled={clientPage === (stats?.clientsPages ?? 1)}
                className="w-8 h-8 rounded-lg border border-border bg-surface-strong flex items-center justify-center text-body disabled:opacity-40 hover:bg-surface transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters for full log list */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
            <input
              type="text"
              placeholder="Search by email or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface-strong text-heading placeholder:text-accent text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </form>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-11 px-3 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent"
          >
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              setPage(1);
            }}
            className="h-11 px-3 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Single &amp; broadcast</option>
            <option value="single">Single</option>
            <option value="all">Broadcast</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden bg-surface-strong">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-strong border-b border-border">
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-body">
                    Recipient
                  </th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-body">
                    Subject
                  </th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-body">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-body">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-widest text-body">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-body">
                      Loading…
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-body">
                      No emails found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="border-b border-border last:border-0 hover:bg-surface-strong cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="text-sm text-heading font-medium">
                          {log.recipientName || "—"}
                        </div>
                        <div className="text-xs text-accent">
                          {log.recipientEmail}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-heading max-w-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{log.subject}</span>
                          {log.attachmentUrl && (
                            <Paperclip className="w-3 h-3 shrink-0 text-accent" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-surface text-heading capitalize">
                          {log.batch === "all" ? "Broadcast" : "Single"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            log.status === "sent"
                              ? "bg-[#5a7a5a] text-[#edfaed]"
                              : "bg-[#7a3a3a] text-heading"
                          }`}
                        >
                          {log.status === "sent" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {log.status === "sent" ? "Sent" : "Failed"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-heading">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[#ede0c0]">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-body">
                Loading…
              </p>
            ) : logs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-body">
                No emails found
              </p>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="w-full text-left px-4 py-3 space-y-2 hover:bg-surface-strong transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-heading font-medium truncate">
                        {log.recipientName || "—"}
                      </div>
                      <div className="text-xs text-accent truncate">
                        {log.recipientEmail}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                        log.status === "sent"
                          ? "bg-[#5a7a5a] text-[#edfaed]"
                          : "bg-[#7a3a3a] text-heading"
                      }`}
                    >
                      {log.status === "sent" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {log.status === "sent" ? "Sent" : "Failed"}
                    </span>
                  </div>
                  <div className="text-xs text-heading truncate flex items-center gap-1.5">
                    <span className="truncate">{log.subject}</span>
                    {log.attachmentUrl && (
                      <Paperclip className="w-3 h-3 shrink-0 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-heading capitalize">
                      {log.batch === "all" ? "Broadcast" : "Single"}
                    </span>
                    <span className="text-[10px] text-accent">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-4 border-t border-border">
            <span className="text-xs text-body text-center sm:text-left">
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-border bg-surface-strong flex items-center justify-center text-body disabled:opacity-40 hover:bg-surface transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="w-8 h-8 rounded-lg border border-border bg-surface-strong flex items-center justify-center text-body disabled:opacity-40 hover:bg-surface transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal for a single log entry */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border overflow-hidden"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-xl font-light text-heading"
                    style={{ fontFamily: "'Cormorant Garamond',serif" }}
                  >
                    {selectedLog.subject}
                  </h3>
                  <p className="text-xs text-body">
                    To: {selectedLog.recipientName} ({selectedLog.recipientEmail})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4 text-body" />
                </button>
              </div>
              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-3 text-sm text-heading whitespace-pre-wrap">
                {selectedLog.message}
              </div>
              {selectedLog.attachmentUrl && (
                <div className="rounded-xl border border-border bg-surface-strong p-3">
                  <a
                    href={normalizeAssetUrl(selectedLog.attachmentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <img
                      src={normalizeAssetUrl(selectedLog.attachmentUrl)}
                      alt={selectedLog.attachmentName || "Attachment"}
                      className="w-14 h-14 rounded-lg object-cover border border-border"
                    />
                    <span className="text-xs text-heading truncate">
                      {selectedLog.attachmentName || "View attachment"}
                    </span>
                  </a>
                </div>
              )}
              <div className="text-xs text-body space-y-1">
                <div>
                  Status:{" "}
                  <span className="font-semibold">
                    {selectedLog.status === "sent" ? "Sent" : "Failed"}
                  </span>
                  {selectedLog.error && ` — ${selectedLog.error}`}
                </div>
                <div>
                  Sent by: {selectedLog.sentByName || "—"} on{" "}
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal for a single client's email history */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border overflow-x-hidden"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-xl font-light text-heading"
                    style={{ fontFamily: "'Cormorant Garamond',serif" }}
                  >
                    {selectedClient.name || "Client"}
                  </h3>
                  <p className="text-xs text-body">
                    {selectedClient.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4 text-body" />
                </button>
              </div>

              {loadingClientLogs ? (
                <p className="text-xs text-body">Loading history…</p>
              ) : (
                clientLogs && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border bg-surface-strong p-3 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-body">
                          Single
                        </div>
                        <div className="text-lg font-semibold text-heading">
                          {clientLogs.single}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-surface-strong p-3 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-body">
                          Broadcast
                        </div>
                        <div className="text-lg font-semibold text-heading">
                          {clientLogs.broadcast}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-surface-strong p-3 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-body">
                          Total
                        </div>
                        <div className="text-lg font-semibold text-heading">
                          {clientLogs.total}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {clientLogs.data.map((log) => (
                        <div
                          key={log._id}
                          className="rounded-xl border border-border bg-surface-strong p-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm text-heading font-medium truncate flex items-center gap-1.5">
                              <span className="truncate">{log.subject}</span>
                              {log.attachmentUrl && (
                                <Paperclip className="w-3 h-3 shrink-0 text-accent" />
                              )}
                            </div>
                            <div className="text-xs text-accent">
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs px-2 py-1 rounded-full bg-surface text-heading capitalize">
                              {log.batch === "all" ? "Broadcast" : "Single"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                log.status === "sent"
                                  ? "bg-[#5a7a5a] text-[#edfaed]"
                                  : "bg-[#7a3a3a] text-heading"
                              }`}
                            >
                              {log.status === "sent" ? "Sent" : "Failed"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailLogsPage;
