import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  timeAgo: string;
  read: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  notifications?: Notification[];
};

export default function NotificationModal({
  open,
  onClose,
  notifications,
}: Props) {
  // Use sample data if none provided
  const sampleNotifications: Notification[] = notifications || [
    {
      id: "1",
      title: "✅ Deposit Approved",
      message:
        "Your deposit has been approved and funds have been added to your account.",
      type: "deposit",
      timeAgo: "2d ago",
      read: false,
    },
    {
      id: "2",
      title: "⏳ Deposit Pending",
      message: "Your deposit request is being processed.",
      type: "deposit",
      timeAgo: "3d ago",
      read: true,
    },
  ];

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-50"
          leave="ease-in duration-150"
          leaveFrom="opacity-50"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-surface-strong backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="client-theme-surface-strong w-full max-w-md transform overflow-hidden rounded-2xl border border-border text-heading shadow-[0_20px_50px_rgba(2,6,23,0.5)] transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border p-4">
                  <Dialog.Title className="text-lg font-semibold text-heading">
                    Notifications
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-subtle transition-colors hover:text-heading"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Notification list */}
                <div className="max-h-96 divide-y divide-border overflow-y-auto">
                  {sampleNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`cursor-pointer px-4 py-3 transition-colors hover:bg-surface-strong/[0.06] ${notif.read ? "bg-transparent" : "bg-surface-strong/[0.05]"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-heading">
                          {notif.title}
                        </h3>
                        <span className="text-xs text-subtle">
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-subtle">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4">
                  <button
                    onClick={onClose}
                    className="w-full rounded-lg border border-accent/30 bg-accent/[0.16] px-4 py-2 text-accent transition hover:bg-accent/[0.24]"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
