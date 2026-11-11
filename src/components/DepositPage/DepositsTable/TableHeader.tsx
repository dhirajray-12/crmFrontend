export const TableHeader = () => {
    return (
        <thead className="sticky top-0 z-10 bg-surface backdrop-blur-sm shadow-sm">
            <tr className="border-b border-border">
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Account
                </th>
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Type
                </th>
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Method
                </th>
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Amount
                </th>
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Date Initiated
                </th>
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Processed Date
                </th>
                <th className="border-r border-border px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Time Taken
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium uppercase tracking-wider text-heading">
                    Status
                </th>
            </tr>
        </thead>
    );
};
