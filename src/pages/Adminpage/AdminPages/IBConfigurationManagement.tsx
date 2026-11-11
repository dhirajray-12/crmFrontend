// frontend/src/pages/Adminpage/AdminPages/IBConfigurationManagement.tsx
import { useToastStore } from "@/Store/toast.store";
import axios from "axios";
import type { ChangeEvent, FormEvent } from "react";
import React, { useEffect, useState } from "react";
import {
  Clock,
  TrendingUp,
  Save,
  Layers,
  DollarSign,
  AlertCircle,
  Search,
  UserCheck,
  ChevronDown,
  ListOrdered,
} from "lucide-react";
import { CSRF_HEADER_NAME, ensureCsrfToken } from "@/utils/csrf";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// This instance is created via axios.create(), so it does not inherit the
// CSRF interceptor installed on the default axios export by
// installCsrfProtection() in main.tsx — it needs its own copy.
api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toUpperCase();

  if (MUTATING_METHODS.has(method)) {
    const token = await ensureCsrfToken();

    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>)[CSRF_HEADER_NAME] = token;
    }
  }

  return config;
});

// ── TypeScript Interfaces ──
interface IBConfiguration {
  _id: string;
  groupId: string;
  maximumCommission: number;
  defaultTimeInSeconds: number;
  createdAt?: string;
  updatedAt?: string;
}

// Which commission calculation model a group uses.
// 'waterfall' = existing ceiling-based per-user delegation model
// 'flat' = "Normal Commission" - fixed bonus-per-lot per upline level
type CommissionMode = "waterfall" | "flat";

interface Group {
  _id: string;
  name: string;
  value: string;
  description?: string;
  configuration: IBConfiguration | null;
  commissionMode?: CommissionMode;
}

interface FlatCommissionConfiguration {
  _id: string;
  groupId: string;
  level: number;
  bonusPerLot: number;
  defaultTimeInSeconds: number;
}

const FLAT_LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

interface RootIB {
  _id: string;
  userId: { _id: string; firstName: string; lastName: string; email: string };
  maximumCommission: number | null;
  groupId?: { _id: string; name: string; value: string } | null;
  status: string;
  createdAt: string;
}

interface ClientSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface GroupsResponse {
  success: boolean;
  data: Group[];
  count?: number;
}

// ── API Functions ──
const getAllGroupsWithConfigurations = async (): Promise<GroupsResponse> => {
  const response = await api.get<GroupsResponse>("/ib-configurations/groups");
  return response.data;
};

const createIBConfiguration = async (data: any) => {
  const response = await api.post("/ib-configurations", data);
  return response.data;
};

const updateIBConfiguration = async (id: string, data: any) => {
  const response = await api.put(`/ib-configurations/${id}`, data);
  return response.data;
};

const getRootIBs = async (): Promise<{ success: boolean; data: RootIB[] }> => {
  const response = await api.get("/ib-configurations/root-ibs");
  return response.data;
};

const assignRootIBCommission = async (data: {
  userId: string;
  groupId: string;
  maximumCommission: number;
}) => {
  const response = await api.post("/ib-configurations/root/assign", data);
  return response.data;
};

const updateGroupCommissionMode = async (
  groupId: string,
  commissionMode: CommissionMode,
) => {
  const response = await api.put(`/groups/${groupId}`, { commissionMode });
  return response.data;
};

const getFlatConfigurationsByGroup = async (
  groupId: string,
): Promise<{ success: boolean; data: FlatCommissionConfiguration[] }> => {
  const response = await api.get(`/ib-configurations-flat/group/${groupId}`);
  return response.data;
};

const createFlatCommissionConfiguration = async (data: {
  groupId: string;
  level: number;
  bonusPerLot: number;
  defaultTimeInSeconds?: number;
}) => {
  const response = await api.post("/ib-configurations-flat", data);
  return response.data;
};

const updateFlatCommissionConfiguration = async (
  id: string,
  data: { bonusPerLot?: number; defaultTimeInSeconds?: number },
) => {
  const response = await api.put(`/ib-configurations-flat/${id}`, data);
  return response.data;
};

const searchClients = async (search: string): Promise<ClientSearchResult[]> => {
  if (!search.trim()) return [];
  // /admin/clients (routes/adminClientRoutes.js) ignores search/limit entirely
  // and returns every client — /clients (routes/admin/clientRoutes.js) is the
  // one with real search + pagination support.
  const response = await api.get("/clients", {
    params: { search, limit: 8 },
  });
  return response.data?.data || [];
};

// ── Shared field style ──
const fieldCls =
  "w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading font-['Lato',_sans-serif] focus:outline-none focus:border-accent disabled:bg-surface-strong disabled:text-body transition-colors";

type Tab = "ceilings" | "root-assignments";

const IBConfigurationManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("ceilings");

  const [ceilingValue, setCeilingValue] = useState<number>(0);
  const [timeValue, setTimeValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Flat ("Normal Commission") mode state
  const [modeSaving, setModeSaving] = useState(false);
  const [flatConfigs, setFlatConfigs] = useState<
    Record<number, FlatCommissionConfiguration | undefined>
  >({});
  const [flatBonusValues, setFlatBonusValues] = useState<Record<number, number>>({});
  const [flatTimeValue, setFlatTimeValue] = useState<number>(0);
  const [flatSaving, setFlatSaving] = useState(false);
  const [flatLoading, setFlatLoading] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  // Root IB assignment state
  const [rootIBs, setRootIBs] = useState<RootIB[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientSearchResult[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(
    null,
  );
  const [assignGroupId, setAssignGroupId] = useState<string>("");
  const [assignAmount, setAssignAmount] = useState<number>(0);
  const [assigning, setAssigning] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
      setCeilingValue(groups[0].configuration?.maximumCommission || 0);
      setTimeValue(groups[0].configuration?.defaultTimeInSeconds || 0);
    }
  }, [groups, selectedGroup]);

  useEffect(() => {
    if (tab === "root-assignments") {
      fetchRootIBs();
    }
  }, [tab]);

  useEffect(() => {
    if (selectedGroup?.commissionMode === "flat") {
      fetchFlatConfig(selectedGroup._id);
    }
  }, [selectedGroup?._id, selectedGroup?.commissionMode]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!clientSearch.trim()) {
        setClientResults([]);
        return;
      }
      try {
        setSearching(true);
        const results = await searchClients(clientSearch);
        setClientResults(results);
      } catch (error) {
        // silent - search is best-effort
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [clientSearch]);

  const initializeData = async (): Promise<void> => {
    try {
      setLoading(true);
      const configsResponse = await getAllGroupsWithConfigurations();
      setGroups(configsResponse.data);
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || error.message || "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupsWithConfigurations = async (): Promise<void> => {
    try {
      const response = await getAllGroupsWithConfigurations();
      setGroups(response.data);
      if (selectedGroup) {
        const updatedGroup = response.data.find(
          (g: Group) => g._id === selectedGroup._id,
        );
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
          setCeilingValue(updatedGroup.configuration?.maximumCommission || 0);
          setTimeValue(updatedGroup.configuration?.defaultTimeInSeconds || 0);
        }
      }
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch configurations",
      );
    }
  };

  const fetchRootIBs = async (): Promise<void> => {
    try {
      const response = await getRootIBs();
      setRootIBs(response.data);
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || error.message || "Failed to load root IBs",
      );
    }
  };

  const handleGroupSelect = (group: Group): void => {
    setSelectedGroup(group);
    setCeilingValue(group.configuration?.maximumCommission || 0);
    setTimeValue(group.configuration?.defaultTimeInSeconds || 0);
    setSelectorOpen(false);
  };

  const fetchFlatConfig = async (groupId: string): Promise<void> => {
    try {
      setFlatLoading(true);
      const response = await getFlatConfigurationsByGroup(groupId);
      const byLevel: Record<number, FlatCommissionConfiguration | undefined> = {};
      const bonusByLevel: Record<number, number> = {};
      let holdTime = 0;
      for (const config of response.data) {
        byLevel[config.level] = config;
        bonusByLevel[config.level] = config.bonusPerLot;
        holdTime = config.defaultTimeInSeconds || holdTime;
      }
      setFlatConfigs(byLevel);
      setFlatBonusValues(bonusByLevel);
      setFlatTimeValue(holdTime);
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load Normal Commission levels",
      );
    } finally {
      setFlatLoading(false);
    }
  };

  const handleToggleCommissionMode = async (mode: CommissionMode): Promise<void> => {
    if (!selectedGroup || selectedGroup.commissionMode === mode) return;
    try {
      setModeSaving(true);
      await updateGroupCommissionMode(selectedGroup._id, mode);
      addToast(
        "success",
        `Switched ${selectedGroup.name} to ${mode === "flat" ? "Normal Commission" : "Sub-IB"} mode`,
      );
      const updatedGroup = { ...selectedGroup, commissionMode: mode };
      setSelectedGroup(updatedGroup);
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)),
      );
      if (mode === "flat") {
        await fetchFlatConfig(updatedGroup._id);
      }
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || error.message || "Failed to switch mode",
      );
    } finally {
      setModeSaving(false);
    }
  };

  const handleSaveFlatConfig = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      setFlatSaving(true);
      await Promise.all(
        FLAT_LEVELS.map((level) => {
          const bonusPerLot = flatBonusValues[level] || 0;
          const existing = flatConfigs[level];
          if (existing) {
            return updateFlatCommissionConfiguration(existing._id, {
              bonusPerLot,
              defaultTimeInSeconds: flatTimeValue,
            });
          }
          // Level 1 is always persisted (even with bonusPerLot 0) so the
          // holding time has a guaranteed row to live in — otherwise, if no
          // level has a rate configured yet, the holding time would never
          // actually get saved anywhere.
          if (bonusPerLot > 0 || level === 1) {
            return createFlatCommissionConfiguration({
              groupId: selectedGroup._id,
              level,
              bonusPerLot,
              defaultTimeInSeconds: flatTimeValue,
            });
          }
          return Promise.resolve();
        }),
      );
      addToast("success", "Normal Commission levels saved successfully");
      await fetchFlatConfig(selectedGroup._id);
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to save Normal Commission levels",
      );
    } finally {
      setFlatSaving(false);
    }
  };

  const handleSaveCeiling = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      setSaving(true);
      if (selectedGroup.configuration) {
        await updateIBConfiguration(selectedGroup.configuration._id, {
          maximumCommission: ceilingValue,
          defaultTimeInSeconds: timeValue,
        });
      } else {
        await createIBConfiguration({
          groupId: selectedGroup._id,
          maximumCommission: ceilingValue,
          defaultTimeInSeconds: timeValue,
        });
      }
      addToast("success", "Commission ceiling saved successfully");
      await fetchGroupsWithConfigurations();
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || error.message || "Failed to save ceiling",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSelectClient = (client: ClientSearchResult): void => {
    setSelectedClient(client);
    setClientSearch(`${client.firstName} ${client.lastName} (${client.email})`);
    setClientResults([]);
  };

  const handleAssignGroupChange = (groupId: string): void => {
    setAssignGroupId(groupId);
    const group = groups.find((g) => g._id === groupId);
    setAssignAmount(group?.configuration?.maximumCommission || 0);
  };

  const handleActivatePendingRootIB = (ib: RootIB): void => {
    const client: ClientSearchResult = {
      _id: ib.userId._id,
      firstName: ib.userId.firstName,
      lastName: ib.userId.lastName,
      email: ib.userId.email,
    };
    handleSelectClient(client);
    if (ib.groupId?._id) {
      handleAssignGroupChange(ib.groupId._id);
    } else {
      setAssignGroupId("");
      setAssignAmount(0);
    }
    document
      .getElementById("root-ib-assign-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAssignRootIB = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedClient || !assignGroupId) {
      addToast("error", "Select a client and a group first");
      return;
    }
    try {
      setAssigning(true);
      await assignRootIBCommission({
        userId: selectedClient._id,
        groupId: assignGroupId,
        maximumCommission: assignAmount,
      });
      addToast("success", "Root IB commission assigned successfully");
      setSelectedClient(null);
      setClientSearch("");
      setAssignGroupId("");
      setAssignAmount(0);
      await fetchRootIBs();
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || error.message || "Failed to assign root IB",
      );
    } finally {
      setAssigning(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);
    return parts.join(" ") || "0s";
  };

  const assignGroupCeiling =
    groups.find((g) => g._id === assignGroupId)?.configuration?.maximumCommission ??
    null;

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 font-['Lato',_sans-serif]"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)",
        }}
      >
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-body text-sm tracking-widest uppercase">
          Loading configurations…
        </p>
      </div>
    );
  }

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
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-6">
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
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-px bg-surface-strong" />
              <span
                className="text-body text-[10px] tracking-[0.4em] uppercase font-semibold"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Configuration
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-heading tracking-tight leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Sub-IB Commission
              <span className="block italic text-body">Management</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-body">
              Set the maximum commission ceiling per lot for each account group, then
              assign it to the top-level (root) Introducing Broker for that group.
              Every IB decides how much of their own maximum to pass down to their
              direct referrals.
            </p>

            {/* Tabs */}
            <div className="mt-6 flex gap-2">
              {[
                { key: "ceilings", label: "Group Ceilings", icon: TrendingUp },
                { key: "root-assignments", label: "Root IB Assignments", icon: UserCheck },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as Tab)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={
                    tab === key
                      ? {
                          background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                          color: "var(--heading)",
                          borderColor: "var(--border)",
                        }
                      : {
                          background: "var(--surface-strong)",
                          color: "var(--heading)",
                          borderColor: "var(--border)",
                        }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === "ceilings" ? (
          <div
            className="rounded-[30px] border border-border overflow-visible bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
            style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)",
            }}
          >
            <div className="p-5 sm:p-6 space-y-5">
              <div
                className={
                  (selectedGroup?.commissionMode || "waterfall") === "flat"
                    ? "grid sm:grid-cols-2 gap-4"
                    : ""
                }
              >
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Account Type / Group
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setSelectorOpen(!selectorOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-surface-strong text-left transition-all hover:border-accent"
                    >
                      <span
                        className="text-sm font-semibold text-heading"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {selectedGroup?.name || "Select account type"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-accent transition-transform ${selectorOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {selectorOpen && (
                      <div
                        className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-border overflow-hidden max-h-72 overflow-y-auto"
                        style={{
                          background: "var(--surface-strong)",
                          boxShadow: "0 8px 32px rgba(74,50,24,0.16)",
                        }}
                      >
                        {groups.map((group) => (
                          <button
                            key={group._id}
                            onClick={() => handleGroupSelect(group)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-surface-strong transition-colors border-b border-border last:border-0"
                            style={{
                              color:
                                selectedGroup?._id === group._id
                                  ? "#4a3218"
                                  : "#5a4020",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{group.name}</span>
                              <span className="text-xs text-accent">
                                {group.configuration?.maximumCommission != null
                                  ? `$${group.configuration.maximumCommission.toFixed(2)}/lot`
                                  : "Not set"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {(selectedGroup?.commissionMode || "waterfall") === "flat" && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-body block mb-2">
                      Default Holding Time (seconds)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <input
                        type="number"
                        min="0"
                        value={flatTimeValue}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setFlatTimeValue(parseInt(e.target.value) || 0)
                        }
                        className="w-full pl-9 pr-16 h-11 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent font-medium">
                        sec
                      </span>
                    </div>
                    {flatTimeValue > 0 && (
                      <p className="text-xs text-body mt-1.5">
                        Applies as:{" "}
                        <span className="font-semibold text-heading">
                          {formatTime(flatTimeValue)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedGroup && (
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Commission Model
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        { key: "waterfall", label: "Sub-IB" },
                        { key: "flat", label: "Normal Commission" },
                      ] as { key: CommissionMode; label: string }[]
                    ).map(({ key, label }) => {
                      const active = (selectedGroup.commissionMode || "waterfall") === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={modeSaving}
                          onClick={() => handleToggleCommissionMode(key)}
                          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border disabled:opacity-50"
                          style={
                            active
                              ? {
                                  background: "linear-gradient(135deg, var(--accent-color), var(--accent-hover))",
                                  color: "var(--accent-foreground)",
                                  borderColor: "var(--accent-color)",
                                  boxShadow: "0 8px 18px var(--accent-glow)",
                                }
                              : {
                                  background: "var(--surface-strong)",
                                  color: "var(--body)",
                                  borderColor: "var(--border)",
                                }
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(selectedGroup?.commissionMode || "waterfall") === "flat" ? (
                <form onSubmit={handleSaveFlatConfig} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-body block mb-2">
                      Bonus Per Lot, by Upline Level
                    </label>
                    <div className="rounded-xl border border-border overflow-hidden">
                      {flatLoading ? (
                        <p className="text-sm text-accent px-4 py-6 text-center">
                          Loading levels…
                        </p>
                      ) : (
                        <div className="divide-y divide-[#ede0c0] max-h-80 overflow-y-auto">
                          {FLAT_LEVELS.map((level) => (
                            <div
                              key={level}
                              className="flex items-center justify-between gap-3 px-4 py-2.5"
                            >
                              <span className="text-sm text-heading flex items-center gap-2">
                                <ListOrdered className="w-3.5 h-3.5 text-accent" />
                                Level {level}
                              </span>
                              <div className="relative w-40">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent" />
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={flatBonusValues[level] ?? 0}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setFlatBonusValues((prev) => ({
                                      ...prev,
                                      [level]: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  className="w-full pl-7 pr-3 h-9 rounded-lg border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent transition-colors"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-border bg-surface-strong">
                    <AlertCircle className="w-4 h-4 text-body flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-heading">
                      Every IB at a given upline depth earns exactly this bonus per lot —
                      no ceiling, no delegation. Root IB Assignments and per-partner
                      overrides don't apply to groups in this mode.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={flatSaving || !selectedGroup}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm tracking-wide transition-all border border-accent disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                      color: "var(--heading)",
                      boxShadow: "0 2px 8px rgba(139,100,40,0.18)",
                    }}
                  >
                    {flatSaving ? (
                      <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {flatSaving ? "Saving…" : "Save Normal Commission Levels"}
                  </button>
                </form>
              ) : (
              <form onSubmit={handleSaveCeiling} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Maximum Commission (per lot)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ceilingValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCeilingValue(parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-9 pr-16 h-11 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent font-medium">
                      per lot
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Default Holding Time (seconds)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                      type="number"
                      min="0"
                      value={timeValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setTimeValue(parseInt(e.target.value) || 0)
                      }
                      className="w-full pl-9 pr-16 h-11 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent font-medium">
                      sec
                    </span>
                  </div>
                  {timeValue > 0 && (
                    <p className="text-xs text-body mt-1.5">
                      Applies as:{" "}
                      <span className="font-semibold text-heading">
                        {formatTime(timeValue)}
                      </span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 flex items-start gap-2.5 p-3.5 rounded-xl border border-border bg-surface-strong">
                  <AlertCircle className="w-4 h-4 text-body flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-heading">
                    No root IB assigned to this group may be granted more than this
                    ceiling. Existing IBs are not retroactively changed when you update
                    it.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving || !selectedGroup}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm tracking-wide transition-all border border-accent disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                      color: "var(--heading)",
                      boxShadow: "0 2px 8px rgba(139,100,40,0.18)",
                    }}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving…" : "Save Ceiling"}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Assignment form */}
            <div
              className="rounded-[30px] border border-border p-5 sm:p-6 space-y-5 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
              style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)",
              }}
            >
              <h2
                className="text-lg font-semibold text-heading"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Assign Root IB Commission
              </h2>
              <p className="text-xs text-accent -mt-3">
                Only groups on the Sub-IB model are listed — Normal Commission
                groups pay a fixed rate per level and have nothing to assign here.
              </p>

              <form id="root-ib-assign-form" onSubmit={handleAssignRootIB} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Client
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setSelectedClient(null);
                      }}
                      placeholder="Search by name or email…"
                      className="w-full pl-9 pr-3 h-11 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                  {searching && (
                    <p className="text-xs text-accent mt-1">Searching…</p>
                  )}
                  {clientResults.length > 0 && (
                    <div className="mt-1.5 rounded-xl border border-border bg-surface-strong overflow-hidden max-h-48 overflow-y-auto">
                      {clientResults.map((client) => (
                        <button
                          type="button"
                          key={client._id}
                          onClick={() => handleSelectClient(client)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-strong border-b border-border last:border-0"
                        >
                          <span className="font-medium text-heading">
                            {client.firstName} {client.lastName}
                          </span>
                          <span className="text-xs text-accent block">
                            {client.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Group
                  </label>
                  <select
                    value={assignGroupId}
                    onChange={(e) => handleAssignGroupChange(e.target.value)}
                    className={fieldCls}
                    required
                  >
                    <option value="">Select a group…</option>
                    {groups
                      .filter(
                        (g) =>
                          g.configuration?.maximumCommission != null &&
                          (g.commissionMode || "waterfall") === "waterfall",
                      )
                      .map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name} — ceiling $
                          {(group.configuration?.maximumCommission ?? 0).toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-body block mb-2">
                    Maximum Commission (per lot)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={assignGroupCeiling ?? undefined}
                      value={assignAmount}
                      onChange={(e) =>
                        setAssignAmount(parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-9 pr-16 h-11 rounded-xl border border-border bg-surface-strong text-heading text-sm focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent font-medium">
                      per lot
                    </span>
                  </div>
                  {assignGroupCeiling !== null && assignAmount > assignGroupCeiling && (
                    <p className="text-xs text-red-600 mt-1.5">
                      Cannot exceed the group ceiling of ${assignGroupCeiling.toFixed(2)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    assigning ||
                    !selectedClient ||
                    !assignGroupId ||
                    (assignGroupCeiling !== null && assignAmount > assignGroupCeiling)
                  }
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm tracking-wide transition-all border border-accent disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                    color: "var(--heading)",
                  }}
                >
                  {assigning ? (
                    <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  {assigning ? "Assigning…" : "Assign Commission"}
                </button>
              </form>
            </div>

            {/* Existing root IBs */}
            <div
              className="rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
              style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)", }}
            >
              <div
                className="flex items-center gap-3 px-5 py-4 border-b border-border"
                style={{
                  background: "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)",
                }}
              >
                <Layers className="w-4 h-4 text-body" />
                <h2
                  className="text-base font-semibold text-heading"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Root IBs ({rootIBs.length})
                </h2>
              </div>

              <div className="divide-y divide-[#ede0c0] max-h-[520px] overflow-y-auto">
                {rootIBs.length === 0 ? (
                  <p className="text-sm text-accent px-5 py-8 text-center">
                    No root IBs assigned yet.
                  </p>
                ) : (
                  rootIBs.map((ib) => (
                    <div key={ib._id} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-heading">
                          {ib.userId?.firstName} {ib.userId?.lastName}
                        </p>
                        <p className="text-xs text-accent">{ib.userId?.email}</p>
                        {ib.groupId && (
                          <p className="text-xs text-accent mt-0.5">
                            {ib.groupId.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {ib.maximumCommission === null || ib.maximumCommission === undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-300">
                              Pending
                            </span>
                            <button
                              onClick={() => handleActivatePendingRootIB(ib)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-[#a0b890] transition-all hover:scale-105"
                              style={{ background: "linear-gradient(135deg, #c8ddb8, #9ab880)", color: "#1e3018" }}
                            >
                              <UserCheck className="w-3 h-3" /> Activate
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm font-light text-[#3a6a2a] dark:text-[#9cd18a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            ${ib.maximumCommission.toFixed(2)}/lot
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IBConfigurationManagement;
