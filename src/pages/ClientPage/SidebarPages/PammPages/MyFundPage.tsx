import { useEffect, useState } from "react";
import { LineChart, Users } from "lucide-react";
import { clientPammApi, type PammFund, type PammInvestment } from "@/API/pammApi";
import { useToastStore } from "@/Store/toast.store";
import { formatCurrency } from "@/utils/dashboardUtils";

const personName = (p: any) => (p && typeof p === "object" ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "—");

const MyFundPage = () => {
  const { addToast } = useToastStore();
  const [funds, setFunds] = useState<PammFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [investors, setInvestors] = useState<PammInvestment[]>([]);
  const [investorsLoading, setInvestorsLoading] = useState(false);

  useEffect(() => {
    clientPammApi
      .getMyManagedFunds()
      .then((data) => {
        setFunds(data);
        if (data.length > 0) setSelectedFundId(data[0]._id);
      })
      .catch(() => addToast("error", "Failed to load your funds"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedFundId) return;
    setInvestorsLoading(true);
    clientPammApi
      .getMyFundInvestors(selectedFundId)
      .then(setInvestors)
      .catch(() => addToast("error", "Failed to load investors"))
      .finally(() => setInvestorsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFundId]);

  const selectedFund = funds.find((f) => f._id === selectedFundId);

  if (loading) {
    return <div className="p-6 text-sm text-subtle">Loading...</div>;
  }

  if (funds.length === 0) {
    return (
      <div className="space-y-2 p-4 md:p-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-heading">
          <LineChart className="h-6 w-6 text-accent" /> My Fund
        </h1>
        <p className="text-sm text-subtle">
          You are not currently designated as a PAMM fund manager. Contact support if you'd like to
          offer a fund to other investors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-heading">
        <LineChart className="h-6 w-6 text-accent" /> My Fund
      </h1>

      {funds.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {funds.map((f) => (
            <button
              key={f._id}
              onClick={() => setSelectedFundId(f._id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                f._id === selectedFundId ? "bg-accent text-heading" : "bg-surface-strong text-body"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {selectedFund && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface-strong p-4">
              <p className="text-xs text-subtle">NAV / Unit</p>
              <p className="text-lg font-semibold text-heading">{formatCurrency(selectedFund.navPerUnit)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-strong p-4">
              <p className="text-xs text-subtle">AUM</p>
              <p className="text-lg font-semibold text-heading">{formatCurrency(selectedFund.aum)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-strong p-4">
              <p className="text-xs text-subtle">Investors</p>
              <p className="text-lg font-semibold text-heading">{selectedFund.activeInvestorCount ?? selectedFund.totalInvestors}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-strong p-4">
              <p className="text-xs text-subtle">Fees Earned</p>
              <p className="text-lg font-semibold text-heading">{formatCurrency(selectedFund.totalFeesEarned || 0)}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-heading">
              <Users className="h-4 w-4" /> Investors
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface-strong">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase text-subtle">
                  <tr>
                    <th className="px-4 py-3">Investor</th>
                    <th className="px-4 py-3">Units</th>
                    <th className="px-4 py-3">Principal</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {investorsLoading && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-subtle">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!investorsLoading && investors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-subtle">
                        No investors yet
                      </td>
                    </tr>
                  )}
                  {!investorsLoading &&
                    investors.map((inv) => (
                      <tr key={inv._id}>
                        <td className="px-4 py-3 text-body">{personName(inv.investor)}</td>
                        <td className="px-4 py-3 text-body">{inv.units.toFixed(4)}</td>
                        <td className="px-4 py-3 text-body">{formatCurrency(inv.principalInvested)}</td>
                        <td className="px-4 py-3 text-subtle">{new Date(inv.joinedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyFundPage;
