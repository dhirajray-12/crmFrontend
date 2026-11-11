import {
  AlertCircle,
  CheckCircle,
  Copy,
  Facebook,
  Gift,
  Loader2,
  MessageCircle,
  TrendingUp,
  Twitter,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface IBConfiguration {
  _id: string;
  referralCode: string;
  status: string;
  level: number;
  maximumCommission?: number | null;
  isPendingAssignment?: boolean;
  parentDetails?: {
    name: string;
    email: string;
    referralCode: string;
    level: number;
  };
}

interface DashboardSummary {
  totalCommission: number;
  withdrawableBalance: number;
  totalWithdrawals: number;
  partnersCount: number;
}

interface ReferData {
  ibConfig: IBConfiguration | null;
  dashboardStats: DashboardSummary | null;
}

const fetchReferData = async (): Promise<ReferData> => {
  const authHeaders = {
    "Content-Type": "application/json",
    "x-active-role": sessionStorage.getItem("active_role") || "",
  };

  const configRes = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/ibclients/ib-configurations/my-code`,
    { headers: authHeaders, credentials: "include" },
  );
  const configData = await configRes.json();

  if (!configData.success || !configData.ibConfiguration) {
    // User doesn't have IB configuration yet — not an error state.
    return { ibConfig: null, dashboardStats: null };
  }

  const statsRes = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/ibclients/ib-configurations/dashboard`,
    { headers: authHeaders, credentials: "include" },
  );
  const statsData = await statsRes.json();

  return {
    ibConfig: configData.ibConfiguration,
    dashboardStats: statsData.success && statsData.summary ? statsData.summary : null,
  };
};

export default function Refer() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const {
    data,
    isLoading: loading,
    error: fetchQueryError,
  } = useQuery({
    queryKey: ["referIbConfig"],
    queryFn: fetchReferData,
    staleTime: 30 * 1000,
  });
  const ibConfig = data?.ibConfig ?? null;
  const dashboardStats = data?.dashboardStats ?? null;
  const error = fetchQueryError ? "Failed to load referral information" : createError;

  const createIBConfiguration = async () => {
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ibclients/ib-configurations/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create referral code");
      }

      // Refresh the configuration
      await queryClient.invalidateQueries({ queryKey: ["referIbConfig"] });
    } catch (err: any) {
      console.error("Error creating IB configuration:", err);
      setCreateError(err.message || "Failed to create referral code");
    } finally {
      setCreating(false);
    }
  };

  const getReferralLink = () => {
    if (!ibConfig || !ibConfig.referralCode) return "";
    const baseUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
    return `${baseUrl}/signup/${ibConfig.referralCode}`;
  };

  const copyToClipboard = () => {
    const link = getReferralLink();
    if (!link) return;

    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="client-theme-bg flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-heading animate-spin mx-auto mb-4" />
          <p className="text-heading/80">Loading your referral information...</p>
        </div>
      </div>
    );
  }

  // No IB configuration - show create button
  if (!ibConfig || !ibConfig.referralCode) {
    return (
      <div className="client-theme-bg relative min-h-screen overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-12">
          <div className="client-theme-surface rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Gift className="w-10 h-10 text-heading" />
            </div>

            <h2 className="text-4xl font-bold text-heading mb-4">
              Join Our Referral Program
            </h2>
            <p className="text-xl text-heading/80 mb-8">
              Create your unique referral code and start earning rewards by
              inviting friends!
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-100 text-sm mb-6 flex items-center gap-2 justify-center">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              onClick={createIBConfiguration}
              disabled={creating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 text-heading font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Your Code...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  Create My Referral Code
                </>
              )}
            </button>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-xl font-bold text-heading mb-4">Benefits:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-surface-strong/10 backdrop-blur-md rounded-2xl p-4 border border-border">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">10%</p>
                  <p className="text-heading/70 text-sm">Friends Get Discount</p>
                </div>
                <div className="bg-surface-strong/10 backdrop-blur-md rounded-2xl p-4 border border-border">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">$10</p>
                  <p className="text-heading/70 text-sm">You Earn Per Referral</p>
                </div>
                <div className="bg-surface-strong/10 backdrop-blur-md rounded-2xl p-4 border border-border">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">∞</p>
                  <p className="text-heading/70 text-sm">Unlimited Earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const referralLink = getReferralLink();

  return (
    <div className="client-theme-bg relative min-h-screen overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-surface-strong/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 mb-6 shadow-lg">
            <svg
              className="w-5 h-5 text-yellow-700 dark:text-yellow-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-heading font-medium">Referral Program</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-heading mb-4 leading-tight">
            GIVE 10%,
            <br />
            <span className="bg-gradient-to-r from-gray-200 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              GET $10 USD
            </span>
          </h1>
          <p className="text-xl text-heading/90 max-w-2xl mx-auto">
            Share the love and earn rewards. Your friends get a discount, you
            get cash!
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-100 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {ibConfig.isPendingAssignment && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 text-amber-100 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Your maximum commission is awaiting admin approval. Your link still
              works — you just won't earn commission until it's assigned.
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div className="client-theme-surface rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift className="w-6 h-6 text-heading" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">
                    Your Referral Link
                  </h2>
                  <p className="text-heading/70 text-sm">
                    Code:{" "}
                    <span className="font-mono font-bold text-yellow-700 dark:text-yellow-300">
                      {ibConfig.referralCode}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-surface-strong/10 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-3 rounded-xl bg-gradient-to-r from-accent to-accent-hover hover:from-accent hover:to-accent-hover transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {copied ? (
                      <CheckCircle className="text-heading w-5 h-5" />
                    ) : (
                      <Copy className="text-heading w-5 h-5" />
                    )}
                  </button>
                </div>

                {copied && (
                  <div className="rounded-xl border border-accent/30 bg-accent/20 px-4 py-2 text-center text-sm text-accent">
                    ✓ Link copied to clipboard!
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-heading/70 text-sm mb-3">
                    Share via social media:
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent("Join me and earn rewards! " + referralLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover py-3 text-accent-foreground transition-all duration-300 hover:scale-105 hover:from-accent hover:to-accent-hover shadow-lg"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium text-sm">WhatsApp</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Facebook className="w-5 h-5 text-heading" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=Join%20me%20and%20earn%20rewards!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-accent hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Twitter className="w-5 h-5 text-heading" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="client-theme-surface rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-accent-hover rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-heading" />
                </div>
                <h2 className="text-2xl font-bold text-heading">Your Stats</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-strong/10 backdrop-blur-md rounded-2xl p-4 border border-border">
                  <p className="text-heading/70 text-sm mb-1">Total Referrals</p>
                  <p className="text-4xl font-bold text-heading">
                    {dashboardStats?.partnersCount || 0}
                  </p>
                </div>
                <div className="bg-surface-strong/10 backdrop-blur-md rounded-2xl p-4 border border-border">
                  <p className="text-heading/70 text-sm mb-1">Earnings</p>
                  <p className="text-4xl font-bold text-heading">
                    ${dashboardStats?.totalCommission?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
              {dashboardStats && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-heading/70">Withdrawable Balance:</span>
                    <span className="text-heading font-bold">
                      $
                      {dashboardStats.withdrawableBalance?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-heading/70">Total Withdrawals:</span>
                    <span className="text-heading font-bold">
                      ${dashboardStats.totalWithdrawals?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              )}
              {(!dashboardStats || dashboardStats.partnersCount === 0) && (
                <p className="text-heading/60 text-sm mt-4 text-center">
                  Start sharing your link to see your earnings grow!
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="client-theme-surface rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-heading" />
                </div>
                <h2 className="text-2xl font-bold text-heading">How It Works</h2>
              </div>

              <div className="space-y-6">
                <div className="relative pl-12">
                  <div className="absolute left-0 top-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-heading font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-heading mb-2">
                      Share Your Link
                    </h3>
                    <p className="text-heading/80">
                      Copy your unique referral link and share it with friends
                      via social media, email, or messaging apps.
                    </p>
                  </div>
                </div>

                <div className="pl-5">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-white/10 ml-5"></div>
                </div>

                <div className="relative pl-12">
                  <div className="absolute left-0 top-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-accent-hover rounded-full flex items-center justify-center text-heading font-bold text-lg shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-heading mb-2">
                      Friend Signs Up
                    </h3>
                    <p className="text-heading/80">
                      Your friend uses your link to sign up and gets{" "}
                      <span className="font-bold text-yellow-700 dark:text-yellow-300">10% off</span>{" "}
                      their first deposit.
                    </p>
                  </div>
                </div>

                <div className="pl-5">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-white/10 ml-5"></div>
                </div>

                <div className="relative pl-12">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-lg font-bold text-accent-foreground shadow-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-heading mb-2">
                      You Get Rewarded
                    </h3>
                    <p className="text-heading/80">
                      You'll receive{" "}
                      <span className="font-bold text-yellow-700 dark:text-yellow-300">$10 USD</span>{" "}
                      credited directly to your account. It's that simple!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/20 to-orange-500/20 p-8 text-center shadow-2xl backdrop-blur-xl">
              <svg
                className="w-12 h-12 text-yellow-700 dark:text-yellow-300 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-2xl font-bold text-heading mb-2">
                Start Earning Today!
              </h3>
              <p className="text-heading/80 mb-6">
                Every friend you refer brings you closer to more rewards. Share
                now and watch your earnings grow!
              </p>
              <button
                onClick={copyToClipboard}
                className="w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-heading font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                Copy Link & Share Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
