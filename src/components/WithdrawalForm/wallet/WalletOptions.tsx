import { useMemo } from "react";
import type { SavedWallets } from "@/types/withdrawal.types";

export const useWalletOptions = (savedWallets?: SavedWallets | null) => {
  return useMemo(() => {
    return [
      {
        id: "usdt",
        name: "USDT",
        address: savedWallets?.usdt || "",
        description: "Tether USD",
        network: "TRC20 / ERC20",
        fee: "2% + $1",
        processingTime: "1-2 hours",
      },
      {
        id: "tron",
        name: "TRON (TRX)",
        address: savedWallets?.tron || "",
        description: "Tron Network",
        network: "TRC20",
        fee: "1% + $0.50",
        processingTime: "30-60 minutes",
      },
      {
        id: "ethereum",
        name: "Ethereum (ETH)",
        address: savedWallets?.eth || "",
        description: "Ethereum Network",
        network: "ERC20",
        fee: "2% + $3",
        processingTime: "15-30 minutes",
      },
    ];
  }, [savedWallets]);
};
