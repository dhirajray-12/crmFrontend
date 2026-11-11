import { ChevronRight, Crown, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./PartnerDownlineGraph.css";

export interface DownlineGraphNode {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  status: string;
  level: number;
  isRoot?: boolean;
  maximumCommission: number | null;
  isPendingAssignment: boolean;
  children: DownlineGraphNode[];
}

const NODE_W = 208;
const NODE_H = 92;
const GAP_X = 96;
const GAP_Y = 40;
const SPACING_X = NODE_W + GAP_X;
const SPACING_Y = NODE_H + GAP_Y;
const PAD = 40;
// Alternating vertical stagger applied by depth so a chain of nodes waves up
// and down as it grows to the right, instead of running in a flat straight
// line - and so multi-child branches fan out with a bit of give too.
const ZIGZAG_Y = 30;
// When a generation would land past the visible frame, wrap it down onto a
// fresh band instead of forcing horizontal scroll - the same idea as text
// wrapping to the next line.
const BAND_GAP_Y = 70;
const MIN_COLS_PER_BAND = 2;

const STATUS_COLOR: Record<string, { ring: string; dot: string; label: string }> = {
  active: { ring: "border-[#3a6a2a]/60", dot: "bg-[#4fae3a]", label: "Active" },
  pending: { ring: "border-accent/60", dot: "bg-accent", label: "Pending" },
  inactive: { ring: "border-[#7a3a3a]/60", dot: "bg-[#c46a6a]", label: "Inactive" },
};

interface Positioned {
  node: DownlineGraphNode;
  x: number;
  y: number;
  depth: number;
  index: number;
  bandIndex: number;
  hasChildren: boolean;
  isCollapsed: boolean;
}

interface Edge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  wraps: boolean;
  delay: number;
}

function countLeaves(node: DownlineGraphNode, collapsed: Set<string>): number {
  const kids = collapsed.has(node.id) ? [] : node.children;
  if (kids.length === 0) return 1;
  return kids.reduce((sum, child) => sum + countLeaves(child, collapsed), 0);
}

// Grows left-to-right: depth drives which column a generation sits in,
// sibling order drives vertical stacking. Once a generation's column would
// fall outside `colsPerBand` (how many columns actually fit the visible
// frame width), it wraps onto a new band underneath - so a deep downline
// reads like wrapped text instead of demanding endless horizontal scroll.
function buildLayout(root: DownlineGraphNode, collapsed: Set<string>, colsPerBand: number) {
  const nodes: Positioned[] = [];
  const edges: Edge[] = [];
  let leafCursor = 0;
  let maxDepth = 0;

  const totalLeaves = Math.max(1, countLeaves(root, collapsed));
  const bandHeight = totalLeaves * SPACING_Y - GAP_Y + ZIGZAG_Y * 2;

  // Returns the node's *unwrapped* local y (leaf-order based) so a parent
  // that has children landing in a different band still centers correctly
  // over their pre-wrap positions, rather than inheriting their band offset.
  const visit = (node: DownlineGraphNode, depth: number, indexInLevel: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const isCollapsed = collapsed.has(node.id);
    const kids = !isCollapsed ? node.children : [];

    let localY: number;
    if (kids.length === 0) {
      localY = leafCursor * SPACING_Y;
      leafCursor += 1;
    } else {
      const childLocalYs = kids.map((child, i) => visit(child, depth + 1, i));
      localY = (childLocalYs[0] + childLocalYs[childLocalYs.length - 1]) / 2;
    }

    const zigzag = depth === 0 ? 0 : depth % 2 === 1 ? -ZIGZAG_Y : ZIGZAG_Y;
    const bandIndex = Math.floor(depth / colsPerBand);
    const colInBand = depth % colsPerBand;
    const x = colInBand * SPACING_X;
    const finalY = localY + zigzag + bandIndex * (bandHeight + BAND_GAP_Y);

    nodes.push({
      node,
      x,
      y: finalY,
      depth,
      index: indexInLevel,
      bandIndex,
      hasChildren: node.children.length > 0,
      isCollapsed,
    });

    if (!isCollapsed) {
      kids.forEach((child, i) => {
        const childLayout = nodes.find((n) => n.node.id === child.id);
        if (childLayout) {
          edges.push({
            id: `${node.id}->${child.id}`,
            x1: x + NODE_W,
            y1: finalY + NODE_H / 2,
            x2: childLayout.x,
            y2: childLayout.y + NODE_H / 2,
            wraps: childLayout.bandIndex !== bandIndex,
            delay: 0.15 + (depth + 1) * 0.06 + i * 0.02,
          });
        }
      });
    }

    return localY;
  };

  visit(root, 0, 0);

  const numBands = Math.floor(maxDepth / colsPerBand) + 1;
  const colsUsed = Math.min(colsPerBand, maxDepth + 1);
  const width = colsUsed * SPACING_X - GAP_X + PAD * 2;
  const height = numBands * bandHeight + (numBands - 1) * BAND_GAP_Y + PAD * 2;
  const bandBoundaries = Array.from({ length: numBands - 1 }, (_, i) => (i + 1) * bandHeight + i * BAND_GAP_Y);

  return { nodes, edges, width, height, bandBoundaries };
}

function NodeCard({
  pos,
  onToggle,
}: {
  pos: Positioned;
  onToggle: (id: string) => void;
}) {
  const { node, depth, index, hasChildren, isCollapsed } = pos;
  const status = STATUS_COLOR[node.status] || STATUS_COLOR.pending;
  const delay = depth * 0.08 + index * 0.025;

  return (
    <div
      className="dg-node-wrap"
      style={{
        left: pos.x + PAD,
        top: pos.y + PAD,
        width: NODE_W,
        height: NODE_H,
      }}
    >
      <div
        className={`dg-node relative h-full w-full rounded-2xl border-2 bg-[rgba(255,253,250,0.98)] px-3 py-2.5 dark:bg-surface-strong ${
          node.isRoot ? "is-root border-[#c4a055]" : status.ring
        }`}
        style={
          {
            "--dg-delay": `${delay}s`,
            boxShadow: "0 6px 20px rgba(139,100,40,0.16)",
          } as CSSProperties
        }
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`dg-avatar ${node.isRoot ? "is-root" : ""} flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-heading`}
            style={{
              background: node.isRoot
                ? "linear-gradient(135deg, #c4a055, #8a6a2a)"
                : "linear-gradient(135deg, #4a3218, #6b4a22)",
            }}
          >
            {node.isRoot ? <Crown className="h-4 w-4" /> : node.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-[13px] font-semibold text-heading">{node.name}</span>
              <span className={`dg-legend-dot h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`} />
            </div>
            <div className="truncate text-[10.5px] text-accent">{node.email}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="truncate text-[10px] text-subtle">{node.referralCode || "—"}</span>
              {node.isPendingAssignment ? (
                <span className="rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
                  Unassigned
                </span>
              ) : (
                <span className="text-[10.5px] font-semibold text-[#3a6a2a] dark:text-[#9cd18a]">
                  ${(node.maximumCommission ?? 0).toFixed(2)}/lot
                </span>
              )}
            </div>
          </div>
        </div>

        {hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="dg-collapse-btn absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-body shadow-sm hover:text-accent"
            title={isCollapsed ? "Expand downline" : "Collapse downline"}
          >
            {isCollapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PartnerDownlineGraph({ tree }: { tree: DownlineGraphNode }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Fall back to a conservative default until the frame's actual width has
  // been measured, so the very first paint doesn't flash an unwrapped layout.
  const colsPerBand = Math.max(
    MIN_COLS_PER_BAND,
    containerWidth ? Math.floor((containerWidth - PAD * 2 + GAP_X) / SPACING_X) : 3,
  );

  const { nodes, edges, width, height, bandBoundaries } = useMemo(
    () => buildLayout(tree, collapsed, colsPerBand),
    [tree, collapsed, colsPerBand],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-subtle">
        {Object.entries(STATUS_COLOR).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`dg-legend-dot h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <Crown className="h-3 w-3 text-[#c4a055]" />
          Root partner
        </span>
        <span className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          Click <Minus className="h-3 w-3" />/<Plus className="h-3 w-3" /> beside a node to collapse or expand its branch
        </span>
        {bandBoundaries.length > 0 && (
          <span className="flex items-center gap-1.5 text-accent">A generation that runs past the frame wraps to the row below.</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="dg-canvas overflow-auto rounded-2xl border border-border bg-[radial-gradient(ellipse_at_top,rgba(196,160,85,0.06),transparent_60%)] p-2"
        style={{ maxHeight: 620 }}
      >
        <div className="relative" style={{ width, height }}>
          <svg width={width} height={height} className="pointer-events-none absolute left-0 top-0">
            <defs>
              <marker
                id="dg-arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-color, #c4a055)" />
              </marker>
            </defs>

            {bandBoundaries.map((y, i) => (
              <line
                key={`band-${i}`}
                x1={0}
                y1={y + PAD + BAND_GAP_Y / 2}
                x2={width}
                y2={y + PAD + BAND_GAP_Y / 2}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="6 6"
                opacity={0.6}
              />
            ))}

            {edges.map((e) => {
              const x1 = e.x1 + PAD;
              const y1 = e.y1 + PAD;
              // Shortened so the arrowhead tip lands just before the child
              // card's edge instead of being drawn underneath it.
              const x2 = e.x2 + PAD - 8;
              const y2 = e.y2 + PAD;
              // A wrapped edge (parent/child in different bands) drops down
              // into the next row rather than bulging sideways, since its
              // child sits back near the frame's left edge, not to the
              // right of the parent.
              const dy = (y2 - y1) / 2;
              const d = e.wraps
                ? `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`
                : `M ${x1} ${y1} C ${x1 + GAP_X / 2} ${y1}, ${x2 - GAP_X / 2} ${y2}, ${x2} ${y2}`;
              return (
                <path
                  key={e.id}
                  className="dg-edge"
                  style={
                    { "--dg-delay": `${e.delay}s`, stroke: "var(--accent-color, #c4a055)" } as CSSProperties
                  }
                  pathLength={1}
                  markerEnd="url(#dg-arrowhead)"
                  d={d}
                />
              );
            })}
          </svg>

          {nodes.map((pos) => (
            <NodeCard key={pos.node.id} pos={pos} onToggle={toggle} />
          ))}
        </div>
      </div>
    </div>
  );
}
