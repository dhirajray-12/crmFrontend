export const PageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="client-theme-surface h-40 overflow-hidden rounded-2xl">
        <div className="h-full w-full bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-white/[0.08]"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="client-theme-surface h-32 rounded-xl bg-surface-strong/[0.04]"
          ></div>
        ))}
      </div>

      {/* Chart Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="client-theme-surface h-96 rounded-2xl bg-surface-strong/[0.04] lg:col-span-2"></div>
        <div className="client-theme-surface h-96 rounded-2xl bg-surface-strong/[0.04]"></div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-3">
        <div className="h-12 rounded-lg bg-surface-strong/[0.06]"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="client-theme-surface h-16 rounded-lg bg-surface-strong/[0.04]"></div>
        ))}
      </div>
    </div>
  );
};

// Dashboard-specific skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Skeleton */}
      <div className="client-theme-surface h-32 rounded-2xl bg-gradient-to-r from-accent/10 via-white/[0.04] to-accent-hover/10"></div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="client-theme-surface h-40 rounded-2xl bg-surface-strong/[0.04]"></div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="client-theme-surface h-80 rounded-2xl bg-surface-strong/[0.04]"></div>

      {/* Transactions Table Skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-48 rounded-lg bg-surface-strong/[0.08]"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="client-theme-surface h-20 rounded-xl bg-surface-strong/[0.04]"></div>
        ))}
      </div>
    </div>
  );
};

// Table skeleton for lists
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 mb-4">
        {Array(columns)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-8 rounded bg-surface-strong/[0.08] flex-1"></div>
          ))}
      </div>
      {/* Rows */}
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex gap-4 mb-3">
            {Array(columns)
              .fill(0)
              .map((_, j) => (
                <div
                  key={j}
                  className="client-theme-surface h-12 rounded bg-surface-strong/[0.04] flex-1"
                ></div>
              ))}
          </div>
        ))}
    </div>
  );
};

// Card skeleton for account cards
export const AccountCardSkeleton = () => {
  return (
    <div className="client-theme-surface rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-xl bg-surface-strong/[0.08]"></div>
        <div className="flex-1">
          <div className="mb-2 h-5 w-3/4 rounded bg-surface-strong/[0.08]"></div>
          <div className="h-3 w-1/2 rounded bg-surface-strong/[0.06]"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 rounded bg-surface-strong/[0.08]"></div>
        <div className="h-4 w-5/6 rounded bg-surface-strong/[0.06]"></div>
        <div className="h-4 w-4/6 rounded bg-surface-strong/[0.05]"></div>
      </div>
    </div>
  );
};

// List skeleton for virtualized lists
export const ListSkeleton = ({ items = 5 }: { items?: number }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array(items)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="client-theme-surface h-24 rounded-xl bg-surface-strong/[0.04]"></div>
        ))}
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton = () => {
  return (
    <div className="client-theme-surface rounded-2xl p-6 animate-pulse">
      <div className="mb-6 h-6 w-48 rounded bg-surface-strong/[0.08]"></div>
      <div className="h-64 rounded-xl bg-surface-strong/[0.04]"></div>
      <div className="flex gap-4 mt-4">
        <div className="h-4 w-24 rounded bg-surface-strong/[0.08]"></div>
        <div className="h-4 w-24 rounded bg-surface-strong/[0.06]"></div>
        <div className="h-4 w-24 rounded bg-surface-strong/[0.05]"></div>
      </div>
    </div>
  );
};

// Button skeleton
export const ButtonSkeleton = ({ width = "w-32" }: { width?: string }) => {
  return (
    <div
      className={`h-10 ${width} animate-pulse rounded-lg bg-surface-strong/[0.08]`}
    ></div>
  );
};
