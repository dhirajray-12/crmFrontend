import { useState, useEffect } from "react";
import type { Group } from "@/types/OpenAccount.type";
import { formatLeverageOptions } from "@/utils/OpenAccount.Helper";

export const useLeverage = (selectedGroup: Group | undefined) => {
  const [leverageOpen, setLeverageOpen] = useState(false);
  const [leverageOptions, setLeverageOptions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedGroup) {
      const options = formatLeverageOptions(selectedGroup.leverages);
      setLeverageOptions(options);
      setLeverageOpen(false);
    } else {
      setLeverageOptions([]);
      setLeverageOpen(false);
    }
  }, [selectedGroup]);

  const selectLeverage = (option: string, onChange?: (value: string) => void) => {
    onChange?.(option);
    setLeverageOpen(false);
  };

  return {
    leverageOpen,
    leverageOptions,
    setLeverageOpen,
    selectLeverage,
  };
};
