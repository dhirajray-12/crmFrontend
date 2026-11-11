// utils/clipboard.ts
// Robust clipboard helper: `navigator.clipboard` only exists in secure
// contexts (HTTPS/localhost). On plain-HTTP deployments (or older
// browsers) it is `undefined`, which made every "copy" button silently
// fail. This falls back to the legacy `execCommand("copy")` approach so
// copying still works there.
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return legacyCopy(text);
  } catch (err) {
    console.error("Clipboard API copy failed, falling back:", err);
    return legacyCopy(text);
  }
};

const legacyCopy = (text: string): boolean => {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
};
