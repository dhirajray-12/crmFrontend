import { Wrench } from "lucide-react";

interface MaintenanceModeProps {
  message?: string;
}

const MaintenanceMode = ({ message }: MaintenanceModeProps) => (
  <div className="min-h-screen bg-linear-to-br from-accent to-accent-hover px-4 py-12">
    <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-[32px] border border-border bg-surface-strong/80 p-8 text-center shadow-[0_30px_80px_rgba(115,87,28,0.15)] backdrop-blur">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/12">
          <Wrench className="h-8 w-8 text-body" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-accent">
          Maintenance Mode
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-heading">
          Platform temporarily unavailable
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-body">
          {message ||
            "The platform is currently under maintenance. Please try again later or contact support for updates."}
        </p>
      </div>
    </div>
  </div>
);

export default MaintenanceMode;
