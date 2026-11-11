import { AlertTriangle, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAPI } from "../../API/api";

interface RiskFactor {
  label: string;
  points: number;
  severity: "critical" | "warning" | "info";
}

interface RiskScoreData {
  clientId: string;
  score: number;
  level: "low" | "medium" | "high";
  factors: RiskFactor[];
  computedAt: string;
}

const LEVEL_META: Record<
  RiskScoreData["level"],
  { label: string; ringColor: string; textVar: string }
> = {
  low: { label: "Low risk", ringColor: "var(--status-green)", textVar: "var(--status-green)" },
  medium: { label: "Medium risk", ringColor: "#d99a7a", textVar: "#d99a7a" },
  high: { label: "High risk", ringColor: "var(--status-red)", textVar: "var(--status-red)" },
};

const SEVERITY_DOT: Record<RiskFactor["severity"], string> = {
  critical: "bg-[var(--status-red)]",
  warning: "bg-[#d99a7a]",
  info: "bg-accent",
};

export default function ClientRiskScorePanel({ clientId }: { clientId: string }) {
  const { clientAPI } = useAPI();
  const [data, setData] = useState<RiskScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.getRiskScore(clientId);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load risk score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm text-[var(--status-red)]">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  const meta = LEVEL_META[data.level];
  const circumference = 2 * Math.PI * 34;
  const dash = (Math.min(data.score, 100) / 100) * circumference;

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-subtle">
        A compliance/fraud-risk signal computed from KYC status, deposit/
        withdrawal behavior, device security flags, and support activity -
        not a credit score, and not a substitute for manual review.
      </p>

      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-surface p-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90">
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke="var(--border)"
              strokeWidth={6}
            />
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke={meta.ringColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black text-heading">{data.score}</span>
          </div>
        </div>

        <div>
          <div
            className="flex items-center gap-1.5 text-sm font-bold"
            style={{ color: meta.textVar }}
          >
            {data.level === "low" ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            {meta.label}
          </div>
          <p className="mt-1 text-xs text-subtle">
            {data.factors.length === 0
              ? "No risk signals detected."
              : `${data.factors.length} contributing factor${data.factors.length === 1 ? "" : "s"} below.`}
          </p>
        </div>
      </div>

      {data.factors.length > 0 && (
        <div className="space-y-2">
          {data.factors.map((factor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2 text-body">
                <span className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[factor.severity]}`} />
                {factor.label}
              </div>
              <span className="shrink-0 text-xs font-semibold text-subtle">
                +{factor.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
