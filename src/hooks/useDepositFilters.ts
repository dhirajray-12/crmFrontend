import { useState, useEffect } from "react";
import type { FilterState, DepositData } from "@/types/depositePage.types";

export const useFilters = (deposits: DepositData[]) => {
  const [filters, setFilters] = useState<FilterState>({
    accountTypes: [],
    statuses: [],
    dateFrom: "",
    dateTo: "",
  });
  const [filteredData, setFilteredData] = useState<DepositData[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count =
      filters.accountTypes.length +
      filters.statuses.length +
      (filters.dateFrom ? 1 : 0) +
      (filters.dateTo ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    let filtered = [...deposits];

    if (filters.accountTypes.length > 0) {
      filtered = filtered.filter((item) =>
        filters.accountTypes.includes(item.type),
      );
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter((item) =>
        filters.statuses.includes(item.status),
      );
    }

    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.dateInitiated);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    setFilteredData(filtered);
  }, [filters, deposits]);

  const toggleAccountType = (typeId: string) => {
    setFilters((prev) => ({
      ...prev,
      accountTypes: prev.accountTypes.includes(typeId)
        ? prev.accountTypes.filter((id) => id !== typeId)
        : [...prev.accountTypes, typeId],
    }));
  };

  const toggleStatus = (statusId: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(statusId)
        ? prev.statuses.filter((id) => id !== statusId)
        : [...prev.statuses, statusId],
    }));
  };

  const updateDate = (field: "dateFrom" | "dateTo", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      accountTypes: [],
      statuses: [],
      dateFrom: "",
      dateTo: "",
    });
  };

  const clearCategory = (category: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [category]: Array.isArray(prev[category]) ? [] : "",
    }));
  };

  return {
    filters,
    filteredData,
    activeFiltersCount,
    toggleAccountType,
    toggleStatus,
    updateDate,
    clearAllFilters,
    clearCategory,
  };
};
