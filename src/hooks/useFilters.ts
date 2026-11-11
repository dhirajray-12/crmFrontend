import { useState, useEffect } from "react";
import type { MasterTrader, FilterState } from "@/types/rating.types";

export const useFilters = (masters: MasterTrader[]) => {
  const [filteredMasters, setFilteredMasters] = useState<MasterTrader[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    expertise: "",
    maxRiskScore: "",
    minGrowth: "",
    minCopiers: "",
    feeType: "",
    sortBy: "growth",
  });

  const applyFilters = () => {
    let filtered = [...masters];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (master) =>
          master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          master.id.includes(searchQuery),
      );
    }

    // Expertise filter
    if (filters.expertise) {
      filtered = filtered.filter((m) => m.expertise === filters.expertise);
    }

    // Risk score filter
    if (filters.maxRiskScore) {
      filtered = filtered.filter(
        (m) => m.riskScore <= parseInt(filters.maxRiskScore),
      );
    }

    // Min growth filter
    if (filters.minGrowth) {
      filtered = filtered.filter((m) => {
        const growth = parseFloat(m.growth.replace("%", ""));
        return growth >= parseFloat(filters.minGrowth);
      });
    }

    // Min copiers filter
    if (filters.minCopiers) {
      filtered = filtered.filter(
        (m) => m.copiers >= parseInt(filters.minCopiers),
      );
    }

    // Fee type filter
    if (filters.feeType) {
      if (filters.feeType === "FREE") {
        filtered = filtered.filter((m) => m.fees === "FREE");
      } else {
        filtered = filtered.filter((m) => m.fees !== "FREE");
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "growth":
          return (
            parseFloat(b.growth.replace("%", "")) -
            parseFloat(a.growth.replace("%", ""))
          );
        case "copiers":
          return b.copiers - a.copiers;
        case "profitLoss":
          return b.profitLoss - a.profitLoss;
        case "riskScore":
          return a.riskScore - b.riskScore;
        default:
          return 0;
      }
    });

    setFilteredMasters(filtered);
  };

  const resetFilters = () => {
    setFilters({
      expertise: "",
      maxRiskScore: "",
      minGrowth: "",
      minCopiers: "",
      feeType: "",
      sortBy: "growth",
    });
    setSearchQuery("");
  };

  useEffect(() => {
    applyFilters();
  }, [masters, searchQuery, filters]);

  return {
    filteredMasters,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resetFilters,
    applyFilters,
  };
};
