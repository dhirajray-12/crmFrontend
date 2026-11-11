import type { Agent, Client } from "@/types/support.types";
import { ClipboardPlus, X } from "lucide-react";
import { useState } from "react";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  agents: Agent[];
  onSubmit: (formData: any) => Promise<void>;
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-surface-strong/85 px-4 py-3 text-sm text-heading outline-none transition focus:border-accent focus:bg-surface-strong";

export const CreateTicketModal = ({
  isOpen,
  onClose,
  clients,
  agents,
  onSubmit,
}: CreateTicketModalProps) => {
  const [formData, setFormData] = useState({
    clientId: "",
    subject: "",
    category: "",
    description: "",
    assignedTo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.subject || !formData.category || !formData.description) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setValidationError("");
      await onSubmit(formData);
      setFormData({
        clientId: "",
        subject: "",
        category: "",
        description: "",
        assignedTo: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[30px] border border-border bg-surface p-6 shadow-[0_26px_60px_rgba(74,50,24,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
              <ClipboardPlus className="h-3.5 w-3.5" />
              New Ticket
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-heading">
              Create a support ticket
            </h2>
            <p className="mt-2 text-sm text-body">
              Add the issue context, set the category, and optionally route it to
              an agent immediately.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-border p-2 text-body transition hover:bg-surface-strong/75"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-body">
              Client (Optional)
            </label>
            <select
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              className={inputClassName}
            >
              <option value="">Select a client (or leave empty)</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.firstname} {client.lastname} ({client.email})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-body">
              Subject *
            </label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className={inputClassName}
            >
              <option value="">Select a category</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="General">General</option>
              <option value="Account">Account</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Assign To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              className={inputClassName}
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.firstname} {agent.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-body">
              Description *
            </label>
            <textarea
              placeholder="Please provide details about the issue"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className={`${inputClassName} resize-none`}
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
            className="rounded-2xl border border-border bg-surface-strong px-6 py-3 text-sm font-semibold text-body transition hover:bg-surface-strong"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition hover:opacity-90 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};
