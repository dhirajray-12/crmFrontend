import { useToastStore } from "@/Store/toast.store";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import axios from "axios";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  MapPin,
  Phone,
  Search,
  Square,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Client {
  id: string;
  name: string;
  email: string;
  firstname: string;
  lastname: string;
  country: string | { name: string; state: string };
  phone: string;
  dateofbirth: string;
  createdAt: string;
  kycStatus: "verified" | "unverified" | "rejected";
  kycRejectReason: string | null;
  idDocument: string;
  address1Document: string;
  address2Document: string;
  educationLevel: string;
  accountNumber: string;
  documents?: {
    idDocument?: string;
    address1Document?: string;
    address2Document?: string;
  };
}

interface FilterState {
  status: string;
  search: string;
}
interface ClientsResponse {
  success: boolean;
  data: Client[];
}
interface UpdateKYCResponse {
  success: boolean;
  message?: string;
}
interface DocumentCheckState {
  [clientId: string]: {
    idDocument: boolean;
    address1Document: boolean;
    address2Document: boolean;
  };
}
interface DocumentPreviewState {
  url: string;
  title: string;
  clientName: string;
}

const kycStatusConfig = {
  verified: {
    bg: "bg-[#5a7a5a]",
    text: "text-[#edfaed]",
    dot: "bg-[#8ab88a]",
    label: "Verified",
    icon: CheckCircle2,
  },
  unverified: {
    bg: "bg-surface-strong",
    text: "text-heading",
    dot: "bg-accent",
    label: "Pending",
    icon: Clock,
  },
  rejected: {
    bg: "bg-[#7a3a3a]",
    text: "text-heading",
    dot: "bg-[#c47a7a]",
    label: "Rejected",
    icon: XCircle,
  },
};

const KYCVerificationPage = () => {
  const queryClient = useQueryClient();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [documentPreview, setDocumentPreview] =
    useState<DocumentPreviewState | null>(null);
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [documentChecks, setDocumentChecks] = useState<DocumentCheckState>({});
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    search: "",
  });

  const buildDocumentUrl = (rawPath?: string): string | undefined => {
    return normalizeAssetUrl(rawPath, { uploadsOnly: true });
  };

  const getDocumentUrl = (
    client: Client,
    docType: "id" | "address1" | "address2",
  ): string | undefined => {
    let rawDoc = "";
    if (docType === "id") rawDoc = client.idDocument;
    if (docType === "address1") rawDoc = client.address1Document;
    if (docType === "address2") rawDoc = client.address2Document;
    return buildDocumentUrl(rawDoc);
  };

  const hasAnyDocuments = (client: Client): boolean =>
    !!(
      getDocumentUrl(client, "id") ||
      getDocumentUrl(client, "address1") ||
      getDocumentUrl(client, "address2")
    );

  const {
    data: clients = [],
    isLoading: loading,
    error: clientsError,
  } = useQuery({
    queryKey: ["kycClients"],
    queryFn: async () => {
      // hasDocuments=true asks the backend to return every client with at
      // least one uploaded KYC document, not just the most recently
      // registered page of clients - otherwise older pending submissions
      // silently fall off this queue once the client base grows past the
      // default page size.
      const response = await axios.get<ClientsResponse>(
        `${VITE_BACKEND_URL}/clients`,
        { params: { hasDocuments: "true" }, withCredentials: true },
      );
      if (!response.data.success) throw new Error("Failed to fetch clients");
      return response.data.data.filter((client: Client) => hasAnyDocuments(client));
    },
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    if (!clientsError) return;
    const error = clientsError as any;
    if (error.response?.status === 401) {
      addToast("error", error.response?.data?.message || "Session expired.");
      navigate("/login/admin");
    } else {
      addToast("error", "Error fetching clients.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientsError]);

  const invalidateKycClients = () =>
    queryClient.invalidateQueries({ queryKey: ["kycClients"] });

  const getUploadedDocuments = (client: Client) => {
    const docs = {
      idDocument: getDocumentUrl(client, "id"),
      address1Document: getDocumentUrl(client, "address1"),
      address2Document: getDocumentUrl(client, "address2"),
    };
    return {
      idDocument: !!docs.idDocument,
      address1Document: !!docs.address1Document,
      address2Document: !!docs.address2Document,
      urls: docs,
    };
  };

  const allDocumentsChecked = (clientId: string): boolean => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return false;
    const uploaded = getUploadedDocuments(client);
    const checks = documentChecks[clientId] || {
      idDocument: false,
      address1Document: false,
      address2Document: false,
    };
    if (uploaded.idDocument && !checks.idDocument) return false;
    if (uploaded.address1Document && !checks.address1Document) return false;
    if (uploaded.address2Document && !checks.address2Document) return false;
    return (
      (uploaded.idDocument && checks.idDocument) ||
      (uploaded.address1Document && checks.address1Document) ||
      (uploaded.address2Document && checks.address2Document)
    );
  };

  const getCountryName = (
    country: string | { name: string; state: string } | undefined,
  ): string => {
    if (!country) return "";
    if (typeof country === "string") return country;
    return country.name || "";
  };

  const toggleDocumentCheck = (
    clientId: string,
    docType: "idDocument" | "address1Document" | "address2Document",
  ) => {
    setDocumentChecks((prev) => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] || {
          idDocument: false,
          address1Document: false,
          address2Document: false,
        }),
        [docType]: !prev[clientId]?.[docType],
      },
    }));
  };

  const updateKYCStatus = async (
    clientId: string,
    status: "verified" | "rejected",
    reason?: string,
  ) => {
    setActionLoading(true);
    try {
      const response = await axios.put<UpdateKYCResponse>(
        `${VITE_BACKEND_URL}/clients/${clientId}`,
        {
          kycAction: true,
          kycStatus: status,
          kycVerified: status === "verified",
          kycRejectReason: reason || null,
        },
        { withCredentials: true },
      );
      if (response.data.success) {
        addToast(
          "success",
          `KYC ${status === "verified" ? "approved" : "rejected"} successfully!`,
        );
        setShowModal(false);
        setSelectedClient(null);
        setRejectReason("");
        setDocumentChecks((prev) => {
          const n = { ...prev };
          delete n[clientId];
          return n;
        });
        invalidateKycClients();
      }
    } catch {
      addToast("error", "Failed to update KYC status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (client: Client) => {
    if (!allDocumentsChecked(client.id)) {
      addToast(
        "info",
        "Please review and check all uploaded documents before approving.",
      );
      return;
    }
    setSelectedClient(client);
    setApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedClient) return;
    await updateKYCStatus(selectedClient.id, "verified");
    setApproveDialogOpen(false);
    setSelectedClient(null);
  };

  const handleReject = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };
  const submitRejection = () => {
    if (!selectedClient) return;
    if (!rejectReason.trim()) {
      addToast("error", "Please provide a reason for rejection");
      return;
    }
    updateKYCStatus(selectedClient.id, "rejected", rejectReason);
  };

  const getDocumentKind = (url: string) => {
    const cleanUrl = url.split("?")[0].toLowerCase();
    if (cleanUrl.endsWith(".pdf")) return "pdf";
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(cleanUrl)) return "image";
    return "other";
  };

  const viewDocument = (
    url: string | undefined,
    title: string,
    clientName: string,
  ) => {
    if (!url) {
      addToast("error", "Document is not available");
      return;
    }
    setDocumentPreview({ url, title, clientName });
  };
  const downloadDocument = async (
    url: string | undefined,
    filename: string,
  ) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      addToast("error", "Failed to download document");
    }
  };

  useRealtimeSync({
    onEvent: (event, data) => {
      if (event !== "cache_invalidate") return;
      const keys = data?.keys || [];
      if (
        keys.includes("clients") ||
        keys.includes("profile") ||
        keys.includes("kyc")
      )
        invalidateKycClients();
    },
  });

  const filteredClients = clients.filter((client) => {
    const matchesStatus =
      !filters.status || client.kycStatus === filters.status;
    const matchesSearch =
      !filters.search ||
      client.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      client.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      client.accountNumber
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const stats = [
    {
      label: "Total Submissions",
      value: clients.length,
      color: "var(--heading)",
      accent: "#c4a055",
    },
    {
      label: "Pending Review",
      value: clients.filter((c) => c.kycStatus === "unverified").length,
      color: "var(--heading)",
      accent: "#d4a030",
    },
    {
      label: "Approved",
      value: clients.filter((c) => c.kycStatus === "verified").length,
      color: "var(--status-green)",
      accent: "#6a9a4a",
    },
    {
      label: "Rejected",
      value: clients.filter((c) => c.kycStatus === "rejected").length,
      color: "var(--status-red)",
      accent: "#b05a5a",
    },
  ];

  const filterOptions = [
    { value: "", label: "All Statuses" },
    { value: "unverified", label: "Pending Review" },
    { value: "verified", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const docConfigs = [
    {
      key: "idDocument" as const,
      label: "ID Proof",
      docType: "id" as const,
      accentBg: "color-mix(in srgb, #e8d090 22%, var(--surface-strong))",
      accentBorder: "color-mix(in srgb, #e8d090 45%, var(--border))",
    },
    {
      key: "address1Document" as const,
      label: "KYC Selfie",
      docType: "address1" as const,
      accentBg: "color-mix(in srgb, #d8c8e8 22%, var(--surface-strong))",
      accentBorder: "color-mix(in srgb, #d8c8e8 45%, var(--border))",
    },
    {
      key: "address2Document" as const,
      label: "Address Proof",
      docType: "address2" as const,
      accentBg: "color-mix(in srgb, #c0d8b0 22%, var(--surface-strong))",
      accentBorder: "color-mix(in srgb, #c0d8b0 45%, var(--border))",
    },
  ];

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Cormorant_Garamond',_'Georgia',_serif]"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239, 227, 202, 0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222, 204, 168, 0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      {/* Grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6">
        {/* ── Hero Header ── */}
        <div
          className="relative overflow-hidden rounded-[30px] border border-border"
          style={{
            background:
              "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 48%, var(--surface) 100%)",
            boxShadow:
              "0 18px 34px rgba(116,93,56,0.08), 0 30px 70px rgba(116,93,56,0.12)",
          }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full border border-accent opacity-10 -mr-20 -mt-20" />
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full border border-accent opacity-12 -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border border-accent opacity-8 -ml-20 -mb-20" />
            <div className="absolute top-1/2 left-1/3 w-1 h-16 bg-accent opacity-20 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/3 translate-x-8 w-1 h-10 bg-accent opacity-12 -translate-y-1/2" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <p className="text-body text-xs tracking-[0.35em] uppercase mb-3 font-['Cinzel',_serif]">
                  Administration · Identity
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-heading tracking-tight leading-tight">
                  KYC
                  <span className="block text-body italic">
                    Verification
                  </span>
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-body font-['Lato',_sans-serif]">
                  Review identity documents and manage client verification
                  status
                </p>
              </div>

              {/* Stat pills in header */}
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                {[
                  { label: "Total", val: clients.length },
                  {
                    label: "Pending",
                    val: clients.filter((c) => c.kycStatus === "unverified")
                      .length,
                  },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-border bg-surface-strong/70 px-3 py-1.5"
                  >
                    <span className="text-body text-xs font-['Lato',_sans-serif] tracking-widest uppercase">
                      {label}
                    </span>
                    <span className="text-heading text-base font-semibold font-['Cormorant_Garamond',_serif]">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ label, value, color, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-border p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-0.5 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,241,229,0.94))] dark:bg-surface-strong dark:bg-none"
              style={{
            boxShadow: "0 16px 30px rgba(141,109,60,0.08)",
              }}
            >
              <p
                className="text-xs font-['Lato',_sans-serif] uppercase tracking-widest mb-2"
                style={{ color: "var(--accent-color)" }}
              >
                {label}
              </p>
              <div className="flex items-end justify-between">
                <span
                  className="text-3xl sm:text-4xl font-light"
                  style={{
                    color,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {value}
                </span>
                <div
                  className="w-2 h-2 rounded-full mb-1.5"
                  style={{ background: accent }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div
          className="rounded-[30px] border border-border p-4 sm:p-5 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
          style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)",
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="text"
                placeholder="Search by name, email, or account number…"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface-strong text-heading placeholder:text-accent text-sm font-['Lato',_sans-serif] focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-['Lato',_sans-serif] tracking-wide transition-all border border-accent whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                  color: "var(--heading)",
                  boxShadow: "0 2px 8px rgba(139,100,40,0.2)",
                }}
              >
                <Filter className="w-4 h-4" />
                {filters.status
                  ? filterOptions.find((o) => o.value === filters.status)?.label
                  : "Filter Status"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {filterOpen && (
                <div
                  className="absolute top-13 right-0 z-50 w-52 rounded-2xl border border-border p-2 mt-1"
                  style={{
                    background: "var(--surface-strong)",
                    boxShadow: "0 8px 40px rgba(74,50,24,0.18)",
                  }}
                >
                  {filterOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setFilters({ ...filters, status: value });
                        setFilterOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] transition-colors"
                      style={
                        filters.status === value
                          ? {
                              background:
                                "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                              color: "var(--heading)",
                            }
                          : { color: "var(--heading)" }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-body font-['Lato',_sans-serif]">
              <span className="font-semibold text-heading">
                {filteredClients.length}
              </span>{" "}
              clients found
            </span>
            {filters.status || filters.search ? (
              <button
                onClick={() => setFilters({ status: "", search: "" })}
                className="text-xs text-body hover:text-[#5a2a1a] dark:text-[#da9781] font-['Lato',_sans-serif] flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Client Cards Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-sm font-['Lato',_sans-serif] tracking-widest uppercase">
                Loading submissions…
              </p>
            </div>
          ) : paginatedClients.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-5">
                <AlertTriangle className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-light text-heading mb-2 font-['Cormorant_Garamond',_serif]">
                No KYC Submissions
              </h3>
              <p className="text-sm text-body font-['Lato',_sans-serif]">
                Users who upload documents will appear here
              </p>
            </div>
          ) : (
            paginatedClients.map((client) => {
              const uploaded = getUploadedDocuments(client);
              const checks = documentChecks[client.id] || {
                idDocument: false,
                address1Document: false,
                address2Document: false,
              };
              const cfg = kycStatusConfig[client.kycStatus];
              const isAllChecked = allDocumentsChecked(client.id);

              return (
                <div
                  key={client.id}
                  className="rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
                  style={{ boxShadow: "0 2px 20px rgba(139,100,40,0.09)", }}
                >
                  {/* Card Header */}
                  <div
                    className="p-4 sm:p-5 border-b border-border"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-border"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                          }}
                        >
                          <User className="w-5 h-5 text-heading" />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="font-semibold text-heading text-base leading-tight truncate"
                            style={{
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                            }}
                          >
                            {client.name}
                          </h3>
                          <p className="text-xs text-accent font-['Lato',_sans-serif] truncate mt-0.5">
                            {client.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-['Lato',_sans-serif] tracking-wide flex-shrink-0 ${cfg.bg} ${cfg.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Client Info */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { icon: Phone, label: client.phone || "N/A" },
                        {
                          icon: MapPin,
                          label: getCountryName(client.country) || "N/A",
                        },
                        { icon: Calendar, label: client.dateofbirth || "N/A" },
                        {
                          icon: Clock,
                          label: new Date(client.createdAt).toLocaleDateString(
                            undefined,
                            { timeZone: getConfiguredTimezone() },
                          ),
                        },
                      ].map(({ icon: Icon, label }, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-surface-strong border border-border rounded-xl px-3 py-2"
                        >
                          <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <span className="text-xs text-heading font-['Lato',_sans-serif] truncate">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Rejection Reason */}
                    {client.kycStatus === "rejected" &&
                      client.kycRejectReason && (
                        <div className="rounded-xl border border-border bg-surface-strong p-3">
                          <p className="text-xs font-semibold text-[#8a3a2a] dark:text-[#d99082] mb-1 font-['Lato',_sans-serif] uppercase tracking-wider">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-[#6a2a1a] dark:text-[#da9281] font-['Lato',_sans-serif] leading-relaxed">
                            {client.kycRejectReason}
                          </p>
                        </div>
                      )}

                    {/* Documents */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-accent" />
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-body font-['Lato',_sans-serif]">
                          Documents
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {docConfigs.map(
                          ({ key, label, accentBg, accentBorder }) => {
                            if (!uploaded[key]) return null;
                            const urlKey =
                              key === "idDocument"
                                ? "idDocument"
                                : key === "address1Document"
                                  ? "address1Document"
                                  : "address2Document";
                            const isChecked = checks[key];

                            return (
                              <div
                                key={key}
                                className="rounded-xl border p-3 transition-all"
                                style={{
                                  background: accentBg,
                                  borderColor: accentBorder,
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    {client.kycStatus === "unverified" && (
                                      <button
                                        onClick={() =>
                                          toggleDocumentCheck(client.id, key)
                                        }
                                        className="transition-transform hover:scale-110"
                                      >
                                        {isChecked ? (
                                          <CheckSquare className="w-5 h-5 text-[#3a6a2a] dark:text-[#9cd18a]" />
                                        ) : (
                                          <Square className="w-5 h-5 text-accent" />
                                        )}
                                      </button>
                                    )}
                                    {client.kycStatus === "verified" && (
                                      <CheckSquare className="w-4 h-4 text-[#3a6a2a] dark:text-[#9cd18a]" />
                                    )}
                                    <span className="text-sm font-medium text-heading font-['Lato',_sans-serif]">
                                      {label}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        viewDocument(
                                          uploaded.urls[urlKey],
                                          label,
                                          client.name,
                                        )
                                      }
                                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-surface-strong hover:bg-surface transition-colors"
                                      title="View"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-heading" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        downloadDocument(
                                          uploaded.urls[urlKey],
                                          `${client.name}_${label}`,
                                        )
                                      }
                                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-surface-strong hover:bg-surface transition-colors"
                                      title="Download"
                                    >
                                      <Download className="w-3.5 h-3.5 text-heading" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Verification warning */}
                    {client.kycStatus === "unverified" && !isAllChecked && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-strong px-3 py-2.5">
                        <AlertTriangle className="w-4 h-4 text-body flex-shrink-0" />
                        <p className="text-xs text-heading font-['Lato',_sans-serif]">
                          Review and check all documents before approval
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {client.kycStatus === "unverified" && (
                      <div className="flex gap-2.5 pt-1">
                        <button
                          onClick={() => handleApprove(client)}
                          disabled={!isAllChecked}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] tracking-wide transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={
                            isAllChecked
                              ? {
                                  background:
                                    "linear-gradient(135deg, #3a6a2a, #2a5a1a)",
                                  color: "#edfaed",
                                  boxShadow: "0 2px 10px rgba(50,100,30,0.22)",
                                }
                              : { background: "var(--surface)", color: "var(--body)" }
                          }
                        >
                          <Check className="w-4 h-4" /> Approve KYC
                        </button>
                        <button
                          onClick={() => handleReject(client)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] tracking-wide transition-all hover:opacity-85 border border-border"
                          style={{ background: "var(--surface-strong)", color: "var(--status-red)" }}
                        >
                          <XCircle className="w-4 h-4" /> Reject KYC
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {filteredClients.length > 0 && (
          <div
            className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)", }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-body font-['Lato',_sans-serif]">
                Page{" "}
                <span className="font-semibold text-heading">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {totalPages}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-['Lato',_sans-serif] border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-accent text-xs px-1">…</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className="w-9 h-9 rounded-xl text-sm font-['Lato',_sans-serif] transition-all"
                          style={
                            currentPage === page
                              ? {
                                  background:
                                    "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                                  color: "var(--heading)",
                                }
                              : {
                                  border: "1px solid var(--border)",
                                  color: "var(--heading)",
                                  background: "transparent",
                                }
                          }
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-['Lato',_sans-serif] border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
              <span className="text-sm text-body font-['Lato',_sans-serif]">
                {itemsPerPage} per page
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Approve Confirmation Dialog ── */}
      {documentPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          style={{
            background: "rgba(44,31,14,0.7)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setDocumentPreview(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
            style={{
            boxShadow: "0 24px 80px rgba(44,31,14,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5"
              style={{
                background:
                  "radial-gradient(circle at top right, var(--hero-glow-1), transparent 30%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
              }}
            >
              <div className="min-w-0">
                <p className="mb-1 text-xs uppercase tracking-[0.28em] text-body font-['Cinzel',_serif]">
                  Document Preview
                </p>
                <h3 className="truncate text-xl font-semibold text-heading font-['Cormorant_Garamond',_serif]">
                  {documentPreview.title}
                </h3>
                <p className="text-sm text-body font-['Lato',_sans-serif]">
                  {documentPreview.clientName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadDocument(
                      documentPreview.url,
                      `${documentPreview.clientName}_${documentPreview.title}`,
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface-strong px-4 text-sm text-heading transition-colors hover:bg-surface font-['Lato',_sans-serif]"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => setDocumentPreview(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-strong text-body transition-colors hover:bg-surface"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex min-h-[60vh] items-center justify-center overflow-hidden rounded-[24px] border border-border bg-surface-strong">
                {getDocumentKind(documentPreview.url) === "image" && (
                  <img
                    src={documentPreview.url}
                    alt={`${documentPreview.title} for ${documentPreview.clientName}`}
                    className="max-h-[75vh] w-full object-contain"
                  />
                )}

                {getDocumentKind(documentPreview.url) === "pdf" && (
                  <iframe
                    src={documentPreview.url}
                    title={`${documentPreview.title} preview`}
                    className="h-[75vh] w-full bg-surface-strong"
                  />
                )}

                {getDocumentKind(documentPreview.url) === "other" && (
                  <div className="flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-strong">
                      <FileText className="h-6 w-6 text-body" />
                    </div>
                    <p className="text-base font-semibold text-heading font-['Cormorant_Garamond',_serif]">
                      Preview unavailable for this file type
                    </p>
                    <p className="text-sm text-body font-['Lato',_sans-serif]">
                      You can still download the document from this popup.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {approveDialogOpen && selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border overflow-hidden"
            style={{
              background: "linear-gradient(160deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl border border-[#a0c890] dark:border-border bg-[#edf8e8] dark:bg-surface-strong flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#3a6a2a] dark:text-[#9cd18a]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-heading font-['Cormorant_Garamond',_serif]">
                      Confirm Approval
                    </h3>
                    <p className="text-xs text-body font-['Lato',_sans-serif]">
                      This action will verify the client
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setApproveDialogOpen(false);
                    setSelectedClient(null);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4 text-body" />
                </button>
              </div>

              <div className="rounded-xl border border-border bg-surface-strong p-4">
                <p className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif] mb-1">
                  Client
                </p>
                <p className="text-base font-semibold text-heading font-['Cormorant_Garamond',_serif]">
                  {selectedClient.name}
                </p>
                <p className="text-sm text-body font-['Lato',_sans-serif]">
                  {selectedClient.email}
                </p>
              </div>

              <p className="text-sm text-body font-['Lato',_sans-serif] leading-relaxed">
                All documents have been reviewed. Approving will grant this
                client verified KYC status.
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setApproveDialogOpen(false);
                    setSelectedClient(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-heading border border-border hover:bg-surface transition-all font-['Lato',_sans-serif]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] transition-all hover:opacity-85 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #3a6a2a, #2a5a1a)",
                    color: "#edfaed",
                  }}
                >
                  {actionLoading ? "Approving…" : "Approve KYC"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showModal && selectedClient && (
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
              background: "linear-gradient(160deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            {/* Modal Header */}
            <div
              className="relative p-5 sm:p-6 border-b border-border"
              style={{
                background: "linear-gradient(135deg, var(--surface-strong) 0%, #5a2a1a 100%)",
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-accent opacity-10" />
              </div>
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#f0a090]" />
                  </div>
                  <div>
                    <p className="text-[#d4a090] text-xs tracking-[0.3em] uppercase font-['Cinzel',_serif]">
                      KYC Decision
                    </p>
                    <h3 className="text-xl font-light text-heading mt-1 font-['Cormorant_Garamond',_serif]">
                      Reject Submission
                    </h3>
                    <p className="text-xs text-subtle mt-1 font-['Lato',_sans-serif]">
                      Client will need to resubmit valid documents
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedClient(null);
                    setRejectReason("");
                  }}
                  className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-heading hover:bg-surface transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Client info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Client Name",
                    value: selectedClient.name,
                    bg: "#fdf8f0",
                    border: "var(--border)",
                  },
                  {
                    label: "Email Address",
                    value: selectedClient.email,
                    bg: "#fdf0e8",
                    border: "var(--border)",
                  },
                ].map(({ label, value, bg, border }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 border"
                    style={{ background: bg, borderColor: border }}
                  >
                    <p className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-heading mt-1 font-['Cormorant_Garamond',_serif] break-all">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reason textarea */}
              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest font-semibold text-body font-['Lato',_sans-serif]">
                    Reason for Rejection{" "}
                    <span className="text-[#c47a5a] normal-case tracking-normal">
                      *
                    </span>
                  </label>
                  <span className="text-xs text-accent font-['Lato',_sans-serif] bg-surface-strong px-2 py-0.5 rounded-full">
                    {rejectReason.trim().length} chars
                  </span>
                </div>
                <p className="text-xs text-body font-['Lato',_sans-serif] leading-relaxed">
                  Provide a clear explanation so the client knows what needs to
                  be corrected.
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="e.g. The ID document is not clearly visible. Please resubmit with a higher quality scan."
                  className="w-full rounded-xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading placeholder:text-accent font-['Lato',_sans-serif] resize-none focus:outline-none focus:border-[#d4a090] transition-colors"
                />
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-strong px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-body flex-shrink-0 mt-0.5" />
                <p className="text-xs text-heading font-['Lato',_sans-serif] leading-relaxed">
                  The rejection reason will be stored with this KYC record and
                  visible in the admin workflow.
                </p>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedClient(null);
                    setRejectReason("");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-heading border border-border hover:bg-surface transition-all font-['Lato',_sans-serif]"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #7a2a2a, #5a1a1a)",
                    color: "var(--heading)",
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  {actionLoading ? "Rejecting…" : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerificationPage;
