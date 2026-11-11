import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useResetPasswordStore } from "@/Store/resetPasswordStore";

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

const resetPassword = async (
  data: ResetPasswordData,
): Promise<ResetPasswordResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`,
    {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify(data),
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || "Failed to reset password");
  }

  return responseData;
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const { setError, setSuccess } = useResetPasswordStore();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
};
