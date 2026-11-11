import type {
  CreatePartnerResponse,
  DashboardSummary,
  DashboardSummaryResponse,
  PartnerConfig,
  PartnerConfigResponse,
} from "@/types/partner.types";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

class PartnerService {
  async fetchPartnerConfig(): Promise<PartnerConfig | null> {
    const response = await axios.get<PartnerConfigResponse>(
      `${API_BASE_URL}/ibclients/ib-configurations/my-code`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
        validateStatus: (status) => status === 200 || status === 204,
      },
    );
    if (response.status === 204) return null;

    if (response.data.success && response.data.ibConfiguration) {
      return response.data.ibConfiguration;
    }
    return null;
  }

  async fetchDashboardSummary(): Promise<DashboardSummary | null> {
    try {
      const response = await axios.get<DashboardSummaryResponse>(
        `${API_BASE_URL}/ibclients/ib-configurations/dashboard`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (response.data.success && response.data.summary) {
        return response.data.summary;
      }
      return null;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return null;
    }
  }

  async createPartnerConfig(): Promise<PartnerConfig> {
    const response = await axios.post<CreatePartnerResponse>(
      `${API_BASE_URL}/ibclients/ib-configurations/create`,{},
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to create partner configuration",
      );
    }

    if (!response.data.ibConfiguration) {
      throw new Error("No configuration returned from server");
    }

    return response.data.ibConfiguration;
  }

  generateReferralLink(referralCode: string): string {
    return `${window.location.origin}/signup/${referralCode}`;
  }

  async shareViaWebShare(
    title: string,
    text: string,
    url: string,
  ): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      throw new Error("Web Share API not supported");
    }
  }
}

export const partnerService = new PartnerService();
