import { useQuery } from "@tanstack/react-query";
import { useReferralStore } from "@/Store/referralStore";
import { useEffect } from "react";

interface VerifyReferralResponse {
  success: boolean;
  message?: string;
  referralInfo?: {
    referringUserName: string;
  };
}

const verifyReferral = async (
  referralCode: string,
): Promise<VerifyReferralResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/ibclients/ib-configurations/verify-referral`,
    {
      method: "POST",
       headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          credentials: "include",
      body: JSON.stringify({ referralCode }),
    },
  );

  const data = await response.json();
  return data;
};

export const useVerifyReferral = (referralCode: string | undefined) => {
  const { setStatus, setReferrerName, setError } = useReferralStore();

  const query = useQuery<VerifyReferralResponse, Error>({
    queryKey: ["verifyReferral", referralCode],
    queryFn: () => {
      if (!referralCode) {
        throw new Error("No referral code provided");
      }
      return verifyReferral(referralCode);
    },
    enabled: !!referralCode,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Handle success
  useEffect(() => {
    if (query.status === "success" && query.data) {
      if (!query.data.success) {
        setStatus("invalid");
        setError(query.data.message || "Invalid referral code");
      } else {
        setReferrerName(query.data.referralInfo?.referringUserName || "");
        setStatus("valid");
      }
    }
  }, [query.status, query.data, setStatus, setReferrerName, setError]);

  // Handle error
  useEffect(() => {
    if (query.status === "error") {
      setStatus("invalid");
      setError("Unable to validate referral code");
    }
  }, [query.status, setStatus, setError]);

  return query;
};
