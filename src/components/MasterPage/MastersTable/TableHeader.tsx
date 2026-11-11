export const TableHeader = () => {
  return (
    <thead className="border-b border-border bg-surface-strong/[0.04]">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Nickname
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Account
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Status
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Commission
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Copiers
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Total Profit
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
          Actions
        </th>
      </tr>
    </thead>
  );
};
