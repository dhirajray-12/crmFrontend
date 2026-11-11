import { Headset, Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => (
  <section className="rounded-[30px] border border-border bg-surface p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08),0_30px_70px_rgba(116,93,56,0.12)] ring-1 ring-white/65 dark:ring-white/10 sm:p-6">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
          <Headset className="h-3.5 w-3.5" />
          Support
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-body">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-strong/75 p-4">
          <div className="flex items-center gap-2 text-body">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Tone
            </span>
          </div>
          <p className="mt-2 text-sm text-body">
            Warm control-desk theme, consistent with admin operations.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-strong/75 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-body">
            Workflow
          </p>
          <p className="mt-2 text-sm text-body">
            Review tickets, manage status and conversations.
          </p>
        </div>
      </div>
    </div>
  </section>
);
