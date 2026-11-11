import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { SignupRequestData, SignupResponse } from "@/types/auth.types";
import { useToastStore } from "@/Store/toast.store";

const signupUser = async (data: SignupRequestData): Promise<SignupResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/auth/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    throw new Error("Server did not return valid JSON");
  }

  if (!response.ok) {
    throw new Error(responseData.message || "Account creation failed");
  }

  return responseData;
};

const createIBConfiguration = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/ibclients/ib-configurations/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      },
    );

    return await response.json();
  } catch (err) {
    console.error("Error creating IB configuration:", err);
    // Don't throw - this is a background operation
    return null;
  }
};

export const useSignup = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: signupUser,
    onSuccess: async ( variables) => {
       addToast(
          "success",
          "Account created successfully! Redirecting to login...",
        );
      // If user signed up with a referral code AND received a token,
      // automatically create their IB configuration
      if (variables.referralCode) {
        await createIBConfiguration();
      }

      // Navigate to login after successful registration
      navigate("/login/client");
    },
  });
};
