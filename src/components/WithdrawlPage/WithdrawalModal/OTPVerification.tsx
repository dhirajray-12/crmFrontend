import { Mail, Shield, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import type { OTPState } from "@/types/WithdrawalPage.types";
import { formatTimer } from "@/utils/helpers";

interface OTPVerificationProps {
  otpState: OTPState;
  onSendOTP: () => void;
  onVerifyOTP: () => void;
  onResendOTP: () => void;
  onOtpChange: (otp: string) => void;
}

export const OTPVerification = ({
  otpState,
  onSendOTP,
  onVerifyOTP,
  onResendOTP,
  onOtpChange,
}: OTPVerificationProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface-strong/[0.05] p-4 sm:rounded-2xl sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/[0.18] sm:h-10 sm:w-10 sm:rounded-xl">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-heading" />
        </div>
        <div>
          <h4 className="text-base font-bold text-heading sm:text-lg">
            OTP Verification
          </h4>
          <p className="text-sm text-subtle">
            Secure your withdrawal with OTP
          </p>
        </div>
      </div>

      {!otpState.isOTPSent ? (
        <button
          onClick={onSendOTP}
          disabled={otpState.isSendingOTP}
          data-voice-target="send otp"
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.16] px-6 py-4 font-bold text-accent transition-all duration-300 hover:bg-accent/[0.24] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {otpState.isSendingOTP ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Send OTP to Email
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          {!otpState.isOTPVerified ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-heading">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  data-voice-target="otp code"
                  data-voice-field="otp code"
                  value={otpState.otp}
                  onChange={(e) =>
                    onOtpChange(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  className="client-theme-input w-full rounded-xl px-4 py-3 text-center font-mono text-xl tracking-widest text-heading placeholder:text-subtle [color-scheme:dark] focus:outline-none sm:px-6 sm:py-4 sm:text-2xl"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-subtle">
                    {otpState.otpTimer > 0
                      ? `OTP expires in ${formatTimer(otpState.otpTimer)}`
                      : "OTP expired"}
                  </p>
                  <button
                    onClick={onResendOTP}
                    disabled={!otpState.canResend || otpState.isSendingOTP}
                    data-voice-target="resend otp"
                    className="flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-subtle"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${otpState.isSendingOTP ? "animate-spin" : ""}`}
                    />
                    Resend OTP
                  </button>
                </div>
              </div>
              <button
                onClick={onVerifyOTP}
                disabled={otpState.isVerifyingOTP || otpState.otp.length !== 6}
                data-voice-target="verify otp"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.16] px-6 py-4 font-bold text-emerald-100 transition-all duration-300 hover:bg-emerald-500/[0.24] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {otpState.isVerifyingOTP ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4">
              <CheckCircle className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
              <div>
                <p className="font-bold text-emerald-100">
                  OTP Verified Successfully!
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  You can now submit your withdrawal
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
