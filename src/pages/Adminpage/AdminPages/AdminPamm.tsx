import { useEffect, useState } from "react";
import { PieChart, Wallet, Users, Clock3, Plus, Search } from "lucide-react";
import { adminPammApi, type PammFund, type PammTransaction } from "@/API/pammApi";
import { useToastStore } from "@/Store/toast.store";
import { formatCurrency } from "@/utils/dashboardUtils";
import { StatCard } from "@/AdminComponents/AdminPamm/StatCard";
import { FundFormModal } from "@/AdminComponents/AdminPamm/FundFormModal";
import { FundDetailDrawer } from "@/AdminComponents/AdminPamm/FundDetailDrawer";
import { RequestsTable } from "@/AdminComponents/AdminPamm/RequestsTable";

type Tab = "funds" | "investments" | "redemptions";

const inputClass = "admin-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-2.5 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-transform hover:-translate-y-0.5";
const tabButton = (active: boolean) =>
  `rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
    active ? "bg-accent text-heading" : "bg-surface-strong text-body hover:bg-surface"
  }`;

const statusPill: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  inactive: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  closed: "bg-red-500/15 text-red-700 dark:text-red-300",
};

const AdminPamm = () => {
  const { addToast } = useToastStore();
  const [tab, setTab] = useState<Tab>("funds");
  const [stats, setStats] = useState<any>(null);

  const [funds, setFunds] = useState<PammFund[]>([]);
  const [fundsLoading, setFundsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showFundForm, setShowFundForm] = useState(false);
  const [editingFund, setEditingFund] = useState<PammFund | null>(null);
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);

  const [investments, setInvestments] = useState<PammTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<PammTransaction[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setStats(await adminPammApi.getStats());
    } catch {
      // stat row is non-critical, ignore failures silently
    }
  };

  const loadFunds = async () => {
    setFundsLoading(true);
    try {
      const res = await adminPammApi.getFunds({ search: search || undefined });
      setFunds(res.data);
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to load funds");
    } finally {
      setFundsLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const [inv, red] = await Promise.all([
        adminPammApi.getInvestmentRequests({ status: "pending" }),
        adminPammApi.getRedemptionRequests({ status: "pending" }),
      ]);
      setInvestments(inv.data);
      setRedemptions(red.data);
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to load requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadFunds, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const refreshAll = () => {
    loadStats();
    loadFunds();
    loadRequests();
  };

  const handleApproveInvestment = async (id: string) => {
    setBusyId(id);
    try {
      const res = await adminPammApi.approveInvestment(id);
      addToast(res.success ? "success" : "error", res.message);
      refreshAll();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Approval failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectInvestment = async (id: string) => {
    const remarks = prompt("Reason for rejection (optional):") || undefined;
    setBusyId(id);
    try {
      await adminPammApi.rejectInvestment(id, remarks);
      addToast("success", "Request rejected");
      refreshAll();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Rejection failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveRedemption = async (id: string) => {
    setBusyId(id);
    try {
      const res = await adminPammApi.approveRedemption(id);
      addToast(res.success ? "success" : "error", res.message);
      refreshAll();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Approval failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectRedemption = async (id: string) => {
    const remarks = prompt("Reason for rejection (optional):") || undefined;
    setBusyId(id);
    try {
      await adminPammApi.rejectRedemption(id, remarks);
      addToast("success", "Request rejected");
      refreshAll();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Rejection failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-heading">PAMM Management</h1>
          <p className="text-sm text-subtle">Manage pooled trading funds, investors and settlements.</p>
        </div>
        <button className={primaryButton} onClick={() => { setEditingFund(null); setShowFundForm(true); }}>
          <Plus className="h-4 w-4" /> New Fund
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Funds" value={stats?.activeFunds ?? "—"} icon={PieChart} />
        <StatCard label="Total AUM" value={formatCurrency(stats?.totalAum || 0)} icon={Wallet} />
        <StatCard label="Investors" value={stats?.totalInvestors ?? "—"} icon={Users} />
        <StatCard
          label="Pending Requests"
          value={(stats?.pendingInvestments || 0) + (stats?.pendingRedemptions || 0)}
          icon={Clock3}
          accent="text-amber-600 dark:text-amber-300"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={tabButton(tab === "funds")} onClick={() => setTab("funds")}>
          Funds
        </button>
        <button className={tabButton(tab === "investments")} onClick={() => setTab("investments")}>
          Investment Requests {investments.length > 0 && `(${investments.length})`}
        </button>
        <button className={tabButton(tab === "redemptions")} onClick={() => setTab("redemptions")}>
          Redemption Requests {redemptions.length > 0 && `(${redemptions.length})`}
        </button>
      </div>

      {tab === "funds" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              className={inputClass}
              placeholder="Search by fund, manager or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface-strong">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase text-subtle">
                <tr>
                  <th className="px-4 py-3">Fund</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">NAV</th>
                  <th className="px-4 py-3">AUM</th>
                  <th className="px-4 py-3">Investors</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fundsLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-subtle">
                      Loading...
                    </td>
                  </tr>
                )}
                {!fundsLoading && funds.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-subtle">
                      No PAMM funds yet
                    </td>
                  </tr>
                )}
                {!fundsLoading &&
                  funds.map((fund) => (
                    <tr
                      key={fund._id}
                      className="cursor-pointer hover:bg-surface"
                      onClick={() => setSelectedFundId(fund._id)}
                    >
                      <td className="px-4 py-3 font-medium text-heading">{fund.name}</td>
                      <td className="px-4 py-3 text-body">
                        {typeof fund.manager === "object"
                          ? `${fund.manager.firstName} ${fund.manager.lastName}`
                          : fund.manager}
                      </td>
                      <td className="px-4 py-3 text-body">{formatCurrency(fund.navPerUnit)}</td>
                      <td className="px-4 py-3 text-body">{formatCurrency(fund.aum)}</td>
                      <td className="px-4 py-3 text-body">{fund.totalInvestors}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusPill[fund.status]}`}>
                          {fund.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="text-xs font-semibold text-accent hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFund(fund);
                            setShowFundForm(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "investments" && (
        <RequestsTable
          requests={investments}
          loading={requestsLoading}
          onApprove={handleApproveInvestment}
          onReject={handleRejectInvestment}
          busyId={busyId}
        />
      )}

      {tab === "redemptions" && (
        <RequestsTable
          requests={redemptions}
          loading={requestsLoading}
          onApprove={handleApproveRedemption}
          onReject={handleRejectRedemption}
          busyId={busyId}
        />
      )}

      {showFundForm && (
        <FundFormModal
          fund={editingFund}
          onClose={() => setShowFundForm(false)}
          onSaved={() => {
            setShowFundForm(false);
            refreshAll();
          }}
        />
      )}

      {selectedFundId && (
        <FundDetailDrawer
          fundId={selectedFundId}
          onClose={() => setSelectedFundId(null)}
          onChanged={refreshAll}
        />
      )}
    </div>
  );
};

export default AdminPamm;
