// frontend/src/pages/Adminpage/AdminPages/PartnerDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToastStore } from "@/Store/toast.store";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import PartnerDownlineGraph from "@/components/PartnerDownlineGraph/PartnerDownlineGraph";
import {
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  Hash,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Network,
  LayoutList,
  Receipt,
  Pencil,
  Save,
  X,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ── Interfaces ──
interface PartnerUserFull {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: string;
  country?: { name?: string; state?: string };
  createdAt?: string;
}

interface DownlineEntry {
  _id: string;
  referralCode: string;
  status: "pending" | "active" | "inactive";
  level: number;
  createdAt: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  totalEarned: number;
  totalTrades: number;
  totalVolume: number;
  maximumCommission: number | null;
  isPendingAssignment: boolean;
}

interface PartnerReferrer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode?: string | null;
}

interface PartnerDetail {
  _id: string;
  referralCode: string;
  referredBy: string | null;
  status: "pending" | "active" | "inactive";
  level: number;
  IBbalance: number;
  maximumCommission: number | null;
  isPendingAssignment: boolean;
  isRoot: boolean;
  group: { _id: string; name: string; commissionMode: CommissionMode } | null;
  createdAt: string;
  user: PartnerUserFull;
  referrer: PartnerReferrer | null;
  directDownline: DownlineEntry[];
  directReferrals: number;
  totalEarned: number;
  totalTrades: number;
  totalVolume: number;
  totalPaid: number;
  totalPending: number;
  totalConfirmed: number;
}

type CommissionMode = "waterfall" | "flat";

interface GroupOption {
  _id: string;
  name: string;
  configuration: { maximumCommission: number } | null;
  commissionMode?: CommissionMode;
}

interface TreeNodeData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  status: string;
  level: number;
  isRoot?: boolean;
  maximumCommission: number | null;
  isPendingAssignment: boolean;
  children: TreeNodeData[];
}

interface CommissionClient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Commission {
  _id: string;
  clientId: CommissionClient | null;
  clientMT5Account: string;
  commissionMode?: CommissionMode;
  level: number;
  bonusPerLot: number;
  volume: number;
  commissionAmount: number;
  symbol: string;
  profit: number;
  groupName: string;
  status: "pending" | "confirmed" | "paid";
  openTime: string;
  closeTime: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusConfig = {
  pending: { bg: "bg-surface-strong text-heading", dot: "bg-accent", label: "Pending" },
  active: { bg: "bg-[#3a6a2a] text-[#edfaed]", dot: "bg-[#8ab88a]", label: "Active" },
  inactive: { bg: "bg-[#7a3a3a] text-heading", dot: "bg-[#c47a7a]", label: "Inactive" },
  confirmed: { bg: "bg-[#3a5a7a] text-[#eaf2fa]", dot: "bg-[#7aa8c4]", label: "Confirmed" },
  paid: { bg: "bg-[#3a6a2a] text-[#edfaed]", dot: "bg-[#8ab88a]", label: "Paid" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status as keyof typeof statusConfig] || {
    bg: "bg-surface-strong text-heading",
    dot: "bg-accent",
    label: status,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatTile = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: string;
}) => (
  <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="w-3 h-3" style={{ color: accent }} />
      <span className="text-[10px] tracking-widest uppercase" style={{ color: accent }}>
        {label}
      </span>
    </div>
    <span className="text-2xl font-semibold text-heading" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {value}
    </span>
  </div>
);

const TreeNode: React.FC<{ node: TreeNodeData; depth?: number }> = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 py-2 rounded-xl hover:bg-surface-strong transition-colors"
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-body"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5 h-5 flex-shrink-0" />
        )}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-heading text-xs font-semibold"
          style={{
            background: node.isRoot
              ? "linear-gradient(135deg, #c4a055, #8a6a2a)"
              : "linear-gradient(135deg, #4a3218, #6b4a22)",
          }}
        >
          {node.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-heading truncate">{node.name}</span>
            {node.isRoot && (
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-surface text-body font-semibold">
                Root
              </span>
            )}
            <StatusBadge status={node.status} />
          </div>
          <div className="text-xs text-accent truncate">
            {node.email} · {node.referralCode || "—"}
          </div>
        </div>
        <div className="flex-shrink-0">
          {node.isPendingAssignment ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-300">
              Pending
            </span>
          ) : (
            <span className="text-xs font-medium text-[#3a6a2a] dark:text-[#9cd18a]">
              ${(node.maximumCommission ?? 0).toFixed(2)}/lot
            </span>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="border-l border-border ml-2.5">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

type TabKey = "overview" | "tree" | "commissions";

const PartnerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const queryClient = useQueryClient();
  const [commissionPage, setCommissionPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [treeView, setTreeView] = useState<"list" | "graph">("graph");

  const [editingCommission, setEditingCommission] = useState(false);
  const [commissionValue, setCommissionValue] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [savingCommission, setSavingCommission] = useState(false);

  const {
    data: partner,
    isLoading: loading,
    error: partnerError,
  } = useQuery({
    queryKey: ["adminPartnerDetail", id],
    queryFn: async () => {
      const r = await axios.get(`${API_URL}/admin/partners/${id}`, { withCredentials: true });
      return (r.data.partner as PartnerDetail) || null;
    },
    enabled: !!id,
  });

  const { data: treeData, isLoading: treeLoading, error: treeError } = useQuery({
    queryKey: ["adminPartnerTree", id],
    queryFn: async () => {
      const r = await axios.get(`${API_URL}/admin/partners/${id}/tree`, { withCredentials: true });
      return {
        tree: (r.data.treeData as TreeNodeData) || null,
        totalDownline: r.data.totalDownlinePartners || 0,
      };
    },
    enabled: !!id && activeTab === "tree",
  });
  const tree = treeData?.tree ?? null;
  const totalDownline = treeData?.totalDownline ?? 0;

  const {
    data: commissionsData,
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useQuery({
    queryKey: ["adminPartnerCommissions", id, commissionPage],
    queryFn: async () => {
      const r = await axios.get(
        `${API_URL}/admin/partners/${id}/commissions?page=${commissionPage}&limit=20`,
        { withCredentials: true },
      );
      return {
        commissions: (r.data.commissions as Commission[]) || [],
        pagination: (r.data.pagination as PaginationInfo) || { page: 1, limit: 20, total: 0, pages: 0 },
      };
    },
    enabled: !!id && activeTab === "commissions",
  });
  const commissions = commissionsData?.commissions ?? [];
  const commissionPagination: PaginationInfo =
    commissionsData?.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 };

  // Only fetched once the commission editor actually needs it (root IBs
  // pick a group); cached afterwards so reopening the editor doesn't refetch.
  const { data: groupsData, error: groupsError } = useQuery({
    queryKey: ["adminIbGroups"],
    queryFn: async () => {
      const r = await axios.get(`${API_URL}/ib-configurations/groups`, {
        withCredentials: true,
      });
      return (r.data.data as GroupOption[]) || [];
    },
    enabled: editingCommission && !!partner?.isRoot,
  });
  const groups = groupsData ?? [];

  useEffect(() => {
    if (!partnerError) return;
    const e = partnerError as any;
    addToast("error", e.message || "Failed to fetch partner details");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerError]);
  useEffect(() => {
    if (!treeError) return;
    const e = treeError as any;
    addToast("error", e.message || "Failed to fetch downline tree");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeError]);
  useEffect(() => {
    if (!commissionsError) return;
    const e = commissionsError as any;
    addToast("error", e.message || "Failed to fetch commission history");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commissionsError]);
  useEffect(() => {
    if (!groupsError) return;
    const e = groupsError as any;
    addToast("error", e.message || "Failed to load groups");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsError]);

  const openCommissionEditor = () => {
    if (!partner) return;
    setCommissionValue(partner.maximumCommission != null ? String(partner.maximumCommission) : "");
    setSelectedGroupId("");
    setEditingCommission(true);
  };

  const handleSaveCommission = async () => {
    if (!partner) return;
    const value = parseFloat(commissionValue);
    if (isNaN(value) || value < 0) {
      addToast("error", "Enter a valid non-negative commission amount");
      return;
    }
    if (partner.isRoot && !selectedGroupId) {
      addToast("error", "Select a group for this root IB");
      return;
    }

    try {
      setSavingCommission(true);
      const payload: Record<string, unknown> = { maximumCommission: value };
      if (partner.isRoot && selectedGroupId) payload.groupId = selectedGroupId;

      const r = await axios.patch(
        `${API_URL}/admin/partners/${partner._id}/commission`,
        payload,
        { withCredentials: true },
      );

      addToast("success", "Commission updated successfully");
      if (r.data.warning) {
        addToast("info", r.data.warning);
      }
      setEditingCommission(false);
      await queryClient.invalidateQueries({ queryKey: ["adminPartnerDetail", id] });
    } catch (e: any) {
      addToast("error", e.response?.data?.message || e.message || "Failed to update commission");
    } finally {
      setSavingCommission(false);
    }
  };

  const selectedGroupCeiling =
    groups.find((g) => g._id === selectedGroupId)?.configuration?.maximumCommission ?? null;

  useRealtimeSync({
    enabled: true,
    events: ["commission_updated"],
    onEvent: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartnerDetail", id] });
      if (activeTab === "commissions") {
        queryClient.invalidateQueries({ queryKey: ["adminPartnerCommissions", id] });
      }
    },
  });

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 font-['Lato',_sans-serif]"
        style={{ background: "linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)" }}
      >
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-body text-sm tracking-widest uppercase">Loading partner…</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 font-['Lato',_sans-serif]"
        style={{ background: "linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)" }}
      >
        <p className="text-body text-sm">Partner not found.</p>
        <button
          onClick={() => navigate("/admin/Partners")}
          className="px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
        >
          Back to Partners
        </button>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
    { key: "overview", label: "Overview", icon: LayoutList },
    { key: "tree", label: "Downline Tree", icon: Network },
    { key: "commissions", label: "Commission History", icon: Receipt },
  ];

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Lato',_sans-serif]"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222,204,168,0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-6">
        <button
          onClick={() => navigate("/admin/Partners")}
          className="flex items-center gap-1.5 text-sm text-body hover:text-heading transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Partners
        </button>

        {/* ══ HERO HEADER ══ */}
        <div
          className="relative overflow-hidden rounded-[30px] border border-border"
          style={{
            background:
              "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 48%, var(--surface) 100%)",
            boxShadow: "0 18px 34px rgba(116,93,56,0.08), 0 30px 70px rgba(116,93,56,0.12)",
          }}
        >
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-heading text-xl font-semibold"
                    style={{ background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))" }}
                  >
                    {partner.user.firstName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h1
                      className="text-2xl sm:text-3xl font-semibold text-heading tracking-tight"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {partner.user.firstName} {partner.user.lastName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={partner.status} />
                      <span className="text-xs text-body">Level {partner.level}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-md">
                  <div className="flex items-center gap-1.5 text-sm text-body">
                    <Mail className="w-3.5 h-3.5 text-body" /> {partner.user.email}
                  </div>
                  {partner.user.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-body">
                      <Phone className="w-3.5 h-3.5 text-body" /> {partner.user.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-body">
                    <Hash className="w-3.5 h-3.5 text-body" /> {partner.referralCode || "—"}
                  </div>
                  {partner.user.country?.name && (
                    <div className="flex items-center gap-1.5 text-sm text-body">
                      <Globe className="w-3.5 h-3.5 text-body" /> {partner.user.country.name}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface-strong/70 px-4 py-2.5 w-fit">
                  <span className="text-[10px] uppercase tracking-widest text-body">Referred By </span>
                  {partner.referrer ? (
                    <span className="text-sm text-heading font-medium">
                      {partner.referrer.firstName} {partner.referrer.lastName} ({partner.referrer.email})
                    </span>
                  ) : (
                    <span className="text-sm text-accent italic">Root partner (no referrer)</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                <StatTile label="IB Balance" value={`$${partner.IBbalance.toFixed(2)}`} icon={DollarSign} accent="#c4a055" />
                <StatTile label="Total Earned" value={`$${partner.totalEarned.toFixed(2)}`} icon={TrendingUp} accent="#3a6a2a" />
                <StatTile label="Direct Referrals" value={partner.directReferrals} icon={Users} accent="#7aa8c4" />
                <StatTile label="Total Trades" value={partner.totalTrades} icon={Receipt} accent="#8a6a2a" />
              </div>
            </div>
          </div>
        </div>

        {/* ══ COMMISSION CONTROL (Admin override) ══ */}
        {/* Only meaningful for the Waterfall Ceiling model - a Normal
            Commission group pays a fixed rate per level, so there's nothing
            to override here. We can only reliably know the mode for root
            IBs today (Sub-IBs don't carry their own groupId); Sub-IBs fall
            back to showing the panel. */}
        {partner.isRoot && partner.group?.commissionMode === "flat" ? (
          <div
            className="rounded-2xl border border-border p-5 flex items-start gap-2.5 bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
            style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)" }}
          >
            <AlertTriangle className="w-4 h-4 text-body flex-shrink-0 mt-0.5" />
            <p className="text-xs text-heading">
              <span className="font-medium text-heading">{partner.group.name}</span> uses the
              Normal Commission model - every IB at a given upline depth earns a fixed rate per
              level, configured under IB Configuration. There is no per-user ceiling to override
              here.
            </p>
          </div>
        ) : (
        <div
          className="rounded-2xl border border-border p-5 bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
          style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)" }}
        >
          {!editingCommission ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-body">
                  Maximum Commission (per lot) {partner.isRoot ? "· Root IB" : "· Sub-IB"}
                </span>
                <div className="mt-1">
                  {partner.isPendingAssignment ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pending assignment
                    </span>
                  ) : (
                    <span
                      className="text-2xl font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      ${partner.maximumCommission?.toFixed(2)}/lot
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={openCommissionEditor}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-accent transition-all"
                style={{ background: "linear-gradient(135deg, var(--surface), var(--accent-color))", color: "var(--heading)" }}
              >
                <Pencil className="w-3.5 h-3.5" />
                {partner.isPendingAssignment ? "Assign Commission" : "Change Commission"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-body block">
                {partner.isRoot ? "Assign Root IB Commission" : "Override Sub-IB Commission"}
              </span>

              {partner.isRoot && (
                <div>
                  <label className="text-xs text-body block mb-1.5">Group (sets the ceiling)</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full sm:w-72 rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent"
                  >
                    <option value="">Select a group…</option>
                    {groups
                      .filter((g) => g.configuration)
                      .map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name} — ceiling ${g.configuration?.maximumCommission.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="text-xs text-body block mb-1.5">Maximum Commission (per lot)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={selectedGroupCeiling ?? undefined}
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value)}
                      className="w-48 pl-9 pr-3 h-11 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveCommission}
                  disabled={savingCommission}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm border border-[#a0b890] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #c8ddb8, #9ab880)", color: "#1e3018" }}
                >
                  {savingCommission ? (
                    <div className="w-4 h-4 border-2 border-[#1e3018] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
                <button
                  onClick={() => setEditingCommission(false)}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>

              {selectedGroupCeiling !== null && (
                <p className="text-xs text-body">
                  Cannot exceed the group ceiling of ${selectedGroupCeiling.toFixed(2)}
                </p>
              )}
              <div className="flex items-start gap-2 text-xs text-body">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                This overrides whatever the {partner.isRoot ? "admin previously set" : "parent IB set"}. Any
                direct referral already granted more than this new value will earn $0 until rebalanced.
              </div>
            </div>
          )}
        </div>
        )}

        {/* ══ COMMISSION BREAKDOWN STRIP ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Paid Out", amount: partner.totalPaid, color: "#3a6a2a", bg: "from-[#f0f8f0] to-[#ddf0dd]", border: "#b0d8b0" },
            { label: "Confirmed (Unpaid)", amount: partner.totalConfirmed, color: "var(--body)", bg: "from-surface-strong to-surface", border: "var(--border)" },
            { label: "Pending", amount: partner.totalPending, color: "var(--status-red)", bg: "from-surface-strong to-surface-strong", border: "#e0b0b0" },
          ].map(({ label, amount, color, bg, border }) => (
            <div
              key={label}
              className={`rounded-2xl border p-4 bg-gradient-to-br ${bg}`}
              style={{ borderColor: border, boxShadow: "0 2px 12px rgba(139,100,40,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color }}>
                  {label}
                </span>
              </div>
              <div className="text-2xl font-light" style={{ color, fontFamily: "'Cormorant Garamond', serif" }}>
                ${amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* ══ TABS ══ */}
        <div
          className="rounded-2xl border border-border p-1.5 flex gap-1.5 w-fit bg-[rgba(255,252,247,0.9)] dark:bg-surface-strong"
        >
          {tabs.map((t) => {
            const TabIcon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all"
                style={
                  activeTab === t.key
                    ? { background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))", color: "var(--heading)" }
                    : { color: "var(--body)" }
                }
              >
                <TabIcon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ══ OVERVIEW TAB: direct downline ══ */}
        {activeTab === "overview" && (
          <div
            className="rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)" }}
          >
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-body">
                Direct Referrals ({partner.directDownline.length})
              </h3>
            </div>
            {partner.directDownline.length === 0 ? (
              <div className="px-6 py-16 text-center text-accent text-sm">
                This partner has not referred anyone yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)", borderBottom: "1px solid var(--border)" }}>
                      {["Partner", "Referral Code", "Status", "Max Commission", "Total Earned", "Trades", "Joined"].map((h) => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-body text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partner.directDownline.map((d) => (
                      <tr
                        key={d._id}
                        className="border-b border-border hover:bg-surface-strong transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/Partners/${d._id}`)}
                      >
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-heading">
                            {d.user.firstName} {d.user.lastName}
                          </div>
                          <div className="text-xs text-accent">{d.user.email}</div>
                        </td>
                        <td className="px-5 py-3 text-sm text-heading font-mono">{d.referralCode || "—"}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-5 py-3 text-sm">
                          {d.isPendingAssignment ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-300">
                              Pending
                            </span>
                          ) : (
                            <span className="text-heading">${(d.maximumCommission ?? 0).toFixed(2)}/lot</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#3a6a2a] dark:text-[#9cd18a] font-medium">${d.totalEarned.toFixed(2)}</td>
                        <td className="px-5 py-3 text-sm text-heading">{d.totalTrades}</td>
                        <td className="px-5 py-3 text-sm text-heading">{formatDate(d.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TREE TAB ══ */}
        {activeTab === "tree" && (
          <div
            className="rounded-2xl border border-border overflow-hidden p-5 bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-body">
                Full Downline Tree
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-accent">
                  {totalDownline} total downline partner{totalDownline !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
                  {(
                    [
                      { key: "graph" as const, label: "Graph", icon: Network },
                      { key: "list" as const, label: "List", icon: LayoutList },
                    ]
                  ).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setTreeView(key)}
                      className={`dg-toggle-btn flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                        treeView === key
                          ? "is-active bg-accent text-white shadow-sm"
                          : "text-body hover:text-accent"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {treeLoading ? (
              <div className="py-10 flex justify-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tree ? (
              treeView === "graph" ? (
                <PartnerDownlineGraph tree={tree} />
              ) : (
                <TreeNode node={tree} />
              )
            ) : (
              <div className="text-center text-sm text-accent py-10">No downline data available.</div>
            )}
          </div>
        )}

        {/* ══ COMMISSIONS TAB ══ */}
        {activeTab === "commissions" && (
          <div
            className="rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)" }}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-body">
                Commission History
              </h3>
              {commissionsLoading && (
                <div className="flex items-center gap-1.5 text-xs text-accent">
                  <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  Loading…
                </div>
              )}
            </div>
            {commissions.length === 0 && !commissionsLoading ? (
              <div className="px-6 py-16 text-center text-accent text-sm">
                No commission records for this partner yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)", borderBottom: "1px solid var(--border)" }}>
                      {["Client", "Symbol", "Level", "Volume", "$/Lot", "Mode", "Commission", "Status", "Closed"].map((h) => (
                        <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-body text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c) => (
                      <tr key={c._id} className="border-b border-border hover:bg-surface-strong transition-colors">
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-heading">
                            {c.clientId ? `${c.clientId.firstName} ${c.clientId.lastName}` : "Unknown"}
                          </div>
                          <div className="text-xs text-accent">{c.clientId?.email || c.clientMT5Account}</div>
                        </td>
                        <td className="px-5 py-3 text-sm text-heading">{c.symbol}</td>
                        <td className="px-5 py-3 text-sm text-heading">L{c.level}</td>
                        <td className="px-5 py-3 text-sm text-heading">{c.volume}</td>
                        <td className="px-5 py-3 text-sm text-heading">${c.bonusPerLot.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
                            style={
                              c.commissionMode === "flat"
                                ? { background: "#eaf3e6", color: "#3a6a2a", borderColor: "#b8d8a8" }
                                : { background: "var(--surface-strong)", color: "var(--body)", borderColor: "var(--border)" }
                            }
                          >
                            {c.commissionMode === "flat" ? "Normal" : "Sub-IB"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-[#3a6a2a] dark:text-[#9cd18a] font-medium">${c.commissionAmount.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-sm text-heading">{formatDate(c.closeTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {commissionPagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                <span className="text-sm text-body">
                  Page <span className="font-semibold text-heading">{commissionPagination.page}</span> of{" "}
                  <span className="font-semibold text-heading">{commissionPagination.pages}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCommissionPage((p) => Math.max(1, p - 1))}
                    disabled={commissionPagination.page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => setCommissionPage((p) => Math.min(commissionPagination.pages, p + 1))}
                    disabled={commissionPagination.page === commissionPagination.pages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDetailPage;
