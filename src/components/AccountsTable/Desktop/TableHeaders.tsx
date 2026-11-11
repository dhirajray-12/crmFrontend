import React from "react";
import type { AccountTableHeaderProps } from "@/types/accounts.types";

export const TableHeaders: React.FC<AccountTableHeaderProps> = ({
  headers,
}) => {
  return (
    <thead className="bg-surface-strong/[0.03]">
      <tr>
        {headers.map((header, index) => (
          <th
            key={`header-${index}-${header}`}
            className={`whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle ${
              header === "Actions" ? "text-center" : "text-left"
            }`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};
