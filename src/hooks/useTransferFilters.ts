import { useCallback, useMemo, useState } from "react";
import type { Transfer } from "@/types/transfer.types";

interface TransferFiltersState {
  selectedAccountTypes: string[];
  selectedStatuses: string[];
  selectedDate: Date | null;
}

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const useFilters = (transfers: Transfer[]) => {
  const [filters, setFilters] = useState<TransferFiltersState>({
    selectedAccountTypes: [],
    selectedStatuses: [],
    selectedDate: null,
  });

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const fromType = transfer.fromAccount?.accountType;
      const toType = transfer.toAccount?.accountType;

      const matchesAccountType =
        filters.selectedAccountTypes.length === 0 ||
        filters.selectedAccountTypes.includes(fromType) ||
        filters.selectedAccountTypes.includes(toType);

      const matchesStatus =
        filters.selectedStatuses.length === 0 ||
        filters.selectedStatuses.includes(transfer.status);

      const matchesDate =
        !filters.selectedDate ||
        isSameDay(new Date(transfer.createdAt), filters.selectedDate);

      return matchesAccountType && matchesStatus && matchesDate;
    });
  }, [transfers, filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.selectedAccountTypes.length > 0) {
      count += filters.selectedAccountTypes.length;
    }

    if (filters.selectedStatuses.length > 0) {
      count += filters.selectedStatuses.length;
    }

    if (filters.selectedDate) {
      count += 1;
    }

    return count;
  }, [filters]);

  const toggleAccountType = useCallback((accountType: string) => {
    setFilters((prev) => {
      const exists = prev.selectedAccountTypes.includes(accountType);

      return {
        ...prev,
        selectedAccountTypes: exists
          ? prev.selectedAccountTypes.filter((type) => type !== accountType)
          : [...prev.selectedAccountTypes, accountType],
      };
    });
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setFilters((prev) => {
      const exists = prev.selectedStatuses.includes(status);

      return {
        ...prev,
        selectedStatuses: exists
          ? prev.selectedStatuses.filter((item) => item !== status)
          : [...prev.selectedStatuses, status],
      };
    });
  }, []);

  const updateDate = useCallback((date: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: date,
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      selectedAccountTypes: [],
      selectedStatuses: [],
      selectedDate: null,
    });
  }, []);

  return {
    filters,
    filteredTransfers,
    activeFiltersCount,
    toggleAccountType,
    toggleStatus,
    updateDate,
    clearAllFilters,
  };
};