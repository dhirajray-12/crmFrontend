import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  PieChart as PieChartIcon,
  RefreshCw,
  Users,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { useAPI } from "../../../API/api";

interface AccountDistribution {
  name: string;
  value: number;
  percentage: string;
}

interface DistributionResponse {
  success: boolean;
  data: AccountDistribution[];
}

interface SegmentItem {
  name: string;
  count: number;
  pct: number;
  color: string;
}

interface PaginatedAccount {
  _id: string;
  mt5Account: string;
  accountType: string;
  balance: number;
  equity: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

const COLORS = [
  "#b97d70",
  "#5f8e72",
  "#7ea6c7",
  "#7772a7",
  "#b48551",
  "#629497",
  "#9c95c6",
  "#c98d72",
  "#7da66f",
  "#507ea5",
  "#d2a86f",
  "#85659e",
  "#5a9ca8",
  "#d88f84",
  "#8da767",
  "#6a86b7",
];

const R = 80,
  THICK = 16,
  CX = 95,
  CY = 95;
const CIRC = 2 * Math.PI * R;
const PAGE_SIZE = 5;

function getColor(i: number) {
  return i < COLORS.length ? COLORS[i] : `hsl(${(i * 137.508) % 360},45%,55%)`;
}

function calcPct(value: number, total: number, raw: string): number {
  const n = parseFloat(raw);
  if (!isNaN(n)) return Math.round(n);
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ChartRadialLabel() {
  const { dashboardAPI } = useAPI();

  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const [modal, setModal] = useState<{ seg: SegmentItem; page: number } | null>(
    null,
  );
  const [modalAccounts, setModalAccounts] = useState<PaginatedAccount[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDistribution = useCallback(async () => {
    try {
      setLoading(true);
      const res =
        (await dashboardAPI.getClientDistribution()) as DistributionResponse;
      const dist = res.data || [];
      const tot = dist.reduce((s, d) => s + d.value, 0);
      const items: SegmentItem[] = dist
        .map((d, i) => ({
          name: d.name,
          count: d.value,
          pct: calcPct(d.value, tot, d.percentage),
          color: getColor(i),
        }))
        .sort((a, b) => b.count - a.count);
      setSegments(items);
      setTotal(tot);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load distribution");
    } finally {
      setLoading(false);
    }
  }, [dashboardAPI]);

  useEffect(() => {
    void fetchDistribution();
    const interval = setInterval(() => void fetchDistribution(), 60_000);
    const handler = () => void fetchDistribution();
    window.addEventListener("crm:admin-dashboard-refresh", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("crm:admin-dashboard-refresh", handler);
    };
  }, [fetchDistribution]);

  const fetchModalAccounts = useCallback(
    async (type: string, page: number) => {
      try {
        setModalLoading(true);
        const res = await dashboardAPI.getAccountsByType(type, page, PAGE_SIZE);
        if (res.success && res.data) {
          setModalAccounts(res.data.accounts);
          setTotalPages(res.data.pagination.pages);
        }
      } catch {
        /* silent */
      } finally {
        setModalLoading(false);
      }
    },
    [dashboardAPI],
  );

  const openModal = (seg: SegmentItem) => {
    setModal({ seg, page: 1 });
    void fetchModalAccounts(seg.name, 1);
  };

  const closeModal = () => {
    setModal(null);
    setModalAccounts([]);
  };

  const changePage = (dir: number) => {
    if (!modal) return;
    const next = modal.page + dir;
    setModal({ ...modal, page: next });
    void fetchModalAccounts(modal.seg.name, next);
  };

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    void fetchDistribution();
  };

  const buildSlices = () => {
    if (total === 0) return null;
    let offset = 0;
    return segments.map((seg, i) => {
      const dash = (seg.count / total) * CIRC - 2.5;
      const gap = CIRC - dash;
      const rot = (offset / total) * 360;
      offset += seg.count;
      return (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={seg.color}
          strokeWidth={THICK}
          strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
          strokeLinecap="round"
          transform={`rotate(${rot.toFixed(2)} ${CX} ${CY})`}
          style={{ cursor: "pointer", transition: "opacity .15s" }}
          onClick={() => openModal(seg)}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <title>
            {seg.name}: {seg.pct}%
          </title>
        </circle>
      );
    });
  };

  const top = segments[0];

  if (loading && segments.length === 0) {
    return (
      <>
        <style>{spinKeyframe}</style>
        <div
          style={{ ...S.card, alignItems: "center", justifyContent: "center" }}
        >
          <RefreshCw
            size={26}
            style={{
              color: "var(--accent-color)",
              animation: "crd-spin 1s linear infinite",
            }}
          />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div
        style={{
          ...S.card,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ fontSize: 14, color: "var(--status-red)" }}>{error}</p>
        <button onClick={handleRefresh} style={S.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        ${spinKeyframe}
        .crd-seg:hover{background:var(--surface-strong)!important}
        .crd-leg:hover{background:var(--surface-strong)!important}
        .crd-ref:hover{background:var(--surface-strong)!important}
        .crd-pg:not(:disabled):hover{background:var(--surface-strong)!important}
        .crd-list::-webkit-scrollbar{width:4px}
        .crd-list::-webkit-scrollbar-thumb{background:rgba(138,118,83,.22);border-radius:4px}
        .crd-mbody::-webkit-scrollbar{width:4px}
        .crd-mbody::-webkit-scrollbar-thumb{background:rgba(138,118,83,.22);border-radius:4px}
        @media(max-width:620px){
          .crd-body{grid-template-columns:1fr!important}
          .crd-chartcol{border-right:none!important;border-bottom:1px solid #ebdcb9!important;
            flex-direction:row!important;align-items:center!important;
            justify-content:space-between!important;padding:16px!important;gap:12px!important}
          .crd-ring-wrap{width:150px!important;height:150px!important}
          .crd-ring-svg{width:150px!important;height:150px!important}
          .crd-rc-pct{font-size:24px!important}
          .crd-legend{width:auto!important;flex:1!important;min-width:0!important}
          .crd-modal-box{width:calc(100vw - 32px)!important;max-width:100%!important}
        }
      `}</style>

      <div style={S.card}>
        {/* Header */}
        <div style={S.hdr}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.iconBox}>
              <PieChartIcon size={20} color="var(--accent-color)" />
            </div>
            <div>
              <div style={S.hTitle}>Client distribution</div>
              <div style={S.hSub}>Account mix &amp; segmentation</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              flexWrap: "wrap" as const,
            }}
          >
            <div style={S.pill}>
              <Users size={14} color="var(--body)" />
              <span style={S.pillVal}>{total.toLocaleString()}</span>
              <span style={S.pillLbl}>Total</span>
            </div>
            <div style={S.pill}>
              <Layers size={14} color="var(--body)" />
              <span style={S.pillVal}>{segments.length}</span>
              <span style={S.pillLbl}>Types</span>
            </div>
            <button
              className="crd-ref"
              onClick={handleRefresh}
              disabled={loading}
              style={S.refBtn}
              title="Refresh"
            >
              <RefreshCw
                size={15}
                color="var(--body)"
                style={spinning ? { animation: "crd-spin 0.6s linear" } : {}}
              />
            </button>
          </div>
        </div>

        {/* Body — left column is now 360px */}
        <div
          className="crd-body"
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Left: ring + legend */}
          <div
            className="crd-chartcol"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 24px",
              borderRight: "1px solid var(--border)",
              gap: 20,
              flexShrink: 0,
            }}
          >
            {/* Ring */}
            <div
              className="crd-ring-wrap"
              style={{
                position: "relative",
                width: 210,
                height: 210,
                flexShrink: 0,
              }}
            >
              <svg
                className="crd-ring-svg"
                width={210}
                height={210}
                viewBox="0 0 190 190"
                style={{ transform: "rotate(-90deg)" }}
              >
                {buildSlices()}
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  className="crd-rc-pct"
                  style={{
                    fontSize: 32,
                    fontWeight: 500,
                    color: "var(--heading)",
                    lineHeight: 1,
                  }}
                >
                  {top?.pct ?? 0}%
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--body)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginTop: 4,
                  }}
                >
                  {top?.name ?? "—"}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div
              className="crd-legend"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                width: "100%",
              }}
            >
              {segments.map((seg, i) => (
                <div
                  key={i}
                  className="crd-leg"
                  onClick={() => openModal(seg)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "5px 10px",
                    borderRadius: 7,
                    cursor: "pointer",
                    transition: "background .12s",
                  }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 3,
                      background: seg.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--heading)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {seg.name}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--heading)",
                      minWidth: 34,
                      textAlign: "right",
                    }}
                  >
                    {seg.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: segment list */}
          <div
            className="crd-list"
            style={{
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {segments.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "var(--body)",
                }}
              >
                No data available.
              </div>
            ) : (
              segments.map((seg, i) => (
                <div
                  key={i}
                  className="crd-seg"
                  onClick={() => openModal(seg)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom:
                      i < segments.length - 1 ? "1px solid #ebdcb9" : "none",
                    cursor: "pointer",
                    transition: "background .12s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: seg.color + "18",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Users size={16} color={seg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--heading)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {seg.name}
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 2,
                        background: "var(--surface)",
                        marginTop: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 2,
                          background: seg.color,
                          width: `${seg.pct}%`,
                          transition: "width .6s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{ fontSize: 12, color: "var(--body)", marginTop: 4 }}
                    >
                      {seg.count.toLocaleString()} accounts
                    </div>
                  </div>
                  <div
                    style={{ textAlign: "right", flexShrink: 0, minWidth: 44 }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "var(--heading)",
                      }}
                    >
                      {seg.pct}%
                    </div>
                    <ChevronRight
                      size={14}
                      color="var(--accent-color)"
                      style={{ marginTop: 2 }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Popup Modal (centered overlay) ──
          Rendered through a portal so its position:fixed is anchored to the
          real viewport, not to this card's DOM position - any ancestor with
          a CSS transform (e.g. this card's hover-lift effect) would
          otherwise become the fixed-position containing block, causing the
          backdrop to mis-cover the page and visibly jump/flicker as that
          ancestor's hover state toggles. */}
      {modal &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "rgba(22,32,51,.45)",
              display: "flex",
              alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="crd-modal-box"
            style={{
              // --surface-strong is intentionally translucent (72% opaque in
              // dark mode) for cards that sit on the page's own gradient
              // background - fine there, but it let the chart/text behind
              // this modal show through. --app-bg is the solid color the
              // shared Dialog component uses for exactly this reason.
              background: "var(--app-bg)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              width: 520,
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
              boxShadow: "0 20px 60px rgba(22,32,51,.18)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: modal.seg.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={16} color={modal.seg.color} />
                </div>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 600, color: "var(--heading)" }}
                  >
                    {modal.seg.name} Accounts
                  </div>
                  <div style={{ fontSize: 12, color: "var(--body)", marginTop: 1 }}>
                    {modal.seg.count.toLocaleString()} total · {modal.seg.pct}%
                    of all accounts
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--body)",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  transition: "background .12s",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                padding: "8px 20px",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 500,
                }}
              >
                Account / User
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 500,
                  textAlign: "right",
                }}
              >
                Balance / Equity
              </span>
            </div>

            {/* Modal body */}
            <div
              className="crd-mbody"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {modalLoading ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "3rem 0",
                  }}
                >
                  <RefreshCw
                    size={24}
                    color="var(--accent-color)"
                    style={{ animation: "crd-spin 1s linear infinite" }}
                  />
                </div>
              ) : modalAccounts.length > 0 ? (
                modalAccounts.map((acc) => (
                  <div
                    key={acc._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "11px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      background: "var(--surface-strong)",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--heading)",
                          fontFamily: "monospace",
                        }}
                      >
                        {acc.mt5Account || "N/A"}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "var(--body)", marginTop: 2 }}
                      >
                        {acc.user?.firstName} {acc.user?.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--subtle)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {acc.user?.email}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--subtle)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Balance
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--heading)",
                        }}
                      >
                        ${fmtMoney(acc.balance || 0)}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--subtle)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          marginTop: 4,
                        }}
                      >
                        Equity
                      </div>
                      <div style={{ fontSize: 12, color: "var(--body)" }}>
                        ${fmtMoney(acc.equity || 0)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--body)",
                    fontSize: 13,
                    padding: "3rem 0",
                  }}
                >
                  No accounts found.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderTop: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--body)" }}>
                Page <strong style={{ color: "var(--heading)" }}>{modal.page}</strong>{" "}
                of <strong style={{ color: "var(--heading)" }}>{totalPages}</strong> ·{" "}
                {modal.seg.count.toLocaleString()} total
              </span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  className="crd-pg"
                  disabled={modal.page <= 1 || modalLoading}
                  onClick={() => changePage(-1)}
                  style={S.pgBtn}
                >
                  <ChevronLeft size={14} />
                  <span style={{ fontSize: 12, marginLeft: 2 }}>Prev</span>
                </button>

                {/* Page number pills */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg =
                    totalPages <= 5
                      ? i + 1
                      : modal.page <= 3
                        ? i + 1
                        : modal.page >= totalPages - 2
                          ? totalPages - 4 + i
                          : modal.page - 2 + i;
                  return (
                    <button
                      key={pg}
                      className="crd-pg"
                      disabled={modalLoading}
                      onClick={() => {
                        setModal({ ...modal, page: pg });
                        void fetchModalAccounts(modal.seg.name, pg);
                      }}
                      style={{
                        ...S.pgBtn,
                        minWidth: 32,
                        justifyContent: "center",
                        background: pg === modal.page ? "var(--accent-color)" : "var(--surface)",
                        color: pg === modal.page ? "var(--accent-foreground)" : "var(--heading)",
                        borderColor: pg === modal.page ? "var(--accent-color)" : "var(--border)",
                        fontWeight: pg === modal.page ? 600 : 400,
                      }}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  className="crd-pg"
                  disabled={modal.page >= totalPages || modalLoading}
                  onClick={() => changePage(1)}
                  style={S.pgBtn}
                >
                  <span style={{ fontSize: 12, marginRight: 2 }}>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}

const spinKeyframe = `@keyframes crd-spin{to{transform:rotate(360deg)}}`;

const S = {
  card: {
    background: "var(--surface-strong)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    overflow: "hidden",
    height: 500,
    display: "flex",
    flexDirection: "column" as const,
  },
  hdr: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 22px",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface-strong)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hTitle: { fontSize: 16, fontWeight: 500, color: "var(--heading)" },
  hSub: { fontSize: 12, color: "var(--body)", marginTop: 2 },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },
  pillVal: { fontSize: 14, fontWeight: 500, color: "var(--heading)" },
  pillLbl: {
    fontSize: 11,
    color: "var(--body)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  refBtn: {
    width: 36,
    height: 36,
    border: "1px solid var(--border)",
    borderRadius: 9,
    background: "var(--surface)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background .15s",
  },
  retryBtn: {
    padding: "7px 20px",
    borderRadius: 999,
    background: "var(--accent-color)",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  pgBtn: {
    border: "1px solid var(--border)",
    background: "var(--surface)",
    borderRadius: 7,
    padding: "5px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "var(--heading)",
    transition: "background .12s",
    fontSize: 13,
  },
};
