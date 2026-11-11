import { useState } from "react";
import { partnerService } from "@/services/partner.service";
import { usePartnerStore } from "@/Store/partner.store";
import { copyToClipboard as copyText } from "@/utils/clipboard";
import type { ShareMethod } from "@/types/partner.types";

export const usePartnerShare = (referralCode?: string | null) => {
  const [shareError, setShareError] = useState<string | null>(null);
  const { setCopiedField } = usePartnerStore();

  const copyToClipboard = async (text: string, field: string) => {
    const success = await copyText(text);
    if (success) {
      setCopiedField(field);
    } else {
      setShareError("Failed to copy to clipboard");
    }
  };

  const shareViaEmail = async (referralLink: string) => {
    const message = `Use my referral link: ${referralLink}`;

    // Best-effort: hand off to the OS/browser default mail client.
    window.location.href = `mailto:?subject=${encodeURIComponent(
      "Join me on TEST CRM",
    )}&body=${encodeURIComponent(message)}`;

    // Many machines (servers, fresh installs, etc.) have no mail client
    // registered, so the mailto: link opens nothing and the button looks
    // dead. Also copy the message so there's always a visible result the
    // user can paste into whatever email client they actually use.
    await copyToClipboard(message, "email");
  };

  const shareViaSocial = async (referralLink: string) => {
    try {
      await partnerService.shareViaWebShare(
        "Join TEST CRM",
        "Use my referral link to join TEST CRM and start trading!",
        referralLink,
      );
    } catch (error: any) {
      if (error.message === "Web Share API not supported") {
        // Fallback for browsers that don't support Web Share
        alert(`Share this link: ${referralLink}`);
      } else {
        setShareError("Failed to share link");
        console.error("Share error:", error);
      }
    }
  };

  const share = async (method: ShareMethod) => {
    if (!referralCode) return;

    const referralLink = partnerService.generateReferralLink(referralCode);

    switch (method) {
      case "copy":
        await copyToClipboard(referralLink, "link");
        break;
      case "email":
        await shareViaEmail(referralLink);
        break;
      case "social":
        await shareViaSocial(referralLink);
        break;
    }
  };

  return {
    share,
    shareError,
    clearShareError: () => setShareError(null),
  };
};
