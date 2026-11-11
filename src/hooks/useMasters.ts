import type { MasterTrader } from "@/types/rating.types";
import { apiService } from "@/services/rating.service";
import { useEffect, useState } from "react";

export const useMasters = () => {
  const [masters, setMasters] = useState<MasterTrader[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<MasterTrader | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllMasters();
      setMasters(response.data || []);
      setError("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch masters";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterDetails = async (masterId: string) => {
    try {
      const response = await apiService.getMasterDetails(masterId);
      setSelectedMaster(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch master details";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  return {
    masters,
    selectedMaster,
    setSelectedMaster,
    loading,
    error,
    fetchMasters,
    fetchMasterDetails,
  };
};
