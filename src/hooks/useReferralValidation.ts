import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSignupStore } from "@/Store/signupStore";
import type { ReferralResponse } from "@/types/auth.types";

const validateReferralCode = async (
  code: string,
): Promise<ReferralResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/ibclients/ib-configurations/verify-referral`,
    {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify({ referralCode: code }),
    },
  );

  return response.json();
};

export const useReferralValidation = (referralCode?: string) => {
  const { setValidReferral, setReferralError } = useSignupStore();

  const { data, error, isLoading } = useQuery({
    queryKey: ["referral", referralCode],
    queryFn: () => validateReferralCode(referralCode!),
    enabled: !!referralCode,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      if (!data.success) {
        setReferralError(data.message || "Invalid referral code");
      } else {
        setValidReferral({
          code: referralCode!,
          referrerName: data.referralInfo?.referringUserName || "",
        });
      }
    }
  }, [data, referralCode, setValidReferral, setReferralError]);

  useEffect(() => {
    if (error) {
      setReferralError("Failed to validate referral code");
    }
  }, [error, setReferralError]);

  return { isLoading };
};
