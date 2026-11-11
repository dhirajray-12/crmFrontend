import { UserPlus, X } from "lucide-react";
import { useState } from "react";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-surface-strong/85 px-4 py-3 text-sm text-heading outline-none transition focus:border-accent focus:bg-surface-strong";

export const AddAgentModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddAgentModalProps) => {
  const [newAgent, setNewAgent] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    dateofbirth: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  if (!isOpen) return null;

  const handleAddAgent = async () => {
    if (
      !newAgent.firstname ||
      !newAgent.email ||
      !newAgent.password ||
      !newAgent.phone ||
      !newAgent.country ||
      !newAgent.dateofbirth
    ) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setValidationError("");
      await onSubmit(newAgent);
      setNewAgent({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        dateofbirth: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-strong/45 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex min-h-full items-start justify-center py-4 sm:items-center sm:py-6">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-border bg-surface shadow-[0_26px_60px_rgba(74,50,24,0.22)] sm:max-h-[calc(100vh-3rem)]">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
              <UserPlus className="h-3.5 w-3.5" />
              Team Setup
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-heading">
              Add a support agent
            </h2>
            <p className="mt-2 text-sm text-body">
              Create a new support login and add the agent to the live routing pool.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-border p-2 text-body transition hover:bg-surface-strong/75"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

          <div className="mt-6 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
            <label className="mb-2 block text-sm font-medium text-body">
              First Name *
            </label>
            <input
              type="text"
              value={newAgent.firstname}
              onChange={(e) => {
                setNewAgent({ ...newAgent, firstname: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
              placeholder="Enter first name"
            />
              </div>

              <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Last Name
            </label>
            <input
              type="text"
              value={newAgent.lastname}
              onChange={(e) => {
                setNewAgent({ ...newAgent, lastname: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
              placeholder="Enter last name"
            />
              </div>

              <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Email *
            </label>
            <input
              type="email"
              value={newAgent.email}
              onChange={(e) => {
                setNewAgent({ ...newAgent, email: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
              placeholder="agent@support.com"
            />
              </div>

              <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Password *
            </label>
            <input
              type="password"
              value={newAgent.password}
              onChange={(e) => {
                setNewAgent({ ...newAgent, password: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
              placeholder="Enter password"
            />
              </div>

              <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Phone *
            </label>
            <input
              type="text"
              value={newAgent.phone}
              onChange={(e) => {
                setNewAgent({ ...newAgent, phone: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
              placeholder="Enter phone number"
            />
              </div>

              <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Country *
            </label>
            <input
              type="text"
              value={newAgent.country}
              onChange={(e) => {
                setNewAgent({ ...newAgent, country: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
              placeholder="Enter country"
            />
              </div>

              <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-body">
              Date of Birth *
            </label>
            <input
              type="date"
              value={newAgent.dateofbirth}
              onChange={(e) => {
                setNewAgent({ ...newAgent, dateofbirth: e.target.value });
                setValidationError("");
              }}
              className={inputClassName}
            />
              </div>
            </div>

            {validationError ? (
              <div className="mt-4 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-[#9a4d40] dark:text-[#cf958c]">
                {validationError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                className="w-full rounded-2xl border border-border bg-surface-strong px-6 py-3 text-sm font-semibold text-body transition hover:bg-surface-strong sm:w-auto"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAgent}
                className="w-full rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Agent"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
