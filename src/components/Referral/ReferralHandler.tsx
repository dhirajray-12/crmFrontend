import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReferralStore } from "@/Store/referralStore";
import { useVerifyReferral } from "@/hooks/useVerifyReferral";
import ReferralLoading from "@/components/Referral/ReferralLoading";
import ReferralInvalid from "@/components/Referral/ReferralInvalid";
import ReferralBanner from "@/components/Referral/ReferralBanner";
import CreateAccount from "@/pages/AuthPages/CreateAccount";

export default function ReferralHandler() {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();

  // Get state from store
  const { status, referrerName, error, setReferralCode } = useReferralStore();

  // Set referral code in store
  useEffect(() => {
    setReferralCode(referralCode || null);
  }, [referralCode, setReferralCode]);

  // Redirect if no referral code
  useEffect(() => {
    if (!referralCode) {
      navigate("/create-account");
    }
  }, [referralCode, navigate]);

  // Verify referral using React Query
  const { isLoading } = useVerifyReferral(referralCode);

  // Show loading state
  if (isLoading || status === "loading") {
    return <ReferralLoading referralCode={referralCode || ""} />;
  }

  // Show invalid state
  if (status === "invalid") {
    return <ReferralInvalid error={error} />;
  }

  // Show valid state with banner and signup
  if (status === "valid") {
    return (
      <>
        <ReferralBanner referrerName={referrerName} />
        <CreateAccount />
      </>
    );
  }

  return null;
}
