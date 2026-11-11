interface TableHeaderProps {
  filterType: "open" | "closed";
}

export const TableHeader = ({ filterType }: TableHeaderProps) => {
  return (
    <thead className="bg-surface-strong/[0.02]">
      <tr>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Account
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Symbol
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Type
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Volume
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Open Price
        </th>
        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Open Time
        </th>
        {filterType === "closed" && (
          <>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Close Price
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Close Time
            </th>
          </>
        )}
        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Profit/Loss
        </th>
      </tr>
    </thead>
  );
};
