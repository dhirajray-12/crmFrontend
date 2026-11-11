export const TableHeader = () => {
  return (
    <thead className="bg-surface-strong/[0.02]">
      <tr>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          From
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          To
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Amount
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Date
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Status
        </th>
      </tr>
    </thead>
  );
};
