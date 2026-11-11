import { ShieldAlert } from "lucide-react";

const AdminSuspended = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(190,120,92,0.22),_transparent_50%),linear-gradient(180deg,#fff7ef_0%,#f3e3d2_100%)] px-4 py-12">
    <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-[32px] border border-border bg-surface-strong/80 p-8 text-center shadow-[0_30px_80px_rgba(116,52,35,0.18)] backdrop-blur">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8f473c]/10">
          <ShieldAlert className="h-8 w-8 text-[#8f473c]" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#a66a57]">
          Access Suspended
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-[#3b251d]">
          You have been suspended due to payment
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-body">
          Your admin area is locked until the pending payment issue is resolved by the
          superadmin. Contact the superadmin for reactivation.
        </p>
      </div>
    </div>
  </div>
);

export default AdminSuspended;
