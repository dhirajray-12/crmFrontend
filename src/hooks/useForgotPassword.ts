import { useMutation } from "@tanstack/react-query";
import { useForgotPasswordStore } from "@/Store/forgotPasswordStore";

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

const sendResetEmail = async (
  data: ForgotPasswordData,
): Promise<ForgotPasswordResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-active-role": sessionStorage.getItem("active_role") || "",
      },
      body: JSON.stringify(data),
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || "Failed to send reset email");
  }

  return responseData;
};

export const useForgotPassword = () => {
  const { setError, setSuccess } = useForgotPasswordStore();

  return useMutation({
    mutationFn: sendResetEmail,
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
};
