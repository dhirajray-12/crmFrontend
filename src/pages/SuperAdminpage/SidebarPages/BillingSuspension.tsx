import {
  useBillingSuspension,
  useUpdateBillingSuspensionPolicy,
  useUpdateManualSuspension,
} from "@/hooks/useBillingSuspension";
import { useToastStore } from "@/Store/toast.store";
import { AlertTriangle, BellRing, CalendarClock, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const inputCls =
  "w-full rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading outline-none transition focus:border-accent focus:ring-2 focus:ring-border";

const BillingSuspensionPage = () => {
  const { data, isLoading } = useBillingSuspension();
  const updatePolicy = useUpdateBillingSuspensionPolicy();
  const updateManualSuspension = useUpdateManualSuspension();
  const addToast = useToastStore((state) => state.addToast);

  const [managedAdminId, setManagedAdminId] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [dueReminderDays, setDueReminderDays] = useState("3");
  const [gracePeriodDays, setGracePeriodDays] = useState("2");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [adminSuspendedMessage, setAdminSuspendedMessage] = useState("");
  const [manualReason, setManualReason] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    setManagedAdminId(data.billingSuspension.managedAdminId || "");
    setPaymentDueDate(data.billingSuspension.paymentDueDate?.slice(0, 10) || "");
    setDueReminderDays(String(data.billingSuspension.dueReminderDays ?? 3));
    setGracePeriodDays(String(data.billingSuspension.gracePeriodDays ?? 2));
    setMaintenanceMessage(data.billingSuspension.maintenanceMessage || "");
    setAdminSuspendedMessage(data.billingSuspension.adminSuspendedMessage || "");
    setManualReason(data.billingSuspension.manualReason || "");
  }, [data]);

  const selectedAdmin = useMemo(
    () => data?.admins.find((admin) => admin._id === managedAdminId) || null,
    [data?.admins, managedAdminId],
  );

  const handleSavePolicy = async () => {
    if (!managedAdminId) {
      addToast("error", "Select the billing admin first");
      return;
    }

    try {
      await updatePolicy.mutateAsync({
        managedAdminId,
        paymentDueDate: paymentDueDate || null,
        dueReminderDays: Number(dueReminderDays),
        gracePeriodDays: Number(gracePeriodDays),
        maintenanceMessage,
        adminSuspendedMessage,
      });
      addToast("success", "Billing suspension policy updated");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to update billing suspension policy",
      );
    }
  };

  const handleManualToggle = async (nextValue: boolean) => {
    try {
      await updateManualSuspension.mutateAsync({
        isManuallySuspended: nextValue,
        manualReason,
      });
      addToast(
        "success",
        nextValue ? "Manual suspension enabled" : "Manual suspension removed",
      );
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to update manual suspension",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page p-6">
        <div className="mx-auto max-w-6xl rounded-[30px] border border-border bg-surface-strong p-10 text-center text-body">
          Loading billing suspension controls...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="admin-hero rounded-[30px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px w-6 bg-accent" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-body">
                  Billing Control
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl lg:text-5xl">
                Admin Suspension
                <span className="block text-body">Payment Enforcement</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm tracking-wide text-body">
                Superadmin controls the admin payment due date, the reminder window,
                the grace period, and the manual suspension switch that locks admin,
                client, and public access while keeping superadmin access open.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface-strong/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.3em] text-body">
                  Status
                </div>
                <div className="mt-2 text-lg font-semibold text-heading">
                  {data?.currentState.isSuspended ? "Suspended" : "Active"}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface-strong/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.3em] text-body">
                  Billing Admin
                </div>
                <div className="mt-2 text-sm font-semibold text-heading">
                  {data?.currentState.managedAdmin
                    ? `${data.currentState.managedAdmin.firstName} ${data.currentState.managedAdmin.lastName}`
                    : "Not selected"}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface-strong/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.3em] text-body">
                  Due Date
                </div>
                <div className="mt-2 text-sm font-semibold text-heading">
                  {data?.currentState.dueDateKey || "Not scheduled"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-border bg-surface-strong p-6 shadow-[0_20px_45px_rgba(86,61,24,0.08)]">
            <div className="mb-6 flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-body" />
              <div>
                <h2 className="text-xl font-semibold text-heading">Policy Settings</h2>
                <p className="text-sm text-body">
                  Choose the billing admin and define reminder plus grace rules.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-body">
                  Billing Admin
                </label>
                <select
                  value={managedAdminId}
                  onChange={(event) => setManagedAdminId(event.target.value)}
                  className={inputCls}
                >
                  <option value="">Select admin</option>
                  {data?.admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.firstName} {admin.lastName} ({admin.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-body">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(event) => setPaymentDueDate(event.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-body">
                  Reminder Days Before Due
                </label>
                <input
                  type="number"
                  min="0"
                  value={dueReminderDays}
                  onChange={(event) => setDueReminderDays(event.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-body">
                  Grace Period Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={gracePeriodDays}
                  onChange={(event) => setGracePeriodDays(event.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="rounded-2xl border border-border bg-surface-strong p-4 text-sm text-body">
                {selectedAdmin ? (
                  <>
                    Notifications will be sent to <strong>{selectedAdmin.email}</strong>.
                  </>
                ) : (
                  "Select a billing admin to activate payment reminders and suspension tracking."
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-body">
                  Client And Public Maintenance Message
                </label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(event) => setMaintenanceMessage(event.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-body">
                  Admin Suspension Message
                </label>
                <textarea
                  rows={3}
                  value={adminSuspendedMessage}
                  onChange={(event) => setAdminSuspendedMessage(event.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSavePolicy}
                disabled={updatePolicy.isPending}
                className="rounded-2xl bg-linear-to-r from-accent to-accent-hover px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 disabled:opacity-60"
              >
                {updatePolicy.isPending ? "Saving..." : "Save Policy"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-border bg-surface-strong p-6 shadow-[0_20px_45px_rgba(86,61,24,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-body" />
                <div>
                  <h2 className="text-xl font-semibold text-heading">Manual Suspension</h2>
                  <p className="text-sm text-body">
                    Force lock access immediately, regardless of due date.
                  </p>
                </div>
              </div>

              <textarea
                rows={4}
                value={manualReason}
                onChange={(event) => setManualReason(event.target.value)}
                className={inputCls}
                placeholder="Reason shown to the suspended admin"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleManualToggle(true)}
                  disabled={updateManualSuspension.isPending}
                  className="rounded-2xl bg-linear-to-r from-[#8f473c] to-[#71231a] px-5 py-3 text-sm font-semibold text-heading disabled:opacity-60"
                >
                  Suspend Now
                </button>
                <button
                  onClick={() => handleManualToggle(false)}
                  disabled={updateManualSuspension.isPending}
                  className="rounded-2xl border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-heading disabled:opacity-60"
                >
                  Remove Manual Suspension
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-surface-strong p-6 shadow-[0_20px_45px_rgba(86,61,24,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <BellRing className="h-5 w-5 text-body" />
                <div>
                  <h2 className="text-xl font-semibold text-heading">Live State</h2>
                  <p className="text-sm text-body">
                    Current computed result from policy, due date, and manual override.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-heading">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-strong px-4 py-3">
                  <span>System status</span>
                  <span className="font-semibold">
                    {data?.currentState.isSuspended ? "Suspended" : "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-strong px-4 py-3">
                  <span>Suspension reason</span>
                  <span className="font-semibold capitalize">
                    {data?.currentState.reason.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-strong px-4 py-3">
                  <span>Days until due</span>
                  <span className="font-semibold">
                    {data?.currentState.daysUntilDue ?? "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-strong px-4 py-3">
                  <span>Overdue days</span>
                  <span className="font-semibold">
                    {data?.currentState.overdueDays ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface-strong p-6 shadow-[0_20px_45px_rgba(86,61,24,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-body" />
            <div>
              <h2 className="text-xl font-semibold text-heading">Admin Accounts</h2>
              <p className="text-sm text-body">
                Review which admin is currently connected to the billing suspension policy.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.25em] text-body">
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Billing Owner</th>
                </tr>
              </thead>
              <tbody>
                {data?.admins.map((admin) => (
                  <tr key={admin._id} className="border-b border-border text-heading">
                    <td className="px-4 py-4 font-medium">
                      {admin.firstName} {admin.lastName}
                    </td>
                    <td className="px-4 py-4">{admin.email}</td>
                    <td className="px-4 py-4 capitalize">{admin.status}</td>
                    <td className="px-4 py-4">
                      {admin.isManagedBillingAdmin ? "Selected" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BillingSuspensionPage;
