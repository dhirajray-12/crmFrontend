import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Info, ArrowLeft } from "lucide-react";
import { PERMISSION_GROUPS, ALL_PERMISSIONS } from "@/Constants/permissions";
import {
  createSubadmin,
  getSubadmin,
  updateSubadmin,
  type SubadminPayload,
} from "@/API/subadminApi";
import api from "@/API/axiosInstance";
import { useToastStore } from "@/Store/toast.store";

interface ClientOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  dateofbirth: "",
};

const sectionClass =
  "rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_16px_28px_rgba(116,93,56,0.08)] space-y-4";

const labelClass = "mb-1.5 block text-sm font-medium text-body";

const inputClass =
  "h-11 w-full rounded-2xl border border-border bg-surface-strong px-4 text-sm text-heading outline-none transition-all placeholder:text-body focus:border-accent focus:bg-surface-strong disabled:bg-surface-strong disabled:text-accent";

const primaryButton =
  "flex-1 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover py-2.5 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0";

const secondaryButton =
  "flex-1 rounded-2xl border border-border bg-surface-strong py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface-strong";

const SubadminFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [form, setForm] = useState(emptyForm);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [assignedClients, setAssignedClients] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    PERMISSION_GROUPS.map((g) => g.key),
  );
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const subadmin = await getSubadmin(id);
        setForm({
          firstName: subadmin.firstName,
          lastName: subadmin.lastName,
          email: subadmin.email,
          password: "",
          phone: subadmin.phone,
          country:
            typeof subadmin.country === "string"
              ? subadmin.country
              : subadmin.country?.name || "",
          dateofbirth: subadmin.dateofbirth?.slice(0, 10) || "",
        });
        setPermissions(subadmin.permissions || []);
        setAssignedClients(subadmin.assignedClients || []);
      } catch (error: any) {
        addToast(
          "error",
          error?.response?.data?.message || "Failed to load subadmin",
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/admin/clients", {
          params: { role: "client", limit: 50, search: clientSearch || undefined },
        });
        setClientOptions(res.data?.data || []);
      } catch {
        // reference-only field — a failed lookup shouldn't block the form
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [clientSearch]);

  const progress = useMemo(
    () => Math.round((permissions.length / ALL_PERMISSIONS.length) * 100),
    [permissions],
  );

  const toggleGroupExpanded = (key: string) => {
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const selectAllInGroup = (groupPermissions: string[]) => {
    setPermissions((prev) => Array.from(new Set([...prev, ...groupPermissions])));
  };

  const clearAllInGroup = (groupPermissions: string[]) => {
    setPermissions((prev) => prev.filter((p) => !groupPermissions.includes(p)));
  };

  const toggleClient = (clientId: string) => {
    setAssignedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((c) => c !== clientId)
        : [...prev, clientId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && (!form.password || form.password.length < 6)) {
      addToast("error", "Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        const payload: Partial<SubadminPayload> = {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          country: form.country,
          dateofbirth: form.dateofbirth,
          permissions,
          assignedClients,
        };
        await updateSubadmin(id, payload);
        addToast("success", "Subadmin updated successfully");
      } else {
        const payload: SubadminPayload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          country: form.country,
          dateofbirth: form.dateofbirth,
          permissions,
          assignedClients,
        };
        await createSubadmin(payload);
        addToast("success", "Subadmin created successfully");
      }
      navigate("/admin/subadmins");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to save subadmin",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm uppercase tracking-widest text-body">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Lato',_sans-serif]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <button
          onClick={() => navigate("/admin/subadmins")}
          className="flex items-center gap-1.5 text-sm font-medium text-body transition-colors hover:text-heading"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subadmins
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-body">
            Access Control
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0f172a] dark:text-heading">
            {isEdit ? "Edit Subadmin" : "New Subadmin"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
          {/* Account details */}
          <section className={sectionClass}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-body">
              Account Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  required
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  required
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  required
                  type="email"
                  placeholder="Email"
                  disabled={isEdit}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              {!isEdit && (
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    required
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  required
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  required
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  required
                  type="date"
                  value={form.dateofbirth}
                  onChange={(e) =>
                    setForm({ ...form, dateofbirth: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Permissions */}
          <section className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-body">
                Module Permissions
              </h2>
              <span className="text-xs font-medium text-body">
                {permissions.length} / {ALL_PERMISSIONS.length} selected
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-linear-to-br from-accent to-accent-hover transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-2">
              {PERMISSION_GROUPS.map((group) => {
                const allSelected = group.permissions.every((p) =>
                  permissions.includes(p),
                );
                const isExpanded = expandedGroups.includes(group.key);

                return (
                  <div
                    key={group.key}
                    className="rounded-xl border border-border bg-surface-strong/60"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroupExpanded(group.key)}
                      className="flex w-full items-center justify-between px-3 py-2.5"
                    >
                      <span className="text-sm font-medium text-heading">
                        {group.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-accent" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-accent" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 border-t border-border px-3 py-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => selectAllInGroup(group.permissions)}
                            className="font-semibold text-body hover:underline"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={() => clearAllInGroup(group.permissions)}
                            className="font-semibold text-accent hover:underline"
                          >
                            Clear all
                          </button>
                          {allSelected && (
                            <span className="font-medium text-[#3a6a2a] dark:text-[#9cd18a]">
                              All selected
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {group.permissions.map((permission) => {
                            const action = permission.split(".")[1];
                            return (
                              <label
                                key={permission}
                                className="flex items-center gap-2 text-sm text-heading"
                              >
                                <input
                                  type="checkbox"
                                  checked={permissions.includes(permission)}
                                  onChange={() => togglePermission(permission)}
                                  className="h-4 w-4 rounded border-border text-heading focus:ring-accent"
                                />
                                <span className="capitalize">{action}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Assigned clients (reference only) */}
          <section className={sectionClass}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-body">
              Assigned Clients (Optional)
            </h2>
            <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-strong p-3 text-xs text-body">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Reference tag only — this does <strong>not</strong> restrict
                which clients' data this subadmin can see. Data visibility is
                controlled entirely by the module permissions above.
              </span>
            </div>
            <input
              placeholder="Search clients..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className={inputClass}
            />
            <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
              {clientOptions.map((client) => (
                <label
                  key={client._id}
                  className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm text-heading last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={assignedClients.includes(client._id)}
                    onChange={() => toggleClient(client._id)}
                    className="h-4 w-4 flex-shrink-0 rounded border-border text-heading focus:ring-accent"
                  />
                  <span className="truncate">
                    {client.firstName} {client.lastName} ({client.email})
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/admin/subadmins")}
              className={secondaryButton}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Subadmin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubadminFormPage;
