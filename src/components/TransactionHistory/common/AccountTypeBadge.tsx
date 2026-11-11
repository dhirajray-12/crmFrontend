interface AccountTypeBadgeProps {
  type: string;
}

export const AccountTypeBadge = ({ type }: AccountTypeBadgeProps) => {
  return (
    <span className="inline-flex items-center rounded-lg border border-border bg-surface-strong/[0.04] px-2.5 py-1 text-xs font-semibold capitalize text-heading">
      {type}
    </span>
  );
};
