import { useEffect, useState } from "react";

export interface TopbarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ──────────────────────────────────────────────
   Inline CSS for popup animations
   ────────────────────────────────────────────── */
const popupCss = `
  @keyframes overlayIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes popUp      { from { opacity:0; transform:translateY(28px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
  @keyframes pulseRing  { 0%,100% { transform:scale(1); opacity:0.6 } 50% { transform:scale(1.18); opacity:0 } }
  @keyframes fadeRow    { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
  @keyframes badgePop   { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
  @keyframes rotateBg   { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }

  .ar-overlay        { animation: overlayIn 0.25s ease; }
  .ar-popup          { animation: popUp 0.35s cubic-bezier(0.22,1,0.36,1); }
  .ar-avatar-ring::before {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    background:linear-gradient(135deg,#d4b27c,#f4e4c6,#b88d53);
    animation:rotateBg 3s linear infinite;
  }
  .ar-pulse-ring     { animation: pulseRing 2s ease-out infinite; }
  .ar-row-visible    { animation: fadeRow 0.3s ease forwards; }
  .ar-badge-visible  { animation: badgePop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .ar-btn-edit:hover  { transform:translateY(-1px); box-shadow:0 10px 24px rgba(107,74,34,0.28) !important; }
  .ar-btn-close:hover { background:var(--surface) !important; color:var(--heading) !important; border-color:var(--accent-color) !important; }
  .ar-xbtn:hover      { background:var(--surface) !important; color:var(--heading) !important; border-color:var(--accent-color) !important; }
`;

/* ──────────────────────────────────────────────
   Profile popup data
   ────────────────────────────────────────────── */
const infoRows = (
  email: string,
  address?: string,
  role?: string,
  createdAt?: string,
) => [
  {
    icon: "✉",
    label: "Email",
    value: email,
    iconBg: "color-mix(in srgb, #bfd4e6 26%, var(--surface-strong))",
    iconBorder: "color-mix(in srgb, #bfd4e6 50%, var(--border))",
  },
  {
    icon: "🏢",
    label: "Department",
    value: role,
    iconBg: "color-mix(in srgb, #d8d2ef 26%, var(--surface-strong))",
    iconBorder: "color-mix(in srgb, #d8d2ef 50%, var(--border))",
  },
  {
    icon: "📍",
    label: "Address",
    value: address,
    iconBg: "color-mix(in srgb, #c9dbc8 26%, var(--surface-strong))",
    iconBorder: "color-mix(in srgb, #c9dbc8 50%, var(--border))",
  },
  {
    icon: "📅",
    label: "Since",
    value: createdAt,
    iconBg: "color-mix(in srgb, #ead9ad 26%, var(--surface-strong))",
    iconBorder: "color-mix(in srgb, #ead9ad 50%, var(--border))",
  },
];

const permissions = [
  {
    label: "User Management",
    color: "var(--heading)",
    bg: "var(--surface-strong)",
    border: "var(--border)",
  },

  {
    label: "System Config",
    color: "var(--status-green)",
    bg: "color-mix(in srgb, #c9dbc8 26%, var(--surface-strong))",
    border: "color-mix(in srgb, #c9dbc8 50%, var(--border))",
  },
  {
    label: "Audit Logs",
    color: "var(--status-blue)",
    bg: "color-mix(in srgb, #bfd4e6 26%, var(--surface-strong))",
    border: "color-mix(in srgb, #bfd4e6 50%, var(--border))",
  },
  {
    label: "Analytics",
    color: "var(--heading)",
    bg: "var(--surface-strong)",
    border: "var(--border)",
  },
];

/* ──────────────────────────────────────────────
   AdminProfilePopup (self-contained)
   ────────────────────────────────────────────── */
interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
  name: string;
  role: string;
  email: string;
  status?: string; // ← new optional prop
  address?: string;
  createdAt?: string;
}

export const AdminProfilePopup: React.FC<ProfilePopupProps> = ({
  open,
  onClose,
  name,
  role,
  email,
  status,
  address,
  createdAt,
}) => {
  const [rowsVisible, setRowsVis] = useState(false);
  const [badgesVisible, setBadges] = useState(false);
  const [permTitle, setPermTitle] = useState(false);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) {
      setRowsVis(false);
      setBadges(false);
      setPermTitle(false);
      return;
    }
    const t1 = setTimeout(() => setRowsVis(true), 50);
    const t2 = setTimeout(() => {
      setPermTitle(true);
      setBadges(true);
    }, 430);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const rows = infoRows(email, address, role, createdAt);

  return (
    <>
      <style>{popupCss}</style>
      {/* Overlay */}
      <div
        className="ar-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(73,54,25,0.24)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Popup card */}
        <div
          className="ar-popup"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 400,
            maxWidth: "93vw",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            boxShadow:
              "0 30px 70px rgba(116,93,56,0.18), 0 18px 34px rgba(116,93,56,0.1), 0 0 0 1px color-mix(in srgb, var(--heading) 10%, transparent)",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              background:
                "radial-gradient(circle at top right,var(--hero-glow-1),transparent 28%),radial-gradient(circle at top left,var(--hero-glow-2),transparent 34%),linear-gradient(135deg,var(--surface-strong) 0%,var(--surface-strong) 48%,var(--surface) 100%)",
              padding: "30px 26px 22px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Orbs */}
            <div
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,var(--hero-glow-1) 0%,transparent 70%)",
                top: -60,
                right: -40,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,var(--hero-glow-2) 0%,transparent 70%)",
                bottom: -40,
                left: -20,
                pointerEvents: "none",
              }}
            />

            {/* Close X */}
            <button
              className="ar-xbtn"
              onClick={onClose}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "var(--surface-strong)",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: 30,
                height: 30,
                cursor: "pointer",
                fontSize: 12,
                color: "var(--body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "all 0.15s",
                fontFamily: "inherit",
                lineHeight: "1",
              }}
            >
              ✕
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Rotating avatar ring */}
              <div
                className="ar-avatar-ring"
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--surface-strong)",
                    color: "var(--heading)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: 1,
                    zIndex: 1,
                    border: "3px solid var(--border)",
                    boxShadow:
                      "0 16px 30px rgba(141,109,60,0.12), inset 0 1px 0 color-mix(in srgb, var(--heading) 12%, transparent)",
                  }}
                >
                  {initials}
                </div>
                <div
                  className="ar-pulse-ring"
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: "50%",
                    border: "2px solid var(--accent-color)",
                    zIndex: 2,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 3,
                    right: 3,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "var(--status-green)",
                    border: "2.5px solid var(--border)",
                    display: "block",
                    zIndex: 3,
                  }}
                />
              </div>

              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--heading)",
                    letterSpacing: -0.4,
                    marginBottom: 8,
                  }}
                >
                  {name}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12, // Gap between role and status
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      background: "var(--surface-strong)",
                      border: "1px solid var(--border)",
                      color: "var(--heading)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 20,
                      letterSpacing: 0.3,
                    }}
                  >
                    {role}
                  </span>
                  <span
                    style={{
                      background: "color-mix(in srgb, #c9dbc8 26%, var(--surface-strong))",
                      color: "var(--status-green)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 20,
                      border: "1px solid color-mix(in srgb, #c9dbc8 50%, var(--border))",
                    }}
                  >
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div
            className="bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,241,229,0.94))] dark:bg-surface-strong dark:bg-none"
            style={{
              padding: "22px 24px 20px",
            }}
          >
            {/* Info rows */}
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={rowsVisible ? "ar-row-visible" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "9px 0",
                  borderBottom: "1px solid var(--border)",
                  opacity: 0,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    flexShrink: 0,
                    background: row.iconBg,
                    border: `1px solid ${row.iconBorder}`,
                  }}
                >
                  {row.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--body)",
                      fontWeight: 500,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    {row.label}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--heading)" }}>
                    {row.value}
                  </p>
                </div>
              </div>
            ))}

            {/* Permissions */}
            <p
              style={{
                fontSize: 10,
                color: "var(--body)",
                fontWeight: 500,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                margin: "18px 0 10px",
                opacity: permTitle ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            >
              Access permissions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {permissions.map((p, i) => (
                <span
                  key={p.label}
                  className={badgesVisible ? "ar-badge-visible" : ""}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "4px 11px",
                    borderRadius: 8,
                    opacity: 0,
                    animationDelay: `${i * 0.05}s`,
                    color: p.color,
                    background: p.bg,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  {p.label}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                className="ar-btn-close"
                onClick={onClose}
                style={{
                  color: "var(--body)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-strong)",
                  borderRadius: 10,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                Close
              </button>
              <button
                className="ar-btn-edit"
                style={{
                  background: "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                  color: "var(--heading)",
                  border: "1px solid var(--accent-color)",
                  borderRadius: 10,
                  padding: "9px 22px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.2px",
                  transition: "all 0.15s",
                  boxShadow: "0 12px 24px rgba(107,74,34,0.2)",
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
