import { Crown, TrendingUp, Users } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: "users" | "profit" | "commission";
  color: "blue" | "emerald" | "purple" | "amber";
}

const colorMap = {
  blue: {
    icon: "bg-[#dbe8f4] dark:bg-surface-strong text-[#355877] dark:text-[#8eafcd]",
    bar: "from-[#7ea6c7] to-[#426a91]",
    chip: "text-[#355877] dark:text-[#8eafcd]",
  },
  emerald: {
    icon: "bg-[#deeee5] dark:bg-surface-strong text-[#3f6f53] dark:text-[#91caa9]",
    bar: "from-[#87b69a] to-[#4f7e62]",
    chip: "text-[#3f6f53] dark:text-[#91caa9]",
  },
  purple: {
    icon: "bg-[#e6e2f2] dark:bg-surface-strong text-[#595281] dark:text-[#9991ca]",
    bar: "from-[#9c95c6] to-[#6a6598]",
    chip: "text-[#595281] dark:text-[#9991ca]",
  },
  amber: {
    icon: "bg-surface-strong text-body",
    bar: "from-accent to-accent-hover",
    chip: "text-body",
  },
} as const;

const getIcon = (
  icon: StatCardProps["icon"],
  className: string,
) => {
  switch (icon) {
    case "users":
      return <Users className={className} />;
    case "profit":
      return <TrendingUp className={className} />;
    case "commission":
      return <Crown className={className} />;
  }
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}: StatCardProps) => {
  const accent = colorMap[color];

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-accent bg-surface p-5 shadow-[0_18px_36px_rgba(102,76,36,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_28px_44px_rgba(102,76,36,0.18)] dark:hover:shadow-[0_28px_44px_rgba(0,0,0,0.4)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${accent.bar}`} />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-body">
              {title}
            </div>
            <div className="mt-2 text-[2.2rem] font-black leading-none tracking-[-0.05em] text-heading">
              {value}
            </div>
          </div>
          <div className={`rounded-[18px] border border-white/80 dark:border-border p-3 shadow-sm ${accent.icon}`}>
            {getIcon(icon, "h-5 w-5")}
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-[rgba(255,250,241,0.7)] dark:bg-surface-strong px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accent.chip}`}>
            Live Summary
          </div>
          <p className="mt-2 text-sm leading-6 text-body">{subtitle}</p>
        </div>
      </div>
    </article>
  );
};
