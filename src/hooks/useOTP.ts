import { withdrawalApi } from "@/services/withdrawal.service";
import type { OTPState } from "@/types/WithdrawalPage.types";
import { useEffect, useState } from "react";

export const useOTP = () => {
  const [otpState, setOtpState] = useState<OTPState>({
    otpKey: "",
    otp: "",
    isOTPSent: false,
    isOTPVerified: false,
    isSendingOTP: false,
    isVerifyingOTP: false,
    otpTimer: 0,
    canResend: true,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpState.otpTimer > 0) {
      interval = setInterval(() => {
        setOtpState((prev) => ({
          ...prev,
          otpTimer: prev.otpTimer - 1,
          canResend: prev.otpTimer - 1 <= 0,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpState.otpTimer]);

  const sendOTP = async (requestBody: any) => {
    try {
      setOtpState((prev) => ({ ...prev, isSendingOTP: true }));
      const data: any = await withdrawalApi.sendOTP(requestBody);

      setOtpState((prev) => ({
        ...prev,
        isOTPSent: true,
        otpKey: data.otpKey,
        otpTimer: data.expiresIn || 300,
        canResend: false,
        isSendingOTP: false,
      }));

      return { success: true };
    } catch (err: any) {
      setOtpState((prev) => ({ ...prev, isSendingOTP: false }));
      return {
        success: false,
        error: err.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      setOtpState((prev) => ({ ...prev, isVerifyingOTP: true }));
      await withdrawalApi.verifyOTP(otpState.otpKey, otp);

      setOtpState((prev) => ({
        ...prev,
        isOTPVerified: true,
        isVerifyingOTP: false,
      }));

      return { success: true };
    } catch (err: any) {
      setOtpState((prev) => ({ ...prev, isVerifyingOTP: false }));
      return {
        success: false,
        error: err.response?.data?.message || "Invalid OTP",
      };
    }
  };

  const resendOTP = async () => {
    try {
      setOtpState((prev) => ({ ...prev, isSendingOTP: true }));
      const data: any = await withdrawalApi.resendOTP(otpState.otpKey);

      setOtpState((prev) => ({
        ...prev,
        otp: "",
        otpTimer: data.expiresIn || 300,
        canResend: false,
        isSendingOTP: false,
      }));

      return { success: true };
    } catch (err: any) {
      setOtpState((prev) => ({ ...prev, isSendingOTP: false }));
      return {
        success: false,
        error: err.response?.data?.message || "Failed to resend OTP",
      };
    }
  };

  const resetOTP = () => {
    setOtpState({
      otpKey: "",
      otp: "",
      isOTPSent: false,
      isOTPVerified: false,
      isSendingOTP: false,
      isVerifyingOTP: false,
      otpTimer: 0,
      canResend: true,
    });
  };

  return {
    otpState,
    setOtpState,
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTP,
  };
};
