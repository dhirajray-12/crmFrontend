import { useToastStore } from "@/Store/toast.store";
import DeviceSecurityPanel from "@/components/DeviceSecurity/DeviceSecurityPanel";
import ClientRiskScorePanel from "@/components/ClientRiskScore/ClientRiskScorePanel";
import ClientTimeMachinePanel from "@/components/ClientTimeMachine/ClientTimeMachinePanel";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import axios from "axios";
import {
  AlertCircle,
  Check,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Key,
  LogIn,
  Mail,
  Monitor,
  Paperclip,
  Save,
  Search,
  TrendingUp,
  UserX,
  Wallet,
  X,
  XCircle,
  Users,
  ShieldCheck,
  ShieldOff,
  BarChart2,
  Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Client {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string | { name: string; state: string };
  phone: string;
  dateofbirth: string;
  isEmailVerified: boolean;
  createdAt: string;
  status: "activated" | "suspended";
  kycVerified: boolean;
  kycStatus: "verified" | "unverified" | "rejected";
  kycRejectReason: string | null;
  ibPartner: "active" | "inactive" | "None";
  accountNumber: string;
  educationLevel: string;
  otherEducation: string;
  idDocument: string;
  address1Document: string;
  address2Document: string;
  bankDetails: {
    accountNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    ifscCode?: string;
  };
  walletDetails: {
    usdtWallet?: string;
    ethWallet?: string;
    trxWallet?: string;
    accountNumber?: string;
  };
  emailCount?: number;
}

interface MT5Account {
  _id: string;
  mt5Account: string;
  accountType: string;
  leverage: string;
  balance: number;
  equity: number;
  profitLoss: number;
}

interface FilterState {
  country: string;
  kycStatus: string;
  emailVerified: string;
  ibPartner: string;
}

interface ClientResponse {
  success: boolean;
  count: number;
  data: Client[];
}
interface PasswordResponse {
  success: boolean;
  password: string;
}
interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}
interface MT5AccountsResponse {
  success: boolean;
  data: MT5Account[];
}
interface ImpersonateResponse {
  success: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
}
interface StatusUpdateResponse {
  success: boolean;
  message: string;
}
interface ClientUpdateResponse {
  success: boolean;
  message?: string;
}
interface EmailStatsResponse {
  success: boolean;
  total: number;
  perClient: { clientId: string; count: number }[];
}
interface SendEmailResponse {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
  total?: number;
}

interface ClientsQueryData {
  clients: Client[];
  totalEmailsSent: number;
}

// Fetches the client list and folds in per-client email counts in one shot.
// The email-stats call is non-critical (Promise.allSettled) — if it fails
// we still return the client list, just without emailCount populated.
const fetchClientsData = async (): Promise<ClientsQueryData> => {
  const [clientsResult, emailStatsResult] = await Promise.allSettled([
    axios.get<ClientResponse>(`${VITE_BACKEND_URL}/clients`, {
      withCredentials: true,
      params: { limit: 10000 },
    }),
    axios.get<EmailStatsResponse>(`${VITE_BACKEND_URL}/clients/email-stats`, {
      withCredentials: true,
    }),
  ]);

  if (clientsResult.status === "rejected") {
    throw clientsResult.reason;
  }
  if (!clientsResult.value.data.success) {
    throw new Error("Failed to fetch clients");
  }

  let clients = clientsResult.value.data.data;
  let totalEmailsSent = 0;

  if (emailStatsResult.status === "fulfilled" && emailStatsResult.value.data.success) {
    totalEmailsSent = emailStatsResult.value.data.total;
    const countByClient = new Map(
      emailStatsResult.value.data.perClient.map((c) => [c.clientId, c.count]),
    );
    clients = clients.map((c) => ({
      ...c,
      emailCount: countByClient.get(c.id) || 0,
    }));
  }

  return { clients, totalEmailsSent };
};

// ── Shared field style for inputs ──
const fieldCls =
  "w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading font-['Lato',_sans-serif] focus:outline-none focus:border-accent disabled:bg-surface-strong disabled:text-body transition-colors";

// ── Status badge helper ──
const kycBadge = (s: string) => {
  if (s === "verified") return "bg-[#5a7a5a] text-[#edfaed]";
  if (s === "rejected") return "bg-[#7a3a3a] text-heading";
  return "bg-surface-strong text-heading";
};
const kycDot = (s: string) => {
  if (s === "verified") return "bg-[#8ab88a]";
  if (s === "rejected") return "bg-[#c47a7a]";
  return "bg-accent";
};

const ClientListPage = () => {
  const queryClient = useQueryClient();
  const {
    data: clientsData,
    isLoading: loading,
    error: clientsError,
  } = useQuery({
    // Not just ["clients"] — that key is already used by useSupportQueries's
    // useClients() for a differently-shaped {all, agents, clients} lookup.
    // Sharing a key across different response shapes means whichever query
    // resolves last silently clobbers the other's cache entry.
    queryKey: ["adminClientsList"],
    queryFn: fetchClientsData,
    staleTime: 30 * 1000, // list is mutated often (suspend/activate/edit) — keep it short
  });
  const clients = clientsData?.clients ?? [];
  const totalEmailsSent = clientsData?.totalEmailsSent ?? 0;
  const invalidateClients = () =>
    queryClient.invalidateQueries({ queryKey: ["adminClientsList"] });
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "personal" | "documents" | "financial" | "security" | "risk" | "timeMachine"
  >("personal");
  const [editMode, setEditMode] = useState(false);
  const [showMT5Modal, setShowMT5Modal] = useState(false);
  const [selectedClientForMT5, setSelectedClientForMT5] =
    useState<Client | null>(null);
  const [showTimeMachineModal, setShowTimeMachineModal] = useState(false);
  const [timeMachineClient, setTimeMachineClient] = useState<Client | null>(null);
  const [timeMachineSearch, setTimeMachineSearch] = useState("");
  const [mt5Accounts, setMt5Accounts] = useState<MT5Account[]>([]);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [clientPassword, setClientPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<Client | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailImage, setEmailImage] = useState<File | null>(null);
  const [emailImagePreview, setEmailImagePreview] = useState<string | null>(
    null,
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSendSummary, setEmailSendSummary] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    kycStatus: "",
    emailVerified: "",
    ibPartner: "",
  });

  const getCountryName = (
    country: string | { name: string; state: string } | undefined,
  ): string => {
    if (!country) return "";
    if (typeof country === "string") return country;
    return country.name || "";
  };
  const uniqueCountries = Array.from(
    new Set(clients.map((c) => getCountryName(c.country))),
  ).filter(Boolean);

  // Surface the query's error the same way the old manual fetch did: redirect
  // to admin login on 401, otherwise show a toast.
  useEffect(() => {
    if (!clientsError) return;
    const error = clientsError as any;
    if (error.response?.status === 401) {
      addToast("error", error.response?.data?.message);
      navigate("/login/admin");
    } else {
      addToast(
        "error",
        "Error fetching clients: " + error.response?.data?.message,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientsError]);

  const fetchClientPassword = async (clientId: string) => {
    try {
      const response = await axios.get<PasswordResponse>(
        `${VITE_BACKEND_URL}/clients/${clientId}/password`,
        { withCredentials: true },
      );
      if (response.data.success) setClientPassword(response.data.password);
    } catch {
      addToast("error", "Failed to fetch password");
    }
  };

  const updateClientPassword = async () => {
    if (!selectedClientId || !newPassword) {
      addToast("error", "Please select a client and enter a new password");
      return;
    }
    try {
      const response = await axios.put<UpdatePasswordResponse>(
        `${VITE_BACKEND_URL}/clients/${selectedClientId}/update-password`,
        { password: newPassword },
        { withCredentials: true },
      );
      if (response.data.success) {
        addToast("success", "Password updated successfully!");
        setShowPasswordModal(false);
        setNewPassword("");
        setClientPassword("");
      }
    } catch {
      addToast("error", "Failed to update password");
    }
  };

  const handleOpenEmailModal = (client: Client | null) => {
    setEmailTarget(client);
    setEmailSubject("");
    setEmailMessage("");
    setEmailSendSummary(null);
    setEmailImage(null);
    setEmailImagePreview(null);
    setShowEmailModal(true);
  };

  const handleEmailImageChange = (file: File | null) => {
    setEmailImage(file);
    setEmailImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      addToast("error", "Please enter a subject and message");
      return;
    }
    setSendingEmail(true);
    setEmailSendSummary(null);
    try {
      const endpoint = emailTarget
        ? `${VITE_BACKEND_URL}/clients/${emailTarget.id}/send-email`
        : `${VITE_BACKEND_URL}/clients/send-email/all`;
      const formData = new FormData();
      formData.append("subject", emailSubject);
      formData.append("message", emailMessage);
      if (emailImage) formData.append("image", emailImage);
      const response = await axios.post<SendEmailResponse>(
        endpoint,
        formData,
        { withCredentials: true },
      );
      if (response.data.success) {
        addToast("success", response.data.message || "Email sent");
        if (!emailTarget) {
          setEmailSendSummary({
            sent: response.data.sent || 0,
            failed: response.data.failed || 0,
            total: response.data.total || 0,
          });
        } else {
          setShowEmailModal(false);
          setEmailTarget(null);
        }
        setEmailSubject("");
        setEmailMessage("");
        handleEmailImageChange(null);
        invalidateClients();
      }
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || "Failed to send email",
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchMT5Accounts = async (userId: string) => {
    try {
      const response = await axios.get<MT5AccountsResponse>(
        `${VITE_BACKEND_URL}/clients/users/${userId}/accounts`,
        { withCredentials: true },
      );
      if (response.data.success) setMt5Accounts(response.data.data);
    } catch {
      addToast("error", "Failed to fetch MT5 accounts");
    }
  };

  const handleSuspendActivate = async (
    clientId: string,
    currentStatus: string,
  ) => {
    try {
      const endpoint =
        currentStatus === "suspended"
          ? `${VITE_BACKEND_URL}/clients/${clientId}/activate`
          : `${VITE_BACKEND_URL}/clients/${clientId}/suspend`;
      const response = await axios.put<StatusUpdateResponse>(
        endpoint,
        {},
        { withCredentials: true },
      );
      if (response.data.success) {
        addToast("success", response.data.message);
        invalidateClients();
      }
    } catch {
      addToast("error", "Failed to update client status");
    }
  };

  const handleSaveChanges = async () => {
    if (!editedClient) return;
    try {
      const updateData = {
        firstname: editedClient.firstName,
        lastname: editedClient.lastName,
        email: editedClient.email,
        isEmailVerified: editedClient.isEmailVerified,
        country: editedClient.country,
        phone: editedClient.phone,
        dateofbirth: editedClient.dateofbirth,
        ibPartner: editedClient.ibPartner,
        educationLevel: editedClient.educationLevel,
        otherEducation: editedClient.otherEducation,
        bankDetails: editedClient.bankDetails,
        walletDetails: editedClient.walletDetails,
      };
      const response = await axios.put<ClientUpdateResponse>(
        `${VITE_BACKEND_URL}/clients/${editedClient.id}`,
        updateData,
        { withCredentials: true },
      );
      if (response.data.success) {
        addToast("success", "Client updated successfully!");
        setEditMode(false);
        invalidateClients();
      }
    } catch (error: any) {
      addToast("error", error.response?.data?.message);
    }
  };

  const handleClientLogin = async (clientId: string) => {
    try {
      const response = await axios.post<ImpersonateResponse>(
        `${VITE_BACKEND_URL}/auth/admin/impersonate/${clientId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": "admin",
          },
          withCredentials: true,
        },
      );
      if (response.data.success) {
        // The impersonation session itself is carried by the httpOnly
        // auth_token_client cookie the backend just set on this response -
        // it's already valid for the new same-origin tab, so we only need
        // to hand off non-sensitive display data here.
        const clientData = response.data.user;
        localStorage.setItem(
          "impersonation_data",
          JSON.stringify({
            user: clientData,
            timestamp: Date.now(),
          }),
        );
        const newTab = window.open(
          `${window.location.origin}/client/dashboard?impersonating=true`,
          "_blank",
        );
        if (!newTab) {
          addToast(
            "info",
            "Please allow pop-ups to use impersonation feature.",
          );
          return;
        }
        addToast(
          "info",
          `✅ Logged in as ${clientData.firstName} ${clientData.lastName}`,
        );
        setTimeout(() => localStorage.removeItem("impersonation_data"), 15000);
      }
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || "Failed to impersonate client.",
      );
      if (error.response?.status === 401) window.location.href = "/login/admin";
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URL}/clients/export/excel`,
        { withCredentials: true, responseType: "blob" },
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart]),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `clients_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast("success", "Excel file downloaded!");
    } catch {
      addToast("error", "Failed to export to Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URL}/clients/export/pdf`,
        { withCredentials: true, responseType: "blob" },
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart]),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `clients_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast("success", "PDF file downloaded!");
    } catch {
      addToast("error", "Failed to export to PDF");
    }
  };

  const toggleExpand = (clientId: string) => {
    setExpandedRow(expandedRow === clientId ? null : clientId);
    setActiveTab("personal");
    setEditMode(false);
    const client = clients.find((c) => c.id === clientId);
    if (client) setEditedClient({ ...client });
  };

  const handleViewMT5 = async (client: Client) => {
    setSelectedClientForMT5(client);
    setShowMT5Modal(true);
    await fetchMT5Accounts(client.id);
  };

  const handlePasswordModal = async (clientId: string) => {
    setSelectedClientId(clientId);
    setShowPasswordModal(true);
    await fetchClientPassword(clientId);
  };


  const filteredClients = clients.filter((client) => {
    const countryName = getCountryName(client.country);
    return (
      (client.name?.toLowerCase().includes(search.toLowerCase()) ||
        client.email?.toLowerCase().includes(search.toLowerCase()) ||
        countryName?.toLowerCase().includes(search.toLowerCase())) &&
      (!filters.country || countryName === filters.country) &&
      (!filters.kycStatus || client.kycStatus === filters.kycStatus) &&
      (!filters.emailVerified ||
        (filters.emailVerified === "verified" && client.isEmailVerified) ||
        (filters.emailVerified === "unverified" && !client.isEmailVerified)) &&
      (!filters.ibPartner || client.ibPartner === filters.ibPartner)
    );
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);
  useRealtimeSync({
    onEvent: (event, data) => {
      if (event !== "cache_invalidate") return;
      const keys = data?.keys || [];
      if (
        keys.includes("clients") ||
        keys.includes("profile") ||
        keys.includes("kyc")
      )
        invalidateClients();
    },
  });

  const activeClients = clients.filter((c) => c.status === "activated").length;
  const suspendedClients = clients.filter(
    (c) => c.status === "suspended",
  ).length;
  const verifiedClients = clients.filter(
    (c) => c.kycStatus === "verified",
  ).length;

  const tabList = [
    { id: "personal" as const, label: "Personal" },
    { id: "documents" as const, label: "Documents" },
    { id: "financial" as const, label: "Financial" },
    { id: "security" as const, label: "Security" },
    { id: "risk" as const, label: "Risk Score" },
    { id: "timeMachine" as const, label: "Time Machine" },
  ];

  // ── Reusable select ──
  const ParchmentSelect = ({
    value,
    onChange,
    children,
  }: {
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading font-['Lato',_sans-serif] focus:outline-none focus:border-accent transition-colors appearance-none"
    >
      {children}
    </select>
  );

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Lato',_sans-serif]"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239, 227, 202, 0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222, 204, 168, 0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      {/* grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6">
        {/* ══ HERO HEADER ══ */}
        <div
          className="relative overflow-hidden rounded-[30px] border border-border"
          style={{
            background:
              "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 48%, var(--surface) 100%)",
            boxShadow:
              "0 18px 34px rgba(116,93,56,0.08), 0 30px 70px rgba(116,93,56,0.12)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full border border-accent opacity-8 -mr-24 -mt-24" />
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full border border-accent opacity-12 -mr-14 -mt-14" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full border border-accent opacity-8 -ml-16 -mb-16" />
            {/* decorative vertical lines */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-accent opacity-[0.06]"
                style={{ left: `${25 + i * 25}%` }}
              />
            ))}
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-px bg-surface-strong" />
                  <span
                    className="text-body text-[10px] tracking-[0.4em] uppercase font-semibold"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Administration
                  </span>
                </div>
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-heading tracking-tight leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Client
                    <span className="block italic text-body">
                    Management
                  </span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-body">
                  Search, filter, review, and operate on all client accounts
                  from one unified surface.
                </p>
              </div>

              {/* Stat tiles in header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto">
                {[
                  {
                    label: "Total",
                    value: clients.length,
                    icon: Users,
                    accent: "#c4a055",
                  },
                  {
                    label: "Active",
                    value: activeClients,
                    icon: ShieldCheck,
                    accent: "#8ab88a",
                  },
                  {
                    label: "Suspended",
                    value: suspendedClients,
                    icon: ShieldOff,
                    accent: "#c47a7a",
                  },
                  {
                    label: "KYC OK",
                    value: verifiedClients,
                    icon: Check,
                    accent: "#8ab88a",
                  },
                ].map(({ label, value, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3" style={{ color: accent }} />
                      <span
                        className="text-[10px] tracking-widest uppercase"
                        style={{ color: accent }}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      className="text-2xl font-semibold text-heading"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ TOOLBAR ══ */}
        <div
          className="rounded-[30px] border border-border overflow-visible bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
          style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)",
          }}
        >
          <div className="p-4 sm:p-5 space-y-3">
            {/* Row 1: search + buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="text"
                  placeholder="Search by name, email, or country…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface-strong text-heading placeholder:text-accent text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Time Machine btn - opens a client picker + the reconstructed
                    past-state view directly, so admins don't have to hunt for
                    it inside an expanded row's tabs. */}
                <button
                  onClick={() => {
                    setTimeMachineSearch("");
                    setTimeMachineClient(null);
                    setShowTimeMachineModal(true);
                  }}
                  className="flex items-center gap-2 h-11 px-3 sm:px-4 rounded-xl text-sm tracking-wide transition-all border border-accent"
                  style={{
                    background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                    color: "var(--heading)",
                    boxShadow: "0 2px 8px rgba(139,100,40,0.18)",
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span>Time Machine</span>
                </button>

                {/* Filter btn */}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="relative flex items-center gap-2 h-11 px-3 sm:px-4 rounded-xl text-sm tracking-wide transition-all border border-accent"
                  style={{
                    background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                    color: "var(--heading)",
                    boxShadow: "0 2px 8px rgba(139,100,40,0.18)",
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#7a3a2a] text-heading text-[9px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Export btn */}
                <div className="relative">
                  <button
                    onClick={() => setExportOpen(!exportOpen)}
                    className="flex items-center gap-2 h-11 px-3 sm:px-4 rounded-xl text-sm tracking-wide transition-all border border-[#a0b890]"
                    style={{
                      background: "linear-gradient(135deg, #c8ddb8, #9ab880)",
                      color: "#1e3018",
                      boxShadow: "0 2px 8px rgba(80,110,40,0.16)",
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {exportOpen && (
                    <div
                      className="absolute top-13 right-0 z-50 w-44 mt-1 rounded-xl border border-border p-1.5"
                      style={{
                        background: "var(--surface-strong-opaque)",
                        boxShadow: "0 8px 32px rgba(74,50,24,0.16)",
                      }}
                    >
                      {[
                        {
                          label: "Export Excel",
                          fn: handleExportExcel,
                          color: "var(--status-green)",
                        },
                        {
                          label: "Export PDF",
                          fn: handleExportPDF,
                          color: "var(--status-red)",
                        },
                      ].map(({ label, fn, color }) => (
                        <button
                          key={label}
                          onClick={() => {
                            fn();
                            setExportOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-strong transition-colors"
                          style={{ color }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email all btn */}
                <button
                  onClick={() => handleOpenEmailModal(null)}
                  className="relative flex items-center gap-2 h-11 px-4 rounded-xl text-sm tracking-wide transition-all border border-[#b0a0d0]"
                  style={{
                    background: "linear-gradient(135deg, #d8c8e8, #b8a0d4)",
                    color: "#2c1e3a",
                    boxShadow: "0 2px 8px rgba(90,60,140,0.16)",
                  }}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email All</span>
                  {totalEmailsSent > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#2c1e3a] text-[#e8d8f4] text-[10px] font-bold">
                      {totalEmailsSent} sent
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {filterOpen && (
              <div className="rounded-2xl border border-border bg-surface-strong p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-semibold text-body">
                    Filter Clients
                  </span>
                  <button
                    onClick={() =>
                      setFilters({
                        country: "",
                        kycStatus: "",
                        emailVerified: "",
                        ibPartner: "",
                      })
                    }
                    className="text-xs text-body hover:text-[#5a2a1a] dark:text-[#da9781] flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Country",
                      key: "country" as const,
                      options: [
                        { v: "", l: "All Countries" },
                        ...uniqueCountries.map((c) => ({ v: c, l: c })),
                      ],
                    },
                    {
                      label: "KYC Status",
                      key: "kycStatus" as const,
                      options: [
                        { v: "", l: "All" },
                        { v: "verified", l: "Verified" },
                        { v: "unverified", l: "Unverified" },
                        { v: "rejected", l: "Rejected" },
                      ],
                    },
                    {
                      label: "Email Status",
                      key: "emailVerified" as const,
                      options: [
                        { v: "", l: "All" },
                        { v: "verified", l: "Verified" },
                        { v: "unverified", l: "Unverified" },
                      ],
                    },
                    {
                      label: "IB Partner",
                      key: "ibPartner" as const,
                      options: [
                        { v: "", l: "All" },
                        { v: "active", l: "Active" },
                        { v: "inactive", l: "Inactive" },
                        { v: "None", l: "None" },
                      ],
                    },
                  ].map(({ label, key, options }) => (
                    <div key={key}>
                      <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                        {label}
                      </label>
                      <ParchmentSelect
                        value={filters[key]}
                        onChange={(v) => setFilters({ ...filters, [key]: v })}
                      >
                        {options.map(({ v, l }) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </ParchmentSelect>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* meta row */}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm text-body">
                <span className="font-semibold text-heading">
                  {filteredClients.length}
                </span>{" "}
                clients · page{" "}
                <span className="font-semibold text-heading">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {Math.max(1, totalPages)}
                </span>
              </span>
              <span className="text-xs text-accent">
                {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, filteredClients.length)}{" "}
                shown
              </span>
            </div>
          </div>
        </div>

        {/* ══ DESKTOP TABLE ══ */}
        <div
          className="hidden lg:block rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
          style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)", }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-sm tracking-widest uppercase">
                Loading clients…
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {[
                    "Client",
                    "Email",
                    "KYC",
                    "IB Partner",
                    "Country",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest text-body ${h === "Actions" ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-accent text-sm"
                    >
                      No clients found
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client, idx) => (
                    <React.Fragment key={client.id}>
                      <tr
                        className="border-b border-border hover:bg-surface-strong transition-colors duration-150"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-heading text-sm font-semibold"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                              }}
                            >
                              {client.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <div className="font-medium text-heading text-sm">
                                {client.name}
                              </div>
                              <div className="text-xs text-accent mt-0.5 font-mono">
                                {client.accountNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div
                            className="text-sm text-heading truncate max-w-[220px]"
                            title={client.email}
                          >
                            {client.email}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${client.isEmailVerified ? "bg-[#5a7a5a] text-[#edfaed]" : "bg-[#8a6a2a] text-[#fff8ee]"}`}
                          >
                            {client.isEmailVerified ? (
                              <Check className="w-2.5 h-2.5" />
                            ) : (
                              <AlertCircle className="w-2.5 h-2.5" />
                            )}
                            {client.isEmailVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${kycBadge(client.kycStatus)}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${kycDot(client.kycStatus)}`}
                            />
                            {client.kycStatus.charAt(0).toUpperCase() +
                              client.kycStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-heading capitalize">
                          {client.ibPartner}
                        </td>
                        <td className="px-5 py-4 text-sm text-heading">
                          {getCountryName(client.country) || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${client.status === "activated" ? "bg-[#5a7a5a] text-[#edfaed]" : "bg-[#7a3a3a] text-heading"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${client.status === "activated" ? "bg-[#8ab88a]" : "bg-[#c47a7a]"}`}
                            />
                            {client.status === "activated"
                              ? "Active"
                              : "Suspended"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              {
                                icon: Edit2,
                                fn: () => toggleExpand(client.id),
                                title: "Details",
                                active: expandedRow === client.id,
                              },
                              {
                                icon: Monitor,
                                fn: () => handleViewMT5(client),
                                title: "MT5",
                                active: false,
                              },
                              {
                                icon: LogIn,
                                fn: () => handleClientLogin(client.id),
                                title: "Login",
                                active: false,
                              },
                              {
                                icon: Key,
                                fn: () => handlePasswordModal(client.id),
                                title: "Password",
                                active: false,
                              },
                              {
                                icon: Mail,
                                fn: () => handleOpenEmailModal(client),
                                title: "Email",
                                active: false,
                              },
                              {
                                icon: UserX,
                                fn: () =>
                                  handleSuspendActivate(
                                    client.id,
                                    client.status,
                                  ),
                                title:
                                  client.status === "suspended"
                                    ? "Activate"
                                    : "Suspend",
                                active: false,
                                danger: client.status === "activated",
                              },
                            ].map(
                              ({ icon: Icon, fn, title, active, danger }) => (
                                <button
                                  key={title}
                                  onClick={fn}
                                  title={title}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                                  style={
                                    active
                                      ? {
                                          background:
                                            "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                                          borderColor: "var(--border)",
                                          color: "var(--heading)",
                                        }
                                      : danger
                                        ? {
                                            background: "var(--surface-strong)",
                                            borderColor: "#d4a090",
                                            color: "var(--status-red)",
                                          }
                                        : {
                                            background: "var(--surface-strong)",
                                            borderColor: "var(--border)",
                                            color: "var(--body)",
                                          }
                                  }
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </button>
                              ),
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded detail panel ── */}
                      {expandedRow === client.id && editedClient && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div
                              className="border-t border-b border-border p-6 sm:p-8"
                              style={{
                                background:
                                  "linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
                              }}
                            >
                              <div className="max-w-5xl mx-auto space-y-5">
                                {/* panel header */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3
                                      className="text-xl font-light text-heading"
                                      style={{
                                        fontFamily:
                                          "'Cormorant Garamond', serif",
                                      }}
                                    >
                                      {editedClient.name} — Details
                                    </h3>
                                    <p className="text-xs text-accent mt-0.5">
                                      {editedClient.email}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {editMode ? (
                                      <>
                                        <button
                                          onClick={handleSaveChanges}
                                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-[#a0c890] transition-all hover:opacity-80"
                                          style={{
                                            background:
                                              "linear-gradient(135deg, #3a6a2a, #2a5a1a)",
                                            color: "#edfaed",
                                          }}
                                        >
                                          <Save className="w-3.5 h-3.5" /> Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditMode(false);
                                            setEditedClient({ ...client });
                                          }}
                                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-border bg-surface-strong text-heading hover:bg-surface transition-all"
                                        >
                                          <X className="w-3.5 h-3.5" /> Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => setEditMode(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-border bg-surface-strong text-heading hover:bg-surface transition-all"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* tabs */}
                                <div className="flex gap-1 p-1 rounded-xl border border-border bg-surface-strong w-fit">
                                  {tabList.map(({ id, label }) => (
                                    <button
                                      key={id}
                                      onClick={() => setActiveTab(id)}
                                      className="px-4 py-2 rounded-lg text-sm transition-all"
                                      style={
                                        activeTab === id
                                          ? {
                                              background:
                                                "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                                              color: "var(--heading)",
                                              boxShadow:
                                                "0 2px 8px rgba(74,50,24,0.2)",
                                            }
                                          : { color: "var(--body)" }
                                      }
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>

                                {/* tab content */}
                                <div className="rounded-2xl border border-border bg-surface-strong p-5 sm:p-6">
                                  {activeTab === "personal" && (
                                    <div className="space-y-5">
                                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                        {[
                                          {
                                            label: "First Name",
                                            key: "firstName" as const,
                                            type: "text",
                                          },
                                          {
                                            label: "Last Name",
                                            key: "lastName" as const,
                                            type: "text",
                                          },
                                          {
                                            label: "Email",
                                            key: "email" as const,
                                            type: "email",
                                          },
                                          {
                                            label: "Phone",
                                            key: "phone" as const,
                                            type: "text",
                                          },
                                          {
                                            label: "Date of Birth",
                                            key: "dateofbirth" as const,
                                            type: "date",
                                          },
                                          {
                                            label: "Education",
                                            key: "educationLevel" as const,
                                            type: "text",
                                          },
                                        ].map(({ label, key, type }) => (
                                          <div key={key}>
                                            <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                                              {label}
                                            </label>
                                            <input
                                              type={type}
                                              value={
                                                (editedClient as any)[key] || ""
                                              }
                                              disabled={!editMode}
                                              onChange={(e) =>
                                                setEditedClient({
                                                  ...editedClient,
                                                  [key]: e.target.value,
                                                })
                                              }
                                              className={fieldCls}
                                            />
                                          </div>
                                        ))}
                                        <div>
                                          <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                                            Country
                                          </label>
                                          <input
                                            type="text"
                                            value={getCountryName(
                                              editedClient.country,
                                            )}
                                            disabled={!editMode}
                                            onChange={(e) =>
                                              setEditedClient({
                                                ...editedClient,
                                                country: e.target.value,
                                              })
                                            }
                                            className={fieldCls}
                                          />
                                        </div>
                                      </div>

                                      {/* toggle buttons */}
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-border">
                                        {/* Email verified */}
                                        <div>
                                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                                            Email Status
                                          </label>
                                          <div className="flex gap-2">
                                            {[
                                              { val: true, label: "Verified" },
                                              {
                                                val: false,
                                                label: "Unverified",
                                              },
                                            ].map(({ val, label }) => (
                                              <button
                                                key={label}
                                                disabled={!editMode}
                                                onClick={() =>
                                                  editMode &&
                                                  setEditedClient({
                                                    ...editedClient,
                                                    isEmailVerified: val,
                                                  })
                                                }
                                                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all border"
                                                style={
                                                  editedClient.isEmailVerified ===
                                                  val
                                                    ? {
                                                        background: val
                                                          ? "linear-gradient(135deg,#3a6a2a,#2a5a1a)"
                                                          : "linear-gradient(135deg,#7a5010,#5a3a00)",
                                                        color: "var(--heading)",
                                                        borderColor:
                                                          "transparent",
                                                      }
                                                    : {
                                                        borderColor: "var(--border)",
                                                        color: "var(--body)",
                                                        background: "var(--surface-strong)",
                                                        opacity: editMode
                                                          ? 1
                                                          : 0.6,
                                                      }
                                                }
                                              >
                                                {label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        {/* KYC Status */}
                                        <div>
                                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                                            KYC Status
                                          </label>
                                          <div className="flex gap-1.5">
                                            {[
                                              { val: "verified", label: "OK" },
                                              {
                                                val: "unverified",
                                                label: "Pend.",
                                              },
                                              {
                                                val: "rejected",
                                                label: "Rej.",
                                              },
                                            ].map(({ val, label }) => (
                                              <button
                                                key={val}
                                                disabled={!editMode}
                                                onClick={() =>
                                                  editMode &&
                                                  setEditedClient({
                                                    ...editedClient,
                                                    kycStatus: val as any,
                                                    kycVerified:
                                                      val === "verified",
                                                  })
                                                }
                                                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all border"
                                                style={
                                                  editedClient.kycStatus === val
                                                    ? {
                                                        background: `linear-gradient(135deg,${val === "verified" ? "#3a6a2a,#2a5a1a" : val === "rejected" ? "#7a2a2a,#5a1a1a" : "var(--surface-strong),var(--surface-strong)"})`,
                                                        color: "var(--heading)",
                                                        borderColor:
                                                          "transparent",
                                                      }
                                                    : {
                                                        borderColor: "var(--border)",
                                                        color: "var(--body)",
                                                        background: "var(--surface-strong)",
                                                        opacity: editMode
                                                          ? 1
                                                          : 0.6,
                                                      }
                                                }
                                              >
                                                {label}
                                              </button>
                                            ))}
                                          </div>
                                          {editedClient.kycStatus ===
                                            "rejected" &&
                                            editMode && (
                                              <textarea
                                                value={
                                                  editedClient.kycRejectReason ||
                                                  ""
                                                }
                                                rows={2}
                                                placeholder="Rejection reason…"
                                                onChange={(e) =>
                                                  setEditedClient({
                                                    ...editedClient,
                                                    kycRejectReason:
                                                      e.target.value,
                                                  })
                                                }
                                                className={`${fieldCls} mt-2 resize-none`}
                                              />
                                            )}
                                        </div>
                                        {/* IB Partner */}
                                        <div>
                                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                                            IB Partner
                                          </label>
                                          <div className="flex gap-1.5">
                                            {[
                                              {
                                                val: "active",
                                                label: "Active",
                                              },
                                              {
                                                val: "inactive",
                                                label: "Inactive",
                                              },
                                              { val: "None", label: "None" },
                                            ].map(({ val, label }) => (
                                              <button
                                                key={val}
                                                disabled={!editMode}
                                                onClick={() =>
                                                  editMode &&
                                                  setEditedClient({
                                                    ...editedClient,
                                                    ibPartner: val as any,
                                                  })
                                                }
                                                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all border"
                                                style={
                                                  editedClient.ibPartner === val
                                                    ? {
                                                        background:
                                                          "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                                                        color: "var(--heading)",
                                                        borderColor:
                                                          "transparent",
                                                      }
                                                    : {
                                                        borderColor: "var(--border)",
                                                        color: "var(--body)",
                                                        background: "var(--surface-strong)",
                                                        opacity: editMode
                                                          ? 1
                                                          : 0.6,
                                                      }
                                                }
                                              >
                                                {label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {activeTab === "documents" && (
                                    <div className="space-y-3">
                                      <p className="text-xs text-body mb-1">
                                        View and download client uploaded
                                        documents.
                                      </p>
                                      {[
                                        {
                                          label: "ID Proof",
                                          key: "idDocument" as const,
                                          bg: "#fdf5e0",
                                          border: "var(--border)",
                                        },
                                        {
                                          label: "KYC Selfie",
                                          key: "address1Document" as const,
                                          bg: "#f5f0f8",
                                          border: "#d8c8e8",
                                        },
                                        {
                                          label: "Address Proof",
                                          key: "address2Document" as const,
                                          bg: "#f0f8f0",
                                          border: "#c0d8b0",
                                        },
                                      ].map(({ label, key, bg, border }) => {
                                        const val = (editedClient as any)[key];
                                        return (
                                          <div
                                            key={key}
                                            className="flex items-center justify-between rounded-xl border p-4"
                                            style={{
                                              background: bg,
                                              borderColor: border,
                                            }}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-strong border border-border">
                                                <FileText className="w-4 h-4 text-body" />
                                              </div>
                                              <div>
                                                <div className="text-sm font-medium text-heading">
                                                  {label}
                                                </div>
                                                {val ? (
                                                  <div className="flex items-center gap-1 text-xs text-[#3a6a2a] dark:text-[#9cd18a] mt-0.5">
                                                    <Check className="w-3 h-3" />{" "}
                                                    Uploaded
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center gap-1 text-xs text-body mt-0.5">
                                                    <XCircle className="w-3 h-3" />{" "}
                                                    Not uploaded
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            {val && (
                                              <div className="flex gap-1.5">
                                                <a
                                                  href={normalizeAssetUrl(val, { uploadsOnly: true })}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border bg-surface-strong text-heading hover:bg-surface transition-colors"
                                                >
                                                  <Eye className="w-3 h-3" />{" "}
                                                  View
                                                </a>
                                                <a
                                                  href={normalizeAssetUrl(val, { uploadsOnly: true })}
                                                  download
                                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-[#a0c890] bg-[#edf8e8] text-[#3a6a2a] hover:bg-[#d8f0d8] transition-colors"
                                                >
                                                  <Download className="w-3 h-3" />{" "}
                                                  Download
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {activeTab === "financial" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                      {/* Bank */}
                                      <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-3">
                                          <CreditCard className="w-4 h-4 text-body" />
                                          <span className="text-xs uppercase tracking-widest font-semibold text-body">
                                            Bank Details
                                          </span>
                                        </div>
                                        {[
                                          {
                                            label: "Account No.",
                                            val: editedClient.bankDetails
                                              ?.accountNumber,
                                          },
                                          {
                                            label: "Holder",
                                            val: editedClient.bankDetails
                                              ?.accountHolderName,
                                          },
                                          {
                                            label: "Bank Name",
                                            val: editedClient.bankDetails
                                              ?.bankName,
                                          },
                                          {
                                            label: "IFSC",
                                            val: editedClient.bankDetails
                                              ?.ifscCode,
                                          },
                                        ].map(({ label, val }) => (
                                          <div
                                            key={label}
                                            className="flex justify-between items-start py-2 border-b border-border last:border-0"
                                          >
                                            <span className="text-xs text-accent">
                                              {label}
                                            </span>
                                            <span className="text-sm text-heading font-mono text-right ml-4 break-all">
                                              {val || "—"}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                      {/* Crypto */}
                                      <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Wallet className="w-4 h-4 text-body" />
                                          <span className="text-xs uppercase tracking-widest font-semibold text-body">
                                            Crypto Wallets
                                          </span>
                                        </div>
                                        {[
                                          {
                                            label: "USDT",
                                            val: editedClient.walletDetails
                                              ?.usdtWallet,
                                          },
                                          {
                                            label: "ETH",
                                            val: editedClient.walletDetails
                                              ?.ethWallet,
                                          },
                                          {
                                            label: "TRX",
                                            val: editedClient.walletDetails
                                              ?.trxWallet,
                                          },
                                          {
                                            label: "Account",
                                            val: editedClient.walletDetails
                                              ?.accountNumber,
                                          },
                                        ].map(({ label, val }) => (
                                          <div
                                            key={label}
                                            className="flex justify-between items-start py-2 border-b border-border last:border-0"
                                          >
                                            <span className="text-xs text-accent flex-shrink-0">
                                              {label}
                                            </span>
                                            <span className="text-xs text-heading font-mono text-right ml-4 break-all max-w-[70%]">
                                              {val || "—"}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {activeTab === "security" && (
                                    <DeviceSecurityPanel
                                      mode="admin"
                                      clientId={editedClient.id}
                                    />
                                  )}

                                  {activeTab === "risk" && (
                                    <ClientRiskScorePanel clientId={editedClient.id} />
                                  )}

                                  {activeTab === "timeMachine" && (
                                    <ClientTimeMachinePanel clientId={editedClient.id} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* ══ MOBILE CARDS ══ */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-xs tracking-widest uppercase">
                Loading…
              </p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div
              className="rounded-2xl border border-border p-10 text-center bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            >
              <p className="text-body text-sm">No clients found</p>
            </div>
          ) : (
            paginatedClients.map((client, idx) => (
              <div
                key={client.id}
                className="rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
                style={{
                  boxShadow: "0 2px 16px rgba(139,100,40,0.09)",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* card header */}
                <div
                  className="flex items-center justify-between p-4 border-b border-border"
                  style={{
                    background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-heading font-semibold"
                      style={{
                        background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                      }}
                    >
                      {client.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="font-semibold text-heading text-sm truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {client.name}
                      </div>
                      <div className="text-xs text-accent truncate">
                        {client.email}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${client.status === "activated" ? "bg-[#5a7a5a] text-[#edfaed]" : "bg-[#7a3a3a] text-heading"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${client.status === "activated" ? "bg-[#8ab88a]" : "bg-[#c47a7a]"}`}
                    />
                    {client.status === "activated" ? "Active" : "Suspended"}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Email",
                        value: (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${client.isEmailVerified ? "bg-[#5a7a5a] text-[#edfaed]" : "bg-[#8a6a2a] text-[#fff8ee]"}`}
                          >
                            {client.isEmailVerified ? "Verified" : "Unverified"}
                          </span>
                        ),
                      },
                      {
                        label: "KYC",
                        value: (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${kycBadge(client.kycStatus)}`}
                          >
                            {client.kycStatus.charAt(0).toUpperCase() +
                              client.kycStatus.slice(1)}
                          </span>
                        ),
                      },
                      {
                        label: "IB Partner",
                        value: (
                          <span className="text-xs text-heading capitalize">
                            {client.ibPartner}
                          </span>
                        ),
                      },
                      {
                        label: "Country",
                        value: (
                          <span className="text-xs text-heading truncate">
                            {getCountryName(client.country) || "—"}
                          </span>
                        ),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-surface-strong border border-border rounded-xl px-3 py-2"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                          {label}
                        </div>
                        {value}
                      </div>
                    ))}
                  </div>

                  {/* action row */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      {
                        icon: Edit2,
                        label: "Details",
                        fn: () => toggleExpand(client.id),
                        active: expandedRow === client.id,
                      },
                      {
                        icon: Monitor,
                        label: "MT5",
                        fn: () => handleViewMT5(client),
                        active: false,
                      },
                      {
                        icon: LogIn,
                        label: "Login",
                        fn: () => handleClientLogin(client.id),
                        active: false,
                      },
                      {
                        icon: Key,
                        label: "Password",
                        fn: () => handlePasswordModal(client.id),
                        active: false,
                      },
                      {
                        icon: Mail,
                        label: "Email",
                        fn: () => handleOpenEmailModal(client),
                        active: false,
                      },
                      {
                        icon: UserX,
                        label:
                          client.status === "suspended"
                            ? "Activate"
                            : "Suspend",
                        fn: () =>
                          handleSuspendActivate(client.id, client.status),
                        active: false,
                        danger: client.status === "activated",
                      },
                    ].map(({ icon: Icon, label, fn, active, danger }) => (
                      <button
                        key={label}
                        onClick={fn}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition-all"
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                                borderColor: "var(--border)",
                                color: "var(--heading)",
                              }
                            : danger
                              ? {
                                  background: "var(--surface-strong)",
                                  borderColor: "#d4a090",
                                  color: "var(--status-red)",
                                }
                              : {
                                  background: "var(--surface-strong)",
                                  borderColor: "var(--border)",
                                  color: "var(--body)",
                                }
                        }
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* mobile expanded */}
                  {expandedRow === client.id && editedClient && (
                    <div className="pt-3 border-t border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-body font-semibold">
                          Client Details
                        </span>
                        {editMode ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={handleSaveChanges}
                              className="px-3 py-1.5 rounded-lg text-xs text-[#edfaed] border-0 transition-all"
                              style={{
                                background:
                                  "linear-gradient(135deg,#3a6a2a,#2a5a1a)",
                              }}
                            >
                              <Save className="w-3 h-3 inline mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditMode(false);
                                setEditedClient({ ...client });
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs border border-border bg-surface-strong text-heading"
                            >
                              <X className="w-3 h-3 inline mr-1" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditMode(true)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-border bg-surface-strong text-heading"
                          >
                            <Edit2 className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                        )}
                      </div>
                      {/* mini tabs */}
                      <div className="flex gap-1 overflow-x-auto">
                        {tabList.map(({ id, label }) => (
                          <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0"
                            style={
                              activeTab === id
                                ? {
                                    background:
                                      "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                                    color: "var(--heading)",
                                  }
                                : {
                                    background: "var(--surface-strong)",
                                    color: "var(--body)",
                                    border: "1px solid var(--border)",
                                  }
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="rounded-xl border border-border bg-surface-strong p-3">
                        {activeTab === "personal" && (
                          <div className="space-y-2">
                            {[
                              {
                                label: "First Name",
                                key: "firstName" as const,
                              },
                              { label: "Last Name", key: "lastName" as const },
                              { label: "Email", key: "email" as const },
                              { label: "Phone", key: "phone" as const },
                            ].map(({ label, key }) => (
                              <div key={key}>
                                <label className="text-[10px] uppercase tracking-widest text-body block mb-1">
                                  {label}
                                </label>
                                <input
                                  type="text"
                                  value={(editedClient as any)[key] || ""}
                                  disabled={!editMode}
                                  onChange={(e) =>
                                    setEditedClient({
                                      ...editedClient,
                                      [key]: e.target.value,
                                    })
                                  }
                                  className={`${fieldCls} text-xs py-2`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {activeTab === "documents" && (
                          <div className="space-y-2">
                            {[
                              { label: "ID Proof", key: "idDocument" as const },
                              {
                                label: "KYC Selfie",
                                key: "address1Document" as const,
                              },
                              {
                                label: "Address Proof",
                                key: "address2Document" as const,
                              },
                            ].map(({ label, key }) => {
                              const val = (editedClient as any)[key];
                              return (
                                <div
                                  key={key}
                                  className="flex items-center justify-between rounded-lg border border-border bg-surface-strong p-3"
                                >
                                  <div>
                                    <div className="text-xs font-medium text-heading">
                                      {label}
                                    </div>
                                    <div className="text-[10px] text-body mt-0.5">
                                      {val ? "Uploaded" : "Not uploaded"}
                                    </div>
                                  </div>
                                  {val && (
                                    <a
                                      href={normalizeAssetUrl(val, { uploadsOnly: true })}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface-strong text-heading"
                                    >
                                      View
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {activeTab === "financial" && (
                          <div className="space-y-2">
                            {[
                              {
                                label: "Bank Account",
                                val: editedClient.bankDetails?.accountNumber,
                              },
                              {
                                label: "Bank Name",
                                val: editedClient.bankDetails?.bankName,
                              },
                              {
                                label: "USDT Wallet",
                                val: editedClient.walletDetails?.usdtWallet,
                              },
                            ].map(({ label, val }) => (
                              <div
                                key={label}
                                className="flex justify-between py-1.5 border-b border-border last:border-0"
                              >
                                <span className="text-xs text-accent">
                                  {label}
                                </span>
                                <span className="text-xs text-heading font-mono ml-2 truncate max-w-[55%] text-right">
                                  {val || "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {activeTab === "security" && (
                          <DeviceSecurityPanel
                            mode="admin"
                            clientId={editedClient.id}
                          />
                        )}
                        {activeTab === "risk" && (
                          <ClientRiskScorePanel clientId={editedClient.id} />
                        )}
                        {activeTab === "timeMachine" && (
                          <ClientTimeMachinePanel clientId={editedClient.id} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {filteredClients.length > 0 && (
          <div
            className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)", }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-body">
                Showing{" "}
                <span className="font-semibold text-heading">
                  {startIndex + 1}
                </span>
                –
                <span className="font-semibold text-heading">
                  {Math.min(startIndex + itemsPerPage, filteredClients.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {filteredClients.length}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                          className="w-9 h-9 rounded-xl text-sm transition-all"
                          style={
                            currentPage === page
                              ? {
                                  background:
                                    "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                                  color: "var(--heading)",
                                }
                              : {
                                  border: "1px solid var(--border)",
                                  color: "var(--heading)",
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
                  className="px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
              <span className="text-sm text-body hidden sm:block">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══ PASSWORD MODAL ══ */}
      {showPasswordModal && (
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
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-surface-strong border border-border flex items-center justify-center">
                    <Key className="w-5 h-5 text-body" />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-light text-heading"
                      style={{ fontFamily: "'Cormorant Garamond',serif" }}
                    >
                      Manage Password
                    </h3>
                    <p className="text-xs text-body">
                      View or update client credentials
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setClientPassword("");
                    setNewPassword("");
                    setShowPassword(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4 text-body" />
                </button>
              </div>
              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={clientPassword}
                      readOnly
                      className={`${fieldCls} pr-10 font-mono`}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-accent hover:text-body"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password…"
                    className={fieldCls}
                  />
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setClientPassword("");
                    setNewPassword("");
                    setShowPassword(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={updateClientPassword}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:opacity-85"
                  style={{
                    background: "linear-gradient(135deg,#3a6a2a,#2a5a1a)",
                    color: "#edfaed",
                  }}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EMAIL MODAL ══ */}
      {showEmailModal && (
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
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-surface-strong border border-border flex items-center justify-center">
                    <Mail className="w-5 h-5 text-body" />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-light text-heading"
                      style={{ fontFamily: "'Cormorant Garamond',serif" }}
                    >
                      {emailTarget ? "Send Email" : "Email All Clients"}
                    </h3>
                    <p className="text-xs text-body">
                      {emailTarget
                        ? `To: ${emailTarget.email}${emailTarget.emailCount ? ` · ${emailTarget.emailCount} email(s) sent previously` : ""}`
                        : "Sends to every client with an email on file"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailTarget(null);
                    setEmailSubject("");
                    setEmailMessage("");
                    setEmailSendSummary(null);
                    handleEmailImageChange(null);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4 text-body" />
                </button>
              </div>

              {emailSendSummary && (
                <div className="rounded-xl border border-[#c8ddb8] dark:border-border bg-[#f0f8e8] dark:bg-surface-strong p-4 flex items-center gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#4a6a2a] dark:text-[#add18a]">
                      Sent
                    </div>
                    <div className="text-lg font-semibold text-[#2a5a1a] dark:text-[#97da81]">
                      {emailSendSummary.sent}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#8a3a2a] dark:text-[#d99082]">
                      Failed
                    </div>
                    <div className="text-lg font-semibold text-[#8a3a2a] dark:text-[#d99082]">
                      {emailSendSummary.failed}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-heading">
                      Total
                    </div>
                    <div className="text-lg font-semibold text-heading">
                      {emailSendSummary.total}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter subject…"
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write your message…"
                    rows={6}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Attach Image (optional)
                  </label>
                  {emailImagePreview ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={emailImagePreview}
                        alt="Attachment preview"
                        className="w-16 h-16 rounded-lg object-cover border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-heading truncate">
                          {emailImage?.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEmailImageChange(null)}
                          className="text-xs text-[#8a3a2a] dark:text-[#d99082] hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 justify-center h-11 rounded-xl border border-dashed border-border bg-surface-strong text-body text-sm cursor-pointer hover:bg-surface-strong transition-colors">
                      <Paperclip className="w-4 h-4" />
                      <span>Choose an image…</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) =>
                          handleEmailImageChange(e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailTarget(null);
                    setEmailSubject("");
                    setEmailMessage("");
                    setEmailSendSummary(null);
                    handleEmailImageChange(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  {emailSendSummary ? "Close" : "Cancel"}
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:opacity-85 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg,#3a6a2a,#2a5a1a)",
                    color: "#edfaed",
                  }}
                >
                  {sendingEmail
                    ? "Sending…"
                    : emailTarget
                      ? "Send Email"
                      : "Send to All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MT5 MODAL ══ */}
      {showMT5Modal && selectedClientForMT5 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            {/* header */}
            <div
              className="sticky top-0 flex items-center justify-between p-5 sm:p-6 border-b border-border z-10"
              style={{ background: "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))" }}
            >
              <div>
                <p
                  className="text-accent text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Cinzel',serif" }}
                >
                  MT5 Accounts
                </p>
                <h3
                  className="text-xl font-light text-heading mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  {selectedClientForMT5.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowMT5Modal(false);
                  setSelectedClientForMT5(null);
                  setMt5Accounts([]);
                }}
                className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-heading hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* summary tiles */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Accounts",
                    value: mt5Accounts.length,
                    icon: BarChart2,
                    color: "var(--body)",
                  },
                  {
                    label: "Total Balance",
                    value: `$${mt5Accounts
                      .reduce((s, a) => s + (a.balance || 0), 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: DollarSign,
                    color: "#3a6a2a",
                  },
                  {
                    label: "Total Equity",
                    value: `$${mt5Accounts
                      .reduce((s, a) => s + (a.equity || 0), 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    icon: TrendingUp,
                    color: "var(--heading)",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-border bg-surface-strong p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                      <span className="truncate text-xs uppercase tracking-widest text-accent">
                        {label}
                      </span>
                    </div>
                    <div
                      className="truncate text-lg sm:text-2xl font-light"
                      title={String(value)}
                      style={{
                        color,
                        fontFamily: "'Cormorant Garamond',serif",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* accounts table */}
              <div
                className="rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
              >
                {mt5Accounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Monitor className="w-10 h-10 text-accent" />
                    <p className="text-sm text-body">
                      No MT5 accounts found
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            background:
                              "linear-gradient(90deg,var(--surface),var(--surface))",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {[
                            "Account No.",
                            "Type",
                            "Leverage",
                            "Balance",
                            "Equity",
                            "P&L",
                          ].map((h, i) => (
                            <th
                              key={h}
                              className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-body ${i > 2 ? "text-right" : "text-left"}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mt5Accounts.map((acc) => (
                          <tr
                            key={acc._id}
                            className="border-b border-border hover:bg-surface-strong transition-colors"
                          >
                            <td className="px-5 py-3.5 font-mono text-sm text-heading">
                              {acc.mt5Account}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs border border-border bg-surface-strong text-heading">
                                {acc.accountType}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-heading">
                              {acc.leverage}
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-heading text-sm">
                              ${(acc.balance || 0).toFixed(2)}
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-heading text-sm">
                              ${(acc.equity || 0).toFixed(2)}
                            </td>
                            <td
                              className="px-5 py-3.5 text-right text-sm font-semibold"
                              style={{
                                color:
                                  (acc.profitLoss || 0) >= 0
                                    ? "#3a6a2a"
                                    : "#7a2a2a",
                              }}
                            >
                              {(acc.profitLoss || 0) >= 0 ? "+" : ""}$
                              {(acc.profitLoss || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TIME MACHINE MODAL ══ */}
      {showTimeMachineModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            {/* header */}
            <div
              className="sticky top-0 flex items-center justify-between p-5 sm:p-6 border-b border-border z-10"
              style={{ background: "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))" }}
            >
              <div>
                <p
                  className="text-accent text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Cinzel',serif" }}
                >
                  Time Machine
                </p>
                <h3
                  className="text-xl font-light text-heading mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  {timeMachineClient ? timeMachineClient.name : "Pick a client"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowTimeMachineModal(false);
                  setTimeMachineClient(null);
                  setTimeMachineSearch("");
                }}
                className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-heading hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {!timeMachineClient ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search by name or email…"
                      value={timeMachineSearch}
                      onChange={(e) => setTimeMachineSearch(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface text-heading placeholder:text-accent text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-1.5">
                    {clients
                      .filter((c) => {
                        const q = timeMachineSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          c.name?.toLowerCase().includes(q) ||
                          c.email?.toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 50)
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setTimeMachineClient(c)}
                          className="w-full flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-left transition-colors hover:border-accent"
                        >
                          <span className="text-sm text-heading">{c.name}</span>
                          <span className="text-xs text-subtle">{c.email}</span>
                        </button>
                      ))}
                    {clients.length > 0 &&
                      clients.filter((c) => {
                        const q = timeMachineSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          c.name?.toLowerCase().includes(q) ||
                          c.email?.toLowerCase().includes(q)
                        );
                      }).length === 0 && (
                        <p className="py-6 text-center text-xs text-subtle">
                          No clients match "{timeMachineSearch}".
                        </p>
                      )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setTimeMachineClient(null)}
                    className="text-xs text-accent hover:underline"
                  >
                    ← Choose a different client
                  </button>
                  <ClientTimeMachinePanel clientId={timeMachineClient.id} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientListPage;
