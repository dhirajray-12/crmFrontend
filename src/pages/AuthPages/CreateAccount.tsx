import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { User, Mail, Calendar, Globe, Check } from "lucide-react";
import { BackgroundElements } from "@/components/Auth/BackgroundElements";
import { HeroSection } from "@/components/Auth/HeroSection";
import { ReferralBanner } from "@/components/Auth/ReferralBanner";
import { FormInput } from "@/components/Auth/FormInput";
import { PasswordInput } from "@/components/Auth/PasswordInput";
import { CountrySelect } from "@/components/Auth/CountrySelect";
import { PhoneNumberInput } from "@/components/Auth/PhoneNumberInput";
import { TermsCheckbox } from "@/components/Auth/TermsCheckbox";
import { FormActions } from "@/components/Auth/FormActions";
import { useToastStore } from "@/Store/toast.store";
import { useSignupStore } from "@/Store/signupStore";
import { useReferralValidation } from "@/hooks/useReferralValidation";
import { useSignup } from "@/hooks/useSignup";
import { signupBaseSchema, signupSchema } from "@/Schema/Signup.schema";

const FEATURES = [
  {
    icon: Check,
    text: "Instant account activation",
    color: "text-accent",
  },
  { icon: Check, text: "Access to premium features", color: "text-accent" },
  { icon: Check, text: "24/7 customer support", color: "text-teal-700 dark:text-teal-200" },
  { icon: Check, text: "Secure and encrypted data", color: "text-accent" },
];

const STATS = [
  { number: "50K+", label: "Active Users" },
  { number: "$2M+", label: "Trading Volume" },
  { number: "150+", label: "Countries" },
];

export default function CreateAccount() {
  const { referralCode } = useParams<{ referralCode?: string }>();
  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState("");

  const {
    formData,
    validReferral,
    referralError,
    open,
    showPassword,
    showConfirmPassword,
    setFormData,
    setOpen,
    setShowPassword,
    setShowConfirmPassword,
  } = useSignupStore();
  const { addToast } = useToastStore();

  // Validate referral code if present
  useReferralValidation(referralCode);

  const signupMutation = useSignup();

  const setFieldError = (field: string, message?: string) => {
    setErrors((prev: any) => {
      const nextErrors = { ...prev };

      if (message) {
        nextErrors[field] = { _errors: [message] };
      } else {
        delete nextErrors[field];
      }

      return nextErrors;
    });
  };

  const getFieldSchema = (field: string) => {
    return signupBaseSchema.shape[field as keyof typeof signupBaseSchema.shape];
  };

  const validateSingleField = (field: string, value: string) => {
    const fieldSchema = getFieldSchema(field);

    if (!fieldSchema) {
      return;
    }

    const result = fieldSchema.safeParse(value);
    setFieldError(
      field,
      result.success ? undefined : result.error.issues[0]?.message,
    );
  };

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      setFieldError("confirmPassword");
      return;
    }

    setFieldError(
      "confirmPassword",
      password === confirmPassword ? undefined : "Passwords do not match",
    );
  };

  const handleFieldChange = (field: string, value: string) => {
    const updatedValue =
      field === "phone" ? value.replace(/\D/g, "").slice(0, 14) : value;

    setSubmitError("");
    setFormData({ [field]: updatedValue });

    if (field === "password") {
      validateSingleField("password", updatedValue);
      validatePasswordMatch(updatedValue, formData.confirmPassword);
      return;
    }

    if (field === "confirmPassword") {
      validatePasswordMatch(formData.password, updatedValue);
      return;
    }

    validateSingleField(field, updatedValue);
  };

  const handleCountryCodeChange = (dialCode: string) => {
    setSubmitError("");
    setFormData({ countryCode: dialCode });
    validateSingleField("countryCode", dialCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const result = signupSchema.safeParse(formData);

    // ❌ If validation fails → STOP submission
    if (!result.success) {
      const formatted = result.error.format();
      setErrors(formatted);
      return; // 🚨 IMPORTANT: stop API call
    }

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      // Backend expects the dial code and number combined, with no "+" sign
      phone: `${formData.countryCode}${formData.phone}`.replace(/\+/g, ""),
      zipCode: formData.zipCode,
      state: formData.state,
      dateofbirth: formData.dateofbirth,
      country: formData.country,
      referralCode: referralCode || undefined,
    };

    signupMutation.mutate(submitData, {
      onError: (err: any) => {
        addToast(
          "error",
          err?.response?.data.message ||
            err.message ||
            "Account creation failed",
        );
        setSubmitError(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
        );
      },
    });
  };

  return (
    <div className="client-theme-bg relative min-h-svh overflow-hidden">
      <BackgroundElements />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_24%)]" />

      <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid w-full max-w-7xl items-start gap-6 lg:grid-cols-2 lg:items-center lg:gap-12"
        >
          <HeroSection
            title="Start Your Journey"
            subtitle="Create Your Account"
            features={FEATURES}
            stats={STATS}
          />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full"
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-px rounded-2xl bg-[linear-gradient(135deg,rgba(56,189,248,0.32),rgba(14,165,233,0.10),rgba(16,185,129,0.24))] opacity-90 blur-sm sm:rounded-3xl"
                animate={{ opacity: [0.7, 0.95, 0.7] }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="client-theme-surface-strong relative max-h-[90vh] overflow-y-auto rounded-2xl border border-border p-4 shadow-[0_22px_54px_rgba(2,6,23,0.4)] sm:max-h-[95vh] sm:rounded-3xl sm:p-6 lg:p-8 hide-scrollbar">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_24%)]" />

                <div className="text-center mb-4 sm:mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                    className="inline-block mb-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-linear-to-br from-accent to-accent-hover shadow-[0_12px_30px_rgba(14,165,233,0.18)] sm:h-14 sm:w-14">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-heading" />
                    </div>
                  </motion.div>

                  <h2 className="mb-1 bg-gradient-to-r from-white via-accent to-slate-300 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                    Create Account
                  </h2>
                  <p className="text-xs text-subtle sm:text-sm">
                    Fill in your details to get started
                  </p>
                </div>

                <ReferralBanner
                  validReferral={validReferral}
                  referralError={referralError}
                />

                <form
                  onSubmit={handleSubmit}
                  className="relative space-y-3 sm:space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="First Name"
                      icon={User}
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleFieldChange("firstName", e.target.value)
                      }
                      placeholder="First name"
                      error={errors.firstName?._errors?.[0]}
                      required
                    />

                    <FormInput
                      label="Last Name"
                      icon={User}
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleFieldChange("lastName", e.target.value)
                      }
                      placeholder="Last name"
                      error={errors.lastName?._errors?.[0]}
                      required
                    />
                  </div>

                  <FormInput
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    error={errors.email?._errors?.[0]}
                    placeholder="you@example.com"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PasswordInput
                      label="Password"
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      value={formData.password}
                      onChange={(e) =>
                        handleFieldChange("password", e.target.value)
                      }
                      error={errors.password?._errors?.[0]}
                      placeholder="Password"
                      required
                    />

                    <PasswordInput
                      label="Confirm Password"
                      showPassword={showConfirmPassword}
                      onTogglePassword={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleFieldChange("confirmPassword", e.target.value)
                      }
                      error={errors.confirmPassword?._errors?.[0]}
                      placeholder="Confirm Password"
                      required
                    />
                  </div>

                  <PhoneNumberInput
                    countryCode={formData.countryCode}
                    phone={formData.phone}
                    onCountryCodeChange={handleCountryCodeChange}
                    onPhoneChange={(value) => handleFieldChange("phone", value)}
                    error={
                      errors.phone?._errors?.[0] ||
                      errors.countryCode?._errors?.[0]
                    }
                    required
                  />

                  <FormInput
                    label="Date of Birth"
                    icon={Calendar}
                    type="date"
                    value={formData.dateofbirth}
                    onChange={(e) =>
                      handleFieldChange("dateofbirth", e.target.value)
                    }
                    error={errors.dateofbirth?._errors?.[0]}
                    required
                  />

                  <div className="pt-2">
                    <h3 className="mb-3 text-sm font-semibold text-accent">
                      Address Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Zip Code"
                      icon={Globe}
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleFieldChange("zipCode", e.target.value)
                      }
                      placeholder="Zip code"
                      error={errors.zipCode?._errors?.[0]}
                      required
                    />

                    <FormInput
                      label="State"
                      icon={Globe}
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        handleFieldChange("state", e.target.value)
                      }
                      placeholder="State"
                      error={errors.state?._errors?.[0]}
                      required
                    />
                  </div>

                  <CountrySelect
                    value={formData.country}
                    open={open}
                    onToggle={() => setOpen(!open)}
                    onSelect={(country) => {
                      setSubmitError("");
                      setFormData({ country });
                      validateSingleField("country", country);
                    }}
                  />

                  <TermsCheckbox />

                  <FormActions
                    isLoading={signupMutation.isPending}
                    error={submitError || signupMutation.error?.message || ""}
                  />
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
