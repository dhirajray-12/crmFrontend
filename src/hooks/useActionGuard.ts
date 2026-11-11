import { useToastStore } from "@/Store/toast.store";
import { useCallback, useRef } from "react";

interface UseActionGuardOptions {
  isBusy?: boolean;
  warningMessage?: string;
}

export const useActionGuard = ({
  isBusy = false,
  warningMessage = "An action is already in progress. Please wait.",
}: UseActionGuardOptions = {}) => {
  const addToast = useToastStore((state) => state.addToast);
  const inFlightRef = useRef(false);

  const run = useCallback(
    async <T>(action: () => Promise<T>) => {
      if (inFlightRef.current || isBusy) {
        addToast("warning", warningMessage);
        return undefined;
      }

      inFlightRef.current = true;

      try {
        return await action();
      } finally {
        inFlightRef.current = false;
      }
    },
    [addToast, isBusy, warningMessage],
  );

  return { run };
};
