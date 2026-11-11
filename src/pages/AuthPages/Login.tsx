import { BackgroundElements } from "@/components/Auth/BackgroundElements";
import { HeroContent } from "@/components/Auth/HeroContent";
import { LoginForm } from "@/components/Auth/LoginForm";
import { MobileHeader } from "@/components/Auth/MobileHeader";
import { MobileStats } from "@/components/Auth/MobileStats";
import { preloadPostLoginDestination, useLogin } from "@/hooks/useLogin";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useLoginHeader } from "@/hooks/useLoginHeader";
import type { Role } from "@/types/auth.types";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Login() {
  const { role } = useParams<{ role: string }>();
  const [error, setError] = useState<string>("");

  const { formData, showPassword, updateField, togglePasswordVisibility } =
    useLoginForm();
  const { headerText, subText } = useLoginHeader(role as Role);

  const loginMutation = useLogin();
  const currentRole =
    role === "superadmin"
      ? "superadmin"
      : role === "admin"
        ? "admin"
        : role === "agent"
          ? "agent"
          : role === "subadmin"
            ? "subadmin"
            : "client";

  useEffect(() => {
    preloadPostLoginDestination(currentRole).catch((preloadError) => {
      console.error("Failed to preload login destination:", preloadError);
    });
  }, [currentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
        loginType: currentRole,
      },
      {
        onError: (err: any) => {
          setError(err.message || "Error logging in");
        },
      },
    );
  };

  return (
    <div className="client-theme-bg relative min-h-svh overflow-hidden">
      <BackgroundElements />

      {/* Main Content */}
      <div className="relative z-10 min-h-svh flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-3">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Hero Content */}
          <HeroContent headerText={headerText} subText={subText} />

          {/* Right Side - Login Form */}
          <div className="auth-appear auth-appear-delay-1 w-full">
            {/* Mobile Header */}
            <MobileHeader headerText={headerText} subText={subText} />

            {/* Login Form */}
            <LoginForm
              formData={formData}
              showPassword={showPassword}
              error={error}
              isLoading={loginMutation.isPending}
              role={role}
              onFieldChange={updateField}
              onTogglePassword={togglePasswordVisibility}
              onSubmit={handleSubmit}
              loginMutation={loginMutation}
            />

            {/* Mobile Stats */}
            <div className="auth-appear auth-appear-delay-2">
              <MobileStats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
