import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Pill } from "./ui/Pill";

const DISMISS_KEY = "client-dashboard-whatsapp-join-dismissed";

// TODO: move to admin-configurable app settings if this needs to change
// without a code deploy.
const WHATSAPP_JOIN_LINK =
  "https://wa.me/447412848452?text=Hello%21+I+am+interested+in+learning+more+about+your+business.";

export default function WhatsAppJoinPopup() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return sessionStorage.getItem(DISMISS_KEY) === "true";
  });
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (dismissed || typeof window === "undefined") {
      return;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [dismissed]);

  useEffect(() => {
    if (!dismissed || typeof window === "undefined") {
      return;
    }

    sessionStorage.setItem(DISMISS_KEY, "true");
  }, [dismissed]);

  const handleDismiss = () => {
    setLeaving(true);
    window.setTimeout(() => setDismissed(true), 200);
  };

  if (dismissed) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-surface-strong/60 backdrop-blur-sm px-4 transition-opacity duration-300 ease-out ${
        visible && !leaving ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleDismiss}
    >
      <div
        className={`w-[min(23rem,100%)] transform transition-all duration-300 ease-out ${
          visible && !leaving ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-surface-strong shadow-[0_0_50px_-12px_rgba(52,211,153,0.45)] backdrop-blur-xl">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                <MessageCircle className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                Join our WhatsApp
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 -mr-1 -mt-1 rounded-full p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.08] hover:text-heading"
                aria-label="Dismiss WhatsApp join popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white p-2">
                <img
                  src="/qrcode.jpeg"
                  alt="WhatsApp QR code"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <Pill tone="emerald" dot>
                  Scan to chat
                </Pill>
                <p className="mt-2 text-sm text-heading">
                  Scan the QR code with your phone to join our WhatsApp for
                  updates and support.
                </p>
              </div>
            </div>

            <a
              href={WHATSAPP_JOIN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-400/15 dark:text-emerald-200"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Open WhatsApp instead
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
