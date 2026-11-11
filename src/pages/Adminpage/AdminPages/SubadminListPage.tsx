import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ShieldOff,
  Users,
  Search,
  Plus,
  KeyRound,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import {
  deleteSubadmin,
  getSubadmins,
  resetSubadminPassword,
  updateSubadmin,
  type Subadmin,
} from "@/API/subadminApi";
import { useToastStore } from "@/Store/toast.store";

const statusConfig = {
  activated: {
    bg: "bg-[#3a6a2a] text-[#f2fbf0]",
    dot: "bg-[#8ab88a]",
    label: "Active",
  },
  suspended: {
    bg: "bg-[#7a3a3a] text-heading",
    dot: "bg-[#c47a7a]",
    label: "Suspended",
  },
};

const primaryButton =
  "inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-transform hover:-translate-y-0.5";

const secondaryButton =
  "rounded-2xl border border-border bg-surface-strong px-5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface-strong";

const dangerButton =
  "rounded-2xl border border-[#8b3a2f] bg-[#8b3a2f] px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-[#742f26]";

const inputClass =
  "admin-input w-full rounded-2xl py-2.5 pl-9 pr-3 text-sm focus:outline-none";

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-strong text-body transition-transform hover:scale-105";

const SubadminListPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [subadmins, setSubadmins] = useState<Subadmin[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [resetTarget, setResetTarget] = useState<Subadmin | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subadmin | null>(null);

  const fetchSubadmins = async () => {
    setLoading(true);
    try {
      const res = await getSubadmins({ search: search || undefined });
      setSubadmins(res.data);
      setStats(res.stats);
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to load subadmins",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchSubadmins, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleStatus = async (subadmin: Subadmin) => {
    const nextStatus =
      subadmin.status === "activated" ? "suspended" : "activated";
    try {
      await updateSubadmin(subadmin._id, { status: nextStatus });
      addToast("success", `Subadmin ${nextStatus}`);
      fetchSubadmins();
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to update status",
      );
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || newPassword.length < 6) {
      addToast("error", "Password must be at least 6 characters");
      return;
    }
    try {
      await resetSubadminPassword(resetTarget._id, newPassword);
      addToast("success", "Password reset successfully");
      setResetTarget(null);
      setNewPassword("");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to reset password",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubadmin(deleteTarget._id);
      addToast("success", "Subadmin deleted");
      setDeleteTarget(null);
      fetchSubadmins();
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to delete subadmin",
      );
    }
  };

  return (
    <div className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Lato',_sans-serif]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-body">
              Access Control
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0f172a] dark:text-heading">
              Subadmins
            </h1>
            <p className="mt-1 text-sm text-body">
              Manage restricted staff accounts and their module permissions
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/subadmins/new")}
            className={`${primaryButton} w-full justify-center sm:w-auto`}
          >
            <Plus className="h-4 w-4" />
            New Subadmin
          </button>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)] flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-surface-strong/70 p-2.5">
              <Users className="h-5 w-5 text-body" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-body">
                Total
              </p>
              <p className="text-xl font-bold text-[#0f172a] dark:text-heading">
                {stats.total}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)] flex items-center gap-3">
            <div className="rounded-2xl border border-[#c9e0c4] bg-surface-strong/70 p-2.5">
              <ShieldCheck className="h-5 w-5 text-[#3a6a2a] dark:text-[#9cd18a]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-body">
                Active
              </p>
              <p className="text-xl font-bold text-[#0f172a] dark:text-heading">
                {stats.active}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)] flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-surface-strong/70 p-2.5">
              <ShieldOff className="h-5 w-5 text-[#7a3a3a] dark:text-[#ca9090]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-body">
                Suspended
              </p>
              <p className="text-xl font-bold text-[#0f172a] dark:text-heading">
                {stats.suspended}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className={inputClass}
          />
        </div>

        {/* Loading / empty state (shared by both layouts) */}
        {loading ? (
          <div className="rounded-2xl border border-border bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong py-10 text-center text-accent shadow-[0_4px_32px_rgba(139,100,40,0.10)]">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Loading...
          </div>
        ) : subadmins.length === 0 ? (
          <div className="rounded-2xl border border-border bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong py-10 text-center text-accent shadow-[0_4px_32px_rgba(139,100,40,0.10)]">
            No subadmins found
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-border bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong shadow-[0_4px_32px_rgba(139,100,40,0.10)] md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border text-left text-xs font-semibold uppercase tracking-widest text-body">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Permissions</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede0c0]">
                  {subadmins.map((subadmin) => {
                    const cfg = statusConfig[subadmin.status];
                    return (
                      <tr
                        key={subadmin._id}
                        className="transition-colors duration-150 hover:bg-surface-strong"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-accent to-accent-hover text-sm font-semibold text-accent-foreground">
                              {subadmin.firstName?.[0]}
                              {subadmin.lastName?.[0]}
                            </div>
                            <span className="font-medium text-heading">
                              {subadmin.firstName} {subadmin.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-body">
                          {subadmin.email}
                        </td>
                        <td className="px-4 py-3 text-body">
                          {subadmin.permissions.length} permission
                          {subadmin.permissions.length === 1 ? "" : "s"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleStatus(subadmin)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="Edit"
                              onClick={() =>
                                navigate(
                                  `/admin/subadmins/${subadmin._id}/edit`,
                                )
                              }
                              className={iconButton}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              title="Reset password"
                              onClick={() => setResetTarget(subadmin)}
                              className={iconButton}
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => setDeleteTarget(subadmin)}
                              className={iconButton}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="space-y-3 md:hidden">
              {subadmins.map((subadmin) => {
                const cfg = statusConfig[subadmin.status];
                return (
                  <div
                    key={subadmin._id}
                    className="rounded-2xl border border-border bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong p-4 shadow-[0_4px_20px_rgba(139,100,40,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-accent to-accent-hover text-sm font-semibold text-accent-foreground">
                          {subadmin.firstName?.[0]}
                          {subadmin.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-heading">
                            {subadmin.firstName} {subadmin.lastName}
                          </p>
                          <p className="truncate text-xs text-body">
                            {subadmin.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(subadmin)}
                        className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                        />
                        {cfg.label}
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-border bg-surface-strong px-3 py-2 text-xs text-body">
                      {subadmin.permissions.length} permission
                      {subadmin.permissions.length === 1 ? "" : "s"} granted
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/subadmins/${subadmin._id}/edit`)
                        }
                        className={`${iconButton} h-9 w-9`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setResetTarget(subadmin)}
                        className={`${iconButton} h-9 w-9`}
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(subadmin)}
                        className={`${iconButton} h-9 w-9`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-border bg-surface-strong p-5 shadow-[0_30px_80px_rgba(74,50,24,0.24)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0f172a] dark:text-heading">
                Reset Password
              </h3>
              <button
                onClick={() => {
                  setResetTarget(null);
                  setNewPassword("");
                }}
                className="rounded-2xl border border-border bg-surface-strong p-1.5 text-body hover:bg-surface-strong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-sm text-body">
              Setting a new password for{" "}
              <span className="font-medium text-heading">
                {resetTarget.firstName} {resetTarget.lastName}
              </span>
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="admin-input w-full rounded-2xl px-4 py-2.5 text-sm focus:outline-none"
            />
            <button
              onClick={handleResetPassword}
              className={`${primaryButton} mt-4 w-full justify-center`}
            >
              Reset Password
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-border bg-surface-strong p-5 shadow-[0_30px_80px_rgba(74,50,24,0.24)]">
            <h3 className="mb-2 text-base font-semibold text-[#0f172a] dark:text-heading">
              Delete Subadmin
            </h3>
            <p className="mb-4 text-sm text-body">
              This will permanently delete{" "}
              <span className="font-medium text-heading">
                {deleteTarget.firstName} {deleteTarget.lastName}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`${secondaryButton} flex-1`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`${dangerButton} flex-1`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubadminListPage;
