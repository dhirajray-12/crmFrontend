export const TableHeader = () => {
  return (
    <thead className="bg-surface-strong/[0.02]">
      <tr>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Account
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Method
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Amount
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Initiated
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Processed
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Status
        </th>
      </tr>
    </thead>
  );
};
