import { useState } from "react";
import axios from "axios";
import { useToastStore } from "@/Store/toast.store";
import {
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const fieldCls =
  "admin-input w-full rounded-2xl px-4 py-3 text-sm text-heading focus:outline-none transition-all placeholder:text-subtle";

const primaryBtnCls =
  "flex items-center justify-center gap-2.5 rounded-2xl bg-linear-to-r from-accent to-accent-hover px-5 py-3.5 text-sm font-semibold text-heading shadow-lg shadow-accent/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40";

export default function EditAdminCredentials() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail && !trimmedPassword) {
      addToast("error", "Enter a new admin email or password");
      return;
    }

    try {
      setLoading(true);
      const payload: Record<string, string> = {};
      if (trimmedEmail) payload.email = trimmedEmail;
      if (trimmedPassword) payload.password = trimmedPassword;

      const response = await axios.post(
        `${API_BASE_URL}/superadmin/update-admin`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
        },
      );

      addToast(
        "success",
        response.data?.message || "Admin credentials updated successfully!",
      );
      setEmail("");
      setPassword("");
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || "Failed to update admin login",
      );
    } finally {
      setLoading(false);
    }
  };

  const filledCount = [email.trim(), password.trim()].filter(Boolean).length;

  return (
    <div className="admin-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="admin-hero rounded-[28px] px-6 py-7 sm:px-8 sm:py-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-body">
              Super Admin
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
              Admin Credentials
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-body">
              Update the admin email, password, or both from the same secured
              control surface.
            </p>
          </div>
        </div>

        <div className="admin-surface overflow-hidden rounded-[28px]">
          <div className="flex items-center gap-3 border-b border-border bg-surface-strong/80 px-6 py-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-body" />
            <p className="text-xs tracking-wide text-body">
              Blank fields are ignored. Only the values you enter will be
              changed.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1.2fr_0.8fr] sm:px-7">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-body">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                  <input
                    type="email"
                    placeholder="Enter new admin email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldCls + " pl-10"}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-body">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new admin password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={fieldCls + " pl-10 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-body"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface-strong/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-body">
                Update Status
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex flex-1 gap-1.5">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-all duration-500"
                      style={{
                        background:
                          i < filledCount
                            ? "linear-gradient(90deg, #c8ab72, #a07c46)"
                            : "#e8dcc6",
                      }}
                    />
                  ))}
                </div>
                <span className="whitespace-nowrap text-xs text-body">
                  {filledCount === 0 && "No fields filled"}
                  {filledCount === 1 && "1 field ready"}
                  {filledCount === 2 && "Both fields ready"}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-body">
                <p>Change email without touching the password.</p>
                <p>Change password without touching the email.</p>
                <p>Submit both together when rotating admin access.</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || filledCount === 0}
                className={`${primaryBtnCls} mt-6 w-full`}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Admin Credentials
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-surface-strong/70 px-6 py-4">
            <span className="text-[10px] uppercase tracking-widest text-body">
              Secured action
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#8ab88a]" />
              <span className="text-[10px] text-body">
                Superadmin session active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
