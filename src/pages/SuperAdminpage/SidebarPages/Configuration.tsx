import axios from "axios";
import {
  AlertTriangle,
  Edit2,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
  Settings,
  Layers,
  SlidersHorizontal,
  Server,
  Check,
  Save,
  Palette,
  Sun,
  Moon,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useAppSettings,
  useUpdateAppSettings,
  DEFAULT_APP_TIMEZONE,
  type AppThemeSettings,
} from "@/hooks/useAppSettings";
import { useToastStore } from "@/Store/toast.store";
import { applyTheme } from "@/components/ThemeProvider/ThemeProvider";
import { isValidHexColor } from "@/lib/color";
import { CSRF_HEADER_NAME, ensureCsrfToken } from "@/utils/csrf";

// Falls back to a short curated list on very old browsers without
// Intl.supportedValuesOf; every modern browser supports it.
const TIMEZONE_OPTIONS: string[] =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "UTC",
        "Asia/Kolkata",
        "Asia/Dubai",
        "Europe/London",
        "Europe/Berlin",
        "America/New_York",
        "America/Los_Angeles",
        "Asia/Singapore",
        "Asia/Tokyo",
        "Australia/Sydney",
      ];

// e.g. "Asia/Kolkata" -> "UTC+05:30". Computed once at module load (not per
// render) since it's the same ~400-entry table for every session and only
// changes if DST actually shifts, which a settings-page reload will pick up.
const getUtcOffsetLabel = (timezone: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value || "GMT";
    // "GMT+5:30" -> "UTC+05:30", "GMT" -> "UTC+00:00"
    const match = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!match) return "UTC+00:00";
    const [, sign, hours, minutes = "00"] = match;
    return `UTC${sign}${hours.padStart(2, "0")}:${minutes}`;
  } catch (err) {
    return "";
  }
};

const TIMEZONE_OFFSET_LABELS: Record<string, string> = Object.fromEntries(
  TIMEZONE_OPTIONS.map((tz) => [tz, getUtcOffsetLabel(tz)]),
);

const THEME_PRESETS: { name: string; hex: string }[] = [
  { name: "Sky", hex: "#38bdf8" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Fuchsia", hex: "#d946ef" },
  { name: "Crimson", hex: "#e11d48" },
  { name: "Gold", hex: "#c8ab72" },
];

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}
interface LeverageResponse extends ApiResponse<Leverage[]> {}
interface Leverage {
  _id: string;
  value: number;
  name: string;
  active: boolean;
}
type MT5Group = string;
interface Group {
  _id: string;
  name: string;
  description: string;
  leverages: Leverage[];
  server: string;
  mt5_group: string;
}
interface GroupForm {
  _id?: string;
  name: string;
  description: string;
  leverages: string[];
  server: string;
  mt5_group: string;
}
interface LeverageForm {
  _id?: string;
  value: string;
  name: string;
  active: boolean;
}
interface Detail {
  id: number;
  name: string;
  value: string;
  description: string;
}
interface DetailForm {
  id?: number;
  name: string;
  value: string;
  description: string;
}
interface FileItem {
  id: number;
  name: string;
  value: string;
  description: string;
}
interface FileForm {
  id?: number;
  name: string;
  file: File | null;
  description: string;
  value?: string;
}
interface DeleteModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
interface DeleteModalState {
  type: "leverage" | "group";
  id: string;
}

const API = import.meta.env.VITE_BACKEND_URL;

// ── Shared field style ──
const fieldCls =
  "admin-input w-full rounded-2xl px-3 py-2.5 text-sm text-heading focus:outline-none disabled:bg-surface-strong disabled:text-body transition-colors placeholder:text-subtle";

const surfaceCardCls = "admin-surface rounded-2xl overflow-hidden";
const primaryBtnCls =
  "flex items-center gap-2 rounded-2xl bg-linear-to-r from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50";
const secondaryBtnCls =
  "rounded-2xl border border-border bg-surface-strong px-5 py-2.5 text-sm text-heading transition-colors hover:bg-surface-strong";

const DeleteModal = ({
  title,
  message,
  confirmLabel = "Delete",
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background">
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-strong border border-[#d4a090] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#8a3a2a]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-body font-semibold mb-1">
              Confirm Action
            </p>
            <h3
              className="text-xl font-light text-heading"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {title}
            </h3>
            <p className="text-sm text-body mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button onClick={onCancel} className={`flex-1 ${secondaryBtnCls}`}>
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-2xl bg-linear-to-r from-[#a14f42] to-[#7a2a2a] py-2.5 text-sm font-semibold text-heading transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<"leverage" | "values">("leverage");
  const [expandedForm, setExpandedForm] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] =
    useState<DeleteModalState | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [leverages, setLeverages] = useState<Leverage[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [mt5Groups, setMT5Groups] = useState<MT5Group[]>([]);
  const [loading] = useState(false);
  const [details, setDetails] = useState<Detail[]>([
    {
      id: 1,
      name: "Max Trade Size",
      value: "100000",
      description: "Maximum trade size allowed",
    },
    {
      id: 2,
      name: "Min Deposit",
      value: "1000",
      description: "Minimum deposit required",
    },
  ]);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 1,
      name: "Terms & Conditions",
      value: "terms.pdf",
      description: "Legal terms document",
    },
    {
      id: 2,
      name: "User Guide",
      value: "guide.pdf",
      description: "Platform user guide",
    },
  ]);

  const [leverageForm, setLeverageForm] = useState<LeverageForm>({
    value: "",
    name: "",
    active: true,
  });
  const [groupForm, setGroupForm] = useState<GroupForm>({
    name: "",
    description: "",
    leverages: [],
    server: "MT5",
    mt5_group: "",
  });
  const [detailForm, setDetailForm] = useState<DetailForm>({
    name: "",
    value: "",
    description: "",
  });
  const [fileForm, setFileForm] = useState<FileForm>({
    name: "",
    file: null,
    description: "",
  });
  const [serverNameDraft, setServerNameDraft] = useState("");
  const [themeModeDraft, setThemeModeDraft] = useState<AppThemeSettings["mode"]>("dark");
  const [accentDraft, setAccentDraft] = useState("#38bdf8");
  const [accentInputDraft, setAccentInputDraft] = useState("#38bdf8");
  const [timezoneDraft, setTimezoneDraft] = useState(DEFAULT_APP_TIMEZONE);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);

  const { data: appSettings } = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  const addToast = useToastStore((state) => state.addToast);

  const api = axios.create({
    baseURL: API,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "x-active-role": sessionStorage.getItem("active_role") || "",
    },
  });

  // This instance is created via axios.create(), so it does not inherit the
  // CSRF interceptor installed on the default axios export by
  // installCsrfProtection() in main.tsx — it needs its own copy (same fix as
  // IBConfigurationManagement.tsx), otherwise every mutating call through it
  // (group/leverage create-update-delete) is rejected with "Invalid or
  // missing CSRF token".
  const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
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

  useEffect(() => {
    fetchLeverages();
    fetchGroups();
    fetchMT5Groups();
  }, []);
  useEffect(() => {
    setServerNameDraft(appSettings?.serverName || "Aon ltd.");
  }, [appSettings?.serverName]);

  useEffect(() => {
    if (!appSettings?.theme) return;
    setThemeModeDraft(appSettings.theme.mode);
    setAccentDraft(appSettings.theme.accentColor);
    setAccentInputDraft(appSettings.theme.accentColor);
  }, [appSettings?.theme?.mode, appSettings?.theme?.accentColor]);

  useEffect(() => {
    setTimezoneDraft(appSettings?.timezone || DEFAULT_APP_TIMEZONE);
  }, [appSettings?.timezone]);

  const filteredTimezones = useMemo(() => {
    const q = timezoneSearch.trim().toLowerCase();
    if (!q) return TIMEZONE_OPTIONS;
    return TIMEZONE_OPTIONS.filter(
      (tz) =>
        tz.toLowerCase().includes(q) ||
        TIMEZONE_OFFSET_LABELS[tz]?.toLowerCase().includes(q),
    );
  }, [timezoneSearch]);

  const hasTimezoneChanges =
    !!appSettings?.timezone && appSettings.timezone !== timezoneDraft;

  const handleTimezoneSave = async () => {
    try {
      await updateAppSettings.mutateAsync({ timezone: timezoneDraft });
      addToast("success", "Timezone updated! Every date across the CRM now reflects it.");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to update timezone",
      );
    }
  };

  // Live-preview every draft change immediately on this screen; falls back to
  // the saved theme again once this page unmounts (e.g. draft change without
  // hitting Save shouldn't leave a stray preview applied elsewhere).
  useEffect(() => {
    applyTheme({ mode: themeModeDraft, accentColor: accentDraft });
    return () => {
      if (appSettings?.theme) applyTheme(appSettings.theme);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeModeDraft, accentDraft]);

  const hasThemeChanges =
    !!appSettings?.theme &&
    (appSettings.theme.mode !== themeModeDraft ||
      appSettings.theme.accentColor !== accentDraft);

  const handleThemeSave = async () => {
    if (!isValidHexColor(accentDraft)) {
      addToast("error", "Enter a valid hex color, e.g. #38bdf8");
      return;
    }
    try {
      await updateAppSettings.mutateAsync({
        theme: { mode: themeModeDraft, accentColor: accentDraft },
      });
      addToast("success", "Appearance updated!");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to update appearance",
      );
    }
  };

  const fetchLeverages = async () => {
    try {
      const response = await api.get<LeverageResponse>("/leverages");
      if (response.data.success && response.data.data)
        setLeverages(response.data.data);
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Error fetching leverages",
      );
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get<ApiResponse<any>>("/groups");
      const normalized = (res.data.data || []).map((g: any) => ({
        _id: g._id,
        name: g.name,
        mt5_group: g.value,
        server: g.platforms,
        description: g.description,
        leverages: g.leverages || [],
      }));
      setGroups(normalized);
    } catch {
      setGroups([]);
    }
  };

  const fetchMT5Groups = async () => {
    try {
      const res = await api.get<{
        status: string;
        lstGroups: string[];
        totalGroup: number;
      }>("/groups/mt5-groups");
      if (res.data.status === "success") setMT5Groups(res.data.lstGroups);
      else setMT5Groups([]);
    } catch {
      setMT5Groups([]);
    }
  };

  const handleAddLeverage = async () => {
    try {
      if (!leverageForm.name.trim() || !leverageForm.value.trim()) {
        addToast("error", "Please fill in name and value");
        return;
      }
      const valueNumber = parseInt(leverageForm.value);
      if (isNaN(valueNumber) || valueNumber < 1) {
        addToast("error", "Value must be a number greater than 0");
        return;
      }
      const response = await api.post<LeverageResponse>("/leverages", {
        name: leverageForm.name,
        value: valueNumber,
        active: leverageForm.active,
      });
      if (response.data.success) {
        addToast("success", response.data.message || "Leverage created!");
        await fetchLeverages();
        setLeverageForm({ value: "", name: "", active: true });
        setExpandedForm(null);
      }
    } catch (err: any) {
      addToast("error", err.response?.data?.message || "Error adding leverage");
    }
  };

  const handleEditLeverage = (leverage: Leverage) => {
    setLeverageForm({
      _id: leverage._id,
      value: leverage.value.toString(),
      name: leverage.name,
      active: leverage.active,
    });
    setExpandedForm(`edit-leverage-${leverage._id}`);
  };

  const handleUpdateLeverage = async () => {
    try {
      if (
        !leverageForm._id ||
        !leverageForm.name.trim() ||
        !leverageForm.value.trim()
      ) {
        addToast("error", "Please fill in all fields");
        return;
      }
      const valueNumber = parseInt(leverageForm.value);
      if (isNaN(valueNumber) || valueNumber < 1) {
        addToast("error", "Value must be a number greater than 0");
        return;
      }
      const response = await api.put<LeverageResponse>(
        `/leverages/${leverageForm._id}`,
        {
          name: leverageForm.name,
          value: valueNumber,
          active: leverageForm.active,
        },
      );
      if (response.data.success) {
        addToast("success", response.data.message || "Leverage updated!");
        await fetchLeverages();
        setExpandedForm(null);
        setLeverageForm({ value: "", name: "", active: true });
      }
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Error updating leverage",
      );
    }
  };

  const handleDeleteLeverage = async (id: string) => {
    try {
      const response = await api.delete<LeverageResponse>(`/leverages/${id}`);
      if (response.data.success) {
        addToast("success", response.data.message || "Leverage deleted!");
        await fetchLeverages();
        setShowDeleteModal(null);
      }
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Error deleting leverage",
      );
    }
  };

  const handleAddGroup = async () => {
    try {
      if (groupForm.leverages.length === 0) {
        addToast("error", "Please select at least one leverage");
        return;
      }
      await api.post(`/groups`, {
        name: groupForm.name,
        value: groupForm.mt5_group,
        description: groupForm.description,
        leverages: groupForm.leverages,
        platforms: groupForm.server,
      });
      await fetchGroups();
      addToast("success", "Group created!");
      setGroupForm({
        name: "",
        description: "",
        leverages: [],
        server: "MT5",
        mt5_group: "",
      });
      setExpandedForm(null);
    } catch (err: any) {
      addToast("error", err.response?.data?.message || "Error adding group");
    }
  };

  const handleEditGroup = (group: Group) => {
    setGroupForm({
      _id: group._id,
      name: group.name,
      description: group.description,
      leverages: Array.isArray(group.leverages)
        ? group.leverages.map((l) => l._id)
        : [],
      server: group.server || "",
      mt5_group: group.mt5_group || "",
    });
    setExpandedForm(`edit-group-${group._id}`);
  };

  const handleUpdateGroup = async () => {
    try {
      await api.put(`/groups/${groupForm._id}`, {
        name: groupForm.name,
        value: groupForm.mt5_group,
        description: groupForm.description,
        leverages: groupForm.leverages,
        platforms: groupForm.server,
      });
      await fetchGroups();
      addToast("success", "Group updated!");
      setExpandedForm(null);
      setGroupForm({
        name: "",
        description: "",
        leverages: [],
        server: "MT5",
        mt5_group: "",
      });
    } catch (err: any) {
      addToast("error", err.response?.data?.message || "Error updating group");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await api.delete<ApiResponse<any>>(`/groups/${id}`);
      await fetchGroups();
      addToast("success", "Group deleted!");
      setShowDeleteModal(null);
    } catch (err: any) {
      addToast("error", err.response?.data?.message || "Error deleting group");
    }
  };

  const handleServerNameSave = async () => {
    const nextServerName = serverNameDraft.trim();
    if (!nextServerName) {
      addToast("error", "Server name is required");
      return;
    }
    try {
      await updateAppSettings.mutateAsync({ serverName: nextServerName });
      addToast("success", "Server name updated!");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to update server name",
      );
    }
  };

  const handleUpdateDetail = () => {
    if (detailForm.id) {
      setDetails(
        details.map((d) =>
          d.id === detailForm.id
            ? ({ ...detailForm, id: detailForm.id } as Detail)
            : d,
        ),
      );
      setExpandedForm(null);
      setDetailForm({ name: "", value: "", description: "" });
    }
  };

  const handleUpdateFile = () => {
    if (fileForm.id) {
      setFiles(
        files.map((f) =>
          f.id === fileForm.id
            ? {
                id: fileForm.id,
                name: fileForm.name,
                value: fileForm.file?.name || f.value,
                description: fileForm.description,
              }
            : f,
        ),
      );
      setExpandedForm(null);
      setFileForm({ name: "", file: null, description: "" });
    }
  };

  const isLeverageForm =
    expandedForm === "add-leverage" ||
    expandedForm?.startsWith("edit-leverage");
  const isGroupForm =
    expandedForm === "add-group" || expandedForm?.startsWith("edit-group");

  return (
    <div className="admin-page p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1200px] space-y-5">
        <div className="admin-hero rounded-[30px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-px w-6 bg-accent" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-body">
                    System Administration
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl lg:text-5xl">
                  Configuration
                  <span className="block text-body">Settings</span>
                </h1>
                <p className="mt-3 max-w-md text-sm tracking-wide text-body">
                  Manage platform leverage options, account groups, and system
                  values from a unified control surface.
                </p>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 lg:w-auto">
                {[
                  {
                    label: "Leverages",
                    value: leverages.length,
                    icon: SlidersHorizontal,
                    accent: "#c4a055",
                  },
                  {
                    label: "Groups",
                    value: groups.length,
                    icon: Layers,
                    accent: "#8ab88a",
                  },
                  {
                    label: "Server",
                    value: appSettings?.serverName ? "Set" : "—",
                    icon: Server,
                    accent: "#a08070",
                  },
                ].map(({ label, value, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-surface-strong/80 px-4 py-3 shadow-sm"
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
                    <span className="text-2xl font-bold text-heading">{value}</span>
                  </div>
                ))}
              </div>
          </div>
        </div>

        <div className={surfaceCardCls}>
          <div className="flex items-center gap-2 border-b border-border bg-surface-strong/80 px-5 py-3">
            <Server className="w-3.5 h-3.5 text-body" />
            <span className="text-xs uppercase tracking-widest font-semibold text-body">
              Server Identity
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-end gap-5 justify-between">
            <div>
              <p className="text-xs text-accent mb-1">
                Current client-facing label
              </p>
              <p
                className="text-2xl font-light text-heading"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {appSettings?.serverName || "Aon ltd."}
              </p>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <input
                type="text"
                value={serverNameDraft}
                onChange={(e) => setServerNameDraft(e.target.value)}
                placeholder="Enter new server name..."
                className={`${fieldCls} min-w-[220px]`}
              />
              <button
                onClick={handleServerNameSave}
                disabled={updateAppSettings.isPending}
                className={`${primaryBtnCls} whitespace-nowrap`}
              >
                <Save className="w-3.5 h-3.5" />
                {updateAppSettings.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className={surfaceCardCls}>
          <div className="flex items-center gap-2 border-b border-border bg-surface-strong/80 px-5 py-3">
            <Palette className="w-3.5 h-3.5 text-body" />
            <span className="text-xs uppercase tracking-widest font-semibold text-body">
              Appearance
            </span>
          </div>
          <div className="p-5 sm:p-6 space-y-6">
            <p className="text-xs text-accent">
              Controls the color theme every client, admin, and superadmin
              screen uses. Changes apply live across all connected sessions.
            </p>

            {/* Mode toggle */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-2">
                Mode
              </p>
              <div className="inline-flex rounded-2xl border border-border bg-surface-strong/80 p-1">
                {(
                  [
                    { id: "light" as const, label: "Light", icon: Sun },
                    { id: "dark" as const, label: "Dark", icon: Moon },
                  ]
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setThemeModeDraft(id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      themeModeDraft === id
                        ? "bg-linear-to-r from-accent to-accent-hover text-accent-foreground shadow"
                        : "text-body hover:bg-surface-strong"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-2">
                Accent color
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      setAccentDraft(preset.hex);
                      setAccentInputDraft(preset.hex);
                    }}
                    title={preset.name}
                    className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                      accentDraft.toLowerCase() === preset.hex.toLowerCase()
                        ? "border-border shadow-md"
                        : "border-white/60 shadow-sm"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  />
                ))}

                {/* Custom color */}
                <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
                  <input
                    type="color"
                    value={isValidHexColor(accentDraft) ? accentDraft : "#38bdf8"}
                    onChange={(e) => {
                      setAccentDraft(e.target.value);
                      setAccentInputDraft(e.target.value);
                    }}
                    className="h-9 w-9 cursor-pointer rounded-full border-2 border-border bg-transparent p-0"
                    title="Pick any custom color"
                  />
                  <input
                    type="text"
                    value={accentInputDraft}
                    onChange={(e) => {
                      const next = e.target.value;
                      setAccentInputDraft(next);
                      if (isValidHexColor(next)) setAccentDraft(next);
                    }}
                    placeholder="#38bdf8"
                    className={`${fieldCls} w-28`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleThemeSave}
                disabled={updateAppSettings.isPending || !hasThemeChanges}
                className={`${primaryBtnCls} whitespace-nowrap`}
              >
                <Save className="w-3.5 h-3.5" />
                {updateAppSettings.isPending ? "Saving..." : "Save Appearance"}
              </button>
            </div>
          </div>
        </div>

        <div className={surfaceCardCls}>
          <div className="flex items-center gap-2 border-b border-border bg-surface-strong/80 px-5 py-3">
            <Globe className="w-3.5 h-3.5 text-body" />
            <span className="text-xs uppercase tracking-widest font-semibold text-body">
              Timezone
            </span>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-xs text-accent">
              Every date and time the CRM shows — deposits, withdrawals,
              trades, tickets, reports and exports, old records and new — is
              displayed in this timezone for every client, admin, and
              superadmin.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Opens as a centered popup (see portal below) rather than an
                  anchored dropdown, so it can't be clipped by this card's
                  overflow-hidden and works the same on mobile as desktop. */}
              <button
                type="button"
                onClick={() => setIsTimezoneModalOpen(true)}
                className={`${fieldCls} flex flex-1 items-center justify-between gap-2 text-left`}
              >
                <span className="truncate">
                  {timezoneDraft}
                  {TIMEZONE_OFFSET_LABELS[timezoneDraft] && (
                    <span className="ml-1.5 text-subtle">
                      ({TIMEZONE_OFFSET_LABELS[timezoneDraft]})
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-subtle" />
              </button>
              <button
                onClick={handleTimezoneSave}
                disabled={updateAppSettings.isPending || !hasTimezoneChanges}
                className={`${primaryBtnCls} whitespace-nowrap`}
              >
                <Save className="w-3.5 h-3.5" />
                {updateAppSettings.isPending ? "Saving..." : "Save Timezone"}
              </button>
            </div>

            {isTimezoneModalOpen &&
              createPortal(
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                  onClick={() => {
                    setIsTimezoneModalOpen(false);
                    setTimezoneSearch("");
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl max-h-[85vh] sm:max-h-[70vh]"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-body" />
                        <span className="text-sm font-semibold text-heading">
                          Select Timezone
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTimezoneModalOpen(false);
                          setTimezoneSearch("");
                        }}
                        className="rounded-full p-1 text-subtle transition-colors hover:bg-surface-strong/[0.08] hover:text-heading"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="border-b border-border p-3 space-y-2">
                      <input
                        autoFocus
                        type="text"
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                        placeholder="Search timezones... e.g. Kolkata"
                        className={`${fieldCls} py-2`}
                      />
                      <p className="text-[11px] text-subtle">
                        Offsets shown are as of today. Zones with daylight
                        saving (e.g. Europe/London, America/New_York) switch
                        automatically — every date is converted using the
                        correct offset for its own day, not today's.
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {filteredTimezones.length === 0 && (
                        <p className="px-4 py-3 text-sm text-subtle">
                          No matching timezones
                        </p>
                      )}
                      {filteredTimezones.map((tz) => {
                        const isSelected = tz === timezoneDraft;
                        return (
                          <button
                            key={tz}
                            type="button"
                            onClick={() => {
                              setTimezoneDraft(tz);
                              setIsTimezoneModalOpen(false);
                              setTimezoneSearch("");
                            }}
                            className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-accent-soft text-accent"
                                : "text-heading hover:bg-surface-strong/[0.06]"
                            }`}
                          >
                            <span className="flex min-w-0 items-baseline gap-1.5">
                              <span className="truncate">{tz}</span>
                              {TIMEZONE_OFFSET_LABELS[tz] && (
                                <span
                                  className={
                                    isSelected ? "text-accent/80" : "text-subtle"
                                  }
                                >
                                  ({TIMEZONE_OFFSET_LABELS[tz]})
                                </span>
                              )}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>,
                document.body,
              )}
          </div>
        </div>

        <div className={surfaceCardCls}>
          <div className="flex border-b border-border">
            {[
              {
                id: "leverage" as const,
                label: "Leverage & Groups",
                icon: SlidersHorizontal,
              },
              {
                id: "values" as const,
                label: "Configure Values",
                icon: Settings,
              },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="relative flex flex-1 items-center justify-center gap-2 px-5 py-4 text-sm font-medium transition-all"
                style={
                  activeTab === id
                    ? {
                        color: "var(--heading)",
                        background: "var(--surface-strong)",
                      }
                    : { color: "var(--body)" }
                }
              >
                <Icon className="w-4 h-4" />
                {label}
                {activeTab === id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: "linear-gradient(90deg,var(--accent-color),var(--accent-hover))",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── TAB CONTENT ── */}
          <div className="p-5 sm:p-6 space-y-6">
            {activeTab === "leverage" ? (
              <>
                {/* ── LEVERAGES SECTION ── */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-body font-semibold">
                        Configuration
                      </p>
                      <h2
                        className="text-2xl font-light text-heading"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        Leverage Options
                      </h2>
                    </div>
                    {!isLeverageForm && (
                      <button
                        onClick={() => {
                          setExpandedForm("add-leverage");
                          setLeverageForm({
                            value: "",
                            name: "",
                            active: true,
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-accent transition-all hover:opacity-85"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--accent-color), var(--accent-hover))",
                          color: "var(--accent-foreground)",
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Leverage
                      </button>
                    )}
                  </div>

                  {/* Leverage Form Panel */}
                  {isLeverageForm && (
                    <div
                      ref={formRef}
                      className="mb-5 rounded-2xl border border-border overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface) 100%)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        className="px-5 py-3 border-b border-border flex items-center justify-between"
                        style={{
                          background: "linear-gradient(90deg,var(--surface-strong),var(--surface))",
                        }}
                      >
                        <span className="text-xs uppercase tracking-widest font-semibold text-body">
                          {expandedForm === "add-leverage"
                            ? "New Leverage"
                            : "Edit Leverage"}
                        </span>
                        <button
                          onClick={() => setExpandedForm(null)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-body" />
                        </button>
                      </div>
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Value (e.g. 100)
                          </label>
                          <input
                            type="text"
                            value={leverageForm.value}
                            onChange={(e) =>
                              setLeverageForm({
                                ...leverageForm,
                                value: e.target.value,
                              })
                            }
                            placeholder="100"
                            className={fieldCls}
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Display Name (e.g. 1:100)
                          </label>
                          <input
                            type="text"
                            value={leverageForm.name}
                            onChange={(e) =>
                              setLeverageForm({
                                ...leverageForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="1:100"
                            className={fieldCls}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Status
                          </label>
                          <div className="flex gap-2">
                            {[
                              { val: true, label: "Active" },
                              { val: false, label: "Inactive" },
                            ].map(({ val, label }) => (
                              <button
                                key={label}
                                onClick={() =>
                                  setLeverageForm({
                                    ...leverageForm,
                                    active: val,
                                  })
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all"
                                style={
                                  leverageForm.active === val
                                    ? {
                                        background: val
                                          ? "linear-gradient(135deg,#3a6a2a,#2a5a1a)"
                                          : "linear-gradient(135deg,#7a2a2a,#5a1a1a)",
                                        color: "var(--heading)",
                                        borderColor: "transparent",
                                      }
                                    : {
                                        borderColor: "var(--border)",
                                        color: "var(--body)",
                                        background: "var(--surface-strong)",
                                      }
                                }
                              >
                                {val ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2 flex gap-2.5 pt-2 border-t border-border">
                          <button
                            onClick={() => setExpandedForm(null)}
                            className="px-5 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={
                              expandedForm === "add-leverage"
                                ? handleAddLeverage
                                : handleUpdateLeverage
                            }
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
                            style={{
                              background:
                                "linear-gradient(135deg,var(--accent-color),var(--accent-hover))",
                              color: "var(--accent-foreground)",
                            }}
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save Leverage
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Leverage Table */}
                  <div
                    className="rounded-2xl border border-border overflow-hidden"
                    style={{ background: "var(--surface-strong)" }}
                  >
                    {/* Desktop */}
                    <table className="w-full hidden sm:table">
                      <thead>
                        <tr
                          style={{
                            background:
                              "linear-gradient(90deg,var(--surface-strong),var(--surface))",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {["#", "Value", "Name", "Status", "Actions"].map(
                            (h, i) => (
                              <th
                                key={h}
                                className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-body ${i >= 4 ? "text-center" : "text-left"}`}
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {leverages.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-12 text-center text-sm text-accent"
                            >
                              No leverages configured
                            </td>
                          </tr>
                        ) : (
                          leverages.map((lev, i) => (
                            <tr
                              key={lev._id}
                              className="border-b border-border hover:bg-surface-strong transition-colors"
                            >
                              <td className="px-5 py-3.5 text-xs text-accent">
                                {i + 1}
                              </td>
                              <td className="px-5 py-3.5 font-mono font-semibold text-heading">
                                {lev.value}
                              </td>
                              <td className="px-5 py-3.5 text-sm text-heading">
                                {lev.name}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${lev.active ? "bg-[#5a7a5a] text-[#edfaed]" : "bg-[#7a3a3a] text-heading"}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${lev.active ? "bg-[#8ab88a]" : "bg-[#c47a7a]"}`}
                                  />
                                  {lev.active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {[
                                    {
                                      icon: Edit2,
                                      fn: () => handleEditLeverage(lev),
                                      title: "Edit",
                                      danger: false,
                                    },
                                    {
                                      icon: Trash2,
                                      fn: () =>
                                        setShowDeleteModal({
                                          type: "leverage",
                                          id: lev._id,
                                        }),
                                      title: "Delete",
                                      danger: true,
                                    },
                                  ].map(({ icon: Icon, fn, title, danger }) => (
                                    <button
                                      key={title}
                                      onClick={fn}
                                      title={title}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                                      style={
                                        danger
                                          ? {
                                              background: "var(--surface-strong)",
                                              borderColor: "#d4a090",
                                              color: "#8a3a2a",
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
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {/* Mobile */}
                    <div className="sm:hidden divide-y divide-[var(--border)]">
                      {leverages.map((lev) => (
                        <div
                          key={lev._id}
                          className="p-4 flex items-center justify-between hover:bg-surface-strong transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold border border-border bg-surface-strong text-heading">
                              {lev.value}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-heading">
                                {lev.name}
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${lev.active ? "bg-[#5a7a5a] text-[#edfaed]" : "bg-[#7a3a3a] text-heading"}`}
                              >
                                {lev.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEditLeverage(lev)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-surface-strong text-body"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setShowDeleteModal({
                                  type: "leverage",
                                  id: lev._id,
                                })
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-300 bg-surface-strong text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ── GROUPS SECTION ── */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-body font-semibold">
                        Configuration
                      </p>
                      <h2
                        className="text-2xl font-light text-heading"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        Account Groups
                      </h2>
                    </div>
                    {!isGroupForm && (
                      <button
                        onClick={() => {
                          setExpandedForm("add-group");
                          setGroupForm({
                            name: "",
                            description: "",
                            leverages: [],
                            server: "MT5",
                            mt5_group: "",
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#a0c890] transition-all hover:opacity-85"
                        style={{
                          background:
                            "linear-gradient(135deg, #c8ddb8, #9ab880)",
                          color: "#1e3018",
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Group
                      </button>
                    )}
                  </div>

                  {/* Group Form Panel */}
                  {isGroupForm && (
                    <div
                      ref={formRef}
                      className="mb-5 rounded-2xl border border-border overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface) 100%)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        className="px-5 py-3 border-b border-border flex items-center justify-between"
                        style={{
                          background: "linear-gradient(90deg,var(--surface-strong),var(--surface))",
                        }}
                      >
                        <span className="text-xs uppercase tracking-widest font-semibold text-body">
                          {expandedForm === "add-group"
                            ? "New Account Group"
                            : "Edit Account Group"}
                        </span>
                        <button
                          onClick={() => setExpandedForm(null)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-body" />
                        </button>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs uppercase tracking-widest text-body block mb-2">
                              Group Name
                            </label>
                            <input
                              type="text"
                              value={groupForm.name}
                              onChange={(e) =>
                                setGroupForm({
                                  ...groupForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g. ECN Account"
                              className={fieldCls}
                            />
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-widest text-body block mb-2">
                              Platform (Server)
                            </label>
                            <input
                              type="text"
                              value={groupForm.server}
                              onChange={(e) =>
                                setGroupForm({
                                  ...groupForm,
                                  server: e.target.value,
                                })
                              }
                              placeholder="e.g. MT5"
                              className={fieldCls}
                            />
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-widest text-body block mb-2">
                              MT5 Group{" "}
                              {loading && (
                                <span className="text-accent">
                                  (Loading…)
                                </span>
                              )}
                            </label>
                            <select
                              value={groupForm.mt5_group}
                              onChange={(e) =>
                                setGroupForm({
                                  ...groupForm,
                                  mt5_group: e.target.value,
                                })
                              }
                              className={fieldCls + " appearance-none"}
                            >
                              <option value="">Select MT5 Group</option>
                              {mt5Groups.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-widest text-body block mb-2">
                              Description
                            </label>
                            <textarea
                              value={groupForm.description}
                              onChange={(e) =>
                                setGroupForm({
                                  ...groupForm,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Describe this account type…"
                              rows={1}
                              className={fieldCls + " resize-none"}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Select Leverages
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto rounded-xl border border-border bg-surface-strong p-3">
                            {leverages.map((lev) => {
                              const checked = groupForm.leverages.includes(
                                lev._id,
                              );
                              return (
                                <button
                                  key={lev._id}
                                  onClick={() => {
                                    const updated = checked
                                      ? groupForm.leverages.filter(
                                          (id) => id !== lev._id,
                                        )
                                      : [...groupForm.leverages, lev._id];
                                    setGroupForm({
                                      ...groupForm,
                                      leverages: updated,
                                    });
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all text-left"
                                  style={
                                    checked
                                      ? {
                                          background:
                                            "linear-gradient(135deg,var(--accent-color),var(--accent-hover))",
                                          color: "var(--accent-foreground)",
                                          borderColor: "transparent",
                                        }
                                      : {
                                          borderColor: "var(--border)",
                                          color: "var(--body)",
                                          background: "var(--surface)",
                                        }
                                  }
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border ${checked ? "border-transparent bg-accent" : "border-accent"}`}
                                  >
                                    {checked && (
                                      <Check className="w-2.5 h-2.5 text-heading" />
                                    )}
                                  </div>
                                  <span>{lev.name}</span>
                                </button>
                              );
                            })}
                          </div>
                          {groupForm.leverages.length > 0 && (
                            <p className="text-xs text-body mt-1.5">
                              {groupForm.leverages.length} leverage
                              {groupForm.leverages.length > 1 ? "s" : ""}{" "}
                              selected
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2.5 pt-2 border-t border-border">
                          <button
                            onClick={() => setExpandedForm(null)}
                            className="px-5 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={
                              expandedForm === "add-group"
                                ? handleAddGroup
                                : handleUpdateGroup
                            }
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
                            style={{
                              background:
                                "linear-gradient(135deg,#3a6a2a,#2a5a1a)",
                              color: "#edfaed",
                            }}
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save Group
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Groups — card grid layout */}
                  {groups.length === 0 ? (
                    <div
                      className="rounded-2xl border border-border p-12 text-center"
                      style={{ background: "var(--surface-strong)" }}
                    >
                      <Layers className="w-10 h-10 text-accent mx-auto mb-3" />
                      <p className="text-sm text-accent">
                        No account groups configured
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {groups.map((group, i) => (
                        <div
                          key={group._id}
                          className="rounded-2xl border border-border overflow-hidden transition-all hover:shadow-md"
                          style={{
                            background: "var(--surface-strong)",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                          }}
                        >
                          <div
                            className="px-4 py-3 border-b border-border flex items-center justify-between"
                            style={{
                              background:
                                "linear-gradient(135deg,var(--surface-strong),var(--surface))",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-heading"
                                style={{
                                  background:
                                    "linear-gradient(135deg,var(--accent-color),var(--accent-hover))",
                                }}
                              >
                                {i + 1}
                              </div>
                              <span
                                className="font-semibold text-heading text-sm"
                                style={{
                                  fontFamily: "'Cormorant Garamond',serif",
                                }}
                              >
                                {group.name}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditGroup(group)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-surface-strong text-body hover:scale-105 transition-all"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setShowDeleteModal({
                                    type: "group",
                                    id: group._id,
                                  })
                                }
                                className="w-7 h-7 rounded-lg flex items-center justify-center border border-red-300 bg-surface-strong text-red-600 hover:scale-105 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs text-accent">
                                MT5 Group
                              </span>
                              {group.mt5_group ? (
                                <span className="text-xs font-mono text-accent text-right break-all">
                                  {group.mt5_group}
                                </span>
                              ) : (
                                <span className="text-xs text-accent">
                                  Not set
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-accent">
                                Platform
                              </span>
                              {group.server ? (
                                <span className="text-xs text-accent font-medium">
                                  {group.server}
                                </span>
                              ) : (
                                <span className="text-xs text-accent">
                                  Not set
                                </span>
                              )}
                            </div>
                            {group.description && (
                              <div>
                                <span className="text-xs text-accent">
                                  Description
                                </span>
                                <p className="text-xs text-heading mt-0.5">
                                  {group.description}
                                </p>
                              </div>
                            )}
                            {group.leverages?.length > 0 && (
                              <div>
                                <span className="text-xs text-accent block mb-1.5">
                                  Leverages
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {group.leverages.slice(0, 4).map((lev) => (
                                    <span
                                      key={lev._id}
                                      className="px-2 py-0.5 rounded-full text-[10px] border border-border bg-surface-strong text-heading"
                                    >
                                      {lev.name}
                                    </span>
                                  ))}
                                  {group.leverages.length > 4 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] border border-border bg-surface-strong text-accent">
                                      +{group.leverages.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <>
                {/* ── DETAILS SECTION ── */}
                <section>
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-body font-semibold">
                      System
                    </p>
                    <h2
                      className="text-2xl font-light text-heading"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Configure Values
                    </h2>
                  </div>

                  {expandedForm?.startsWith("edit-detail") && (
                    <div
                      ref={formRef}
                      className="mb-5 rounded-2xl border border-border overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface) 100%)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        className="px-5 py-3 border-b border-border flex items-center justify-between"
                        style={{
                          background: "linear-gradient(90deg,var(--surface-strong),var(--surface))",
                        }}
                      >
                        <span className="text-xs uppercase tracking-widest font-semibold text-body">
                          Edit Value
                        </span>
                        <button
                          onClick={() => setExpandedForm(null)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-body" />
                        </button>
                      </div>
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={detailForm.name}
                            onChange={(e) =>
                              setDetailForm({
                                ...detailForm,
                                name: e.target.value,
                              })
                            }
                            className={fieldCls}
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Value
                          </label>
                          <input
                            type="text"
                            value={detailForm.value}
                            onChange={(e) =>
                              setDetailForm({
                                ...detailForm,
                                value: e.target.value,
                              })
                            }
                            className={fieldCls}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Description
                          </label>
                          <textarea
                            value={detailForm.description}
                            onChange={(e) =>
                              setDetailForm({
                                ...detailForm,
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            className={fieldCls + " resize-none"}
                          />
                        </div>
                        <div className="sm:col-span-2 flex gap-2.5 pt-2 border-t border-border">
                          <button
                            onClick={() => setExpandedForm(null)}
                            className="px-5 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateDetail}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
                            style={{
                              background:
                                "linear-gradient(135deg,var(--accent-color),var(--accent-hover))",
                              color: "var(--accent-foreground)",
                            }}
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className="rounded-2xl border border-border overflow-hidden"
                    style={{ background: "var(--surface-strong)" }}
                  >
                    {details.map((detail, index) => (
                      <div
                        key={detail.id}
                        className={`flex items-center justify-between px-5 py-4 hover:bg-surface-strong transition-colors ${index < details.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-mono font-bold border border-border bg-surface-strong text-heading">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-heading text-sm">
                              {detail.name}
                            </div>
                            <div className="text-xs text-accent mt-0.5">
                              {detail.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-mono font-semibold text-heading">
                              {detail.value}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setDetailForm(detail);
                              setExpandedForm(`edit-detail-${detail.id}`);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-surface-strong text-body hover:scale-105 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── FILES SECTION ── */}
                <section>
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-body font-semibold">
                      Documents
                    </p>
                    <h2
                      className="text-2xl font-light text-heading"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Platform Files
                    </h2>
                  </div>

                  {expandedForm?.startsWith("edit-file") && (
                    <div
                      ref={formRef}
                      className="mb-5 rounded-2xl border border-border overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface) 100%)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        className="px-5 py-3 border-b border-border flex items-center justify-between"
                        style={{
                          background: "linear-gradient(90deg,var(--surface-strong),var(--surface))",
                        }}
                      >
                        <span className="text-xs uppercase tracking-widest font-semibold text-body">
                          Replace File
                        </span>
                        <button
                          onClick={() => setExpandedForm(null)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-body" />
                        </button>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            File Name
                          </label>
                          <input
                            type="text"
                            value={fileForm.name}
                            onChange={(e) =>
                              setFileForm({ ...fileForm, name: e.target.value })
                            }
                            className={fieldCls}
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Upload File
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              onChange={(e: any) =>
                                setFileForm({
                                  ...fileForm,
                                  file: e.target.files?.[0] || null,
                                })
                              }
                              className="hidden"
                              id="file-input"
                            />
                            <label
                              htmlFor="file-input"
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-strong text-sm text-heading cursor-pointer hover:bg-surface transition-all"
                            >
                              <Upload className="w-4 h-4" /> Choose File
                            </label>
                            <span className="text-sm text-body">
                              {fileForm.file
                                ? fileForm.file.name
                                : fileForm.value || "No file chosen"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-body block mb-2">
                            Description
                          </label>
                          <textarea
                            value={fileForm.description}
                            onChange={(e) =>
                              setFileForm({
                                ...fileForm,
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            className={fieldCls + " resize-none"}
                          />
                        </div>
                        <div className="flex gap-2.5 pt-2 border-t border-border">
                          <button
                            onClick={() => setExpandedForm(null)}
                            className="px-5 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateFile}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
                            style={{
                              background:
                                "linear-gradient(135deg,var(--accent-color),var(--accent-hover))",
                              color: "var(--accent-foreground)",
                            }}
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-2xl border border-border overflow-hidden transition-all hover:shadow-md"
                        style={{
                          background: "rgba(255,253,250,0.9)",
                          boxShadow: "0 2px 12px rgba(139,100,40,0.08)",
                        }}
                      >
                        <div
                          className="px-4 py-3 border-b border-border flex items-center gap-3"
                          style={{
                            background:
                              "linear-gradient(135deg,var(--surface-strong),var(--surface))",
                          }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-surface-strong">
                            <FileText className="w-4 h-4 text-body" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-heading text-sm">
                              {file.name}
                            </div>
                            <div className="text-xs text-accent truncate">
                              {file.value}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <p className="text-xs text-body">
                            {file.description}
                          </p>
                          <button
                            onClick={() => {
                              setFileForm({ ...file, file: null });
                              setExpandedForm(`edit-file-${file.id}`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border bg-surface-strong text-heading hover:bg-surface transition-all whitespace-nowrap ml-3"
                          >
                            <Edit2 className="w-3 h-3" /> Replace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          title={
            showDeleteModal.type === "leverage"
              ? "Delete Leverage"
              : "Delete Group"
          }
          message={
            showDeleteModal.type === "leverage"
              ? "Are you sure you want to delete this leverage? This action cannot be undone."
              : "Are you sure you want to delete this group? This action cannot be undone."
          }
          onConfirm={() => {
            showDeleteModal.type === "leverage"
              ? handleDeleteLeverage(showDeleteModal.id)
              : handleDeleteGroup(showDeleteModal.id);
          }}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  );
}
