import { useState } from "react";
import { Paperclip, X, Loader } from "lucide-react";
import { useCreateTicketMutation } from "@/hooks/useTicketQueries";
import type { NewTicketForm as NewTicketFormType } from "@/types/ticket.types";

interface NewTicketFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const initialFormState: NewTicketFormType = {
  subject: "",
  category: "Technical Issue",
  priority: "medium",
  description: "",
  attachment: null,
};

export const NewTicketForm = ({ onCancel, onSuccess }: NewTicketFormProps) => {
  const [formData, setFormData] = useState<NewTicketFormType>(initialFormState);
  const createTicketMutation = useCreateTicketMutation();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      await createTicketMutation.mutateAsync(formData);
      setFormData(initialFormState);
      onSuccess();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      attachment: e.target.files ? e.target.files[0] : null,
    });
  };

  return (
    <div
      className="w-full rounded-xl border border-border bg-surface p-4 sm:p-6"
      data-voice-scope="new ticket form"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-subtle">
            Support Desk
          </p>
          <h2 className="mt-1 text-xl font-bold text-heading sm:text-2xl">
            Create New Ticket
          </h2>
        </div>
        <button
          onClick={onCancel}
          data-voice-target="cancel new ticket"
          className="shrink-0 rounded-lg border border-border p-2 transition hover:bg-surface-strong/[0.08]"
        >
          <X size={20} className="text-subtle" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-heading">
            Subject *
          </label>
          <input
            type="text"
            required
            data-voice-target="ticket subject"
            data-voice-field="ticket subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Brief description of your issue"
            className="w-full rounded-lg border border-border bg-surface-strong/[0.05] px-3.5 py-2.5 text-sm text-heading placeholder-slate-500 transition focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-heading">
              Category *
            </label>
            <select
              value={formData.category}
              data-voice-target="ticket category"
              data-voice-field="ticket category"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as NewTicketFormType["category"],
                })
              }
              className="w-full rounded-lg border border-border bg-surface-strong/[0.05] px-3.5 py-2.5 text-sm text-heading transition focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/10"
            >
              <option value="Technical Issue" className="bg-surface-strong">
                Technical Issue
              </option>
              <option value="Account" className="bg-surface-strong">
                Account
              </option>
              <option value="Billing" className="bg-surface-strong">
                Billing
              </option>
              <option value="Other" className="bg-surface-strong">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-heading">
              Priority *
            </label>
            <select
              value={formData.priority}
              data-voice-target="ticket priority"
              data-voice-field="ticket priority"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as NewTicketFormType["priority"],
                })
              }
              className="w-full rounded-lg border border-border bg-surface-strong/[0.05] px-3.5 py-2.5 text-sm text-heading transition focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/10"
            >
              <option value="low" className="bg-surface-strong">
                Low
              </option>
              <option value="medium" className="bg-surface-strong">
                Medium
              </option>
              <option value="high" className="bg-surface-strong">
                High
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-heading">
            Description *
          </label>
          <textarea
            required
            rows={5}
            data-voice-target="ticket description"
            data-voice-field="ticket description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Please provide detailed information about your issue..."
            className="w-full resize-none rounded-lg border border-border bg-surface-strong/[0.05] px-3.5 py-2.5 text-sm text-heading placeholder-slate-500 transition focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-heading">
            Attachment (optional)
          </label>
          <div className="rounded-lg border border-dashed border-border bg-surface-strong/[0.02] p-5 text-center transition hover:border-accent/30 hover:bg-surface-strong/[0.04]">
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept=".jpg,.jpeg,.png,.gif,.pdf"
              data-voice-target="ticket attachment"
              data-voice-field="ticket attachment"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Paperclip className="mx-auto mb-2 text-subtle" size={28} />
              <p className="text-sm font-semibold text-heading">
                {formData.attachment
                  ? formData.attachment.name
                  : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-subtle">
                PDF, PNG, JPG up to 10MB
              </p>
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={createTicketMutation.isPending}
          data-voice-target="submit ticket"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createTicketMutation.isPending ? (
            <>
              <Loader className="animate-spin" size={18} />
              Creating...
            </>
          ) : (
            "Submit Ticket"
          )}
        </button>
      </div>
    </div>
  );
};
