import { masterAccountAPI } from "@/API/Masteraccountapi ";
import type {
  MasterAccount,
  Account,
  ApiResponse,
} from "@/types/MasterPage.type";

export const masterApi = {
  getMasters: async (): Promise<ApiResponse<MasterAccount[]>> => {
    return await masterAccountAPI.getMasters();
  },

  getAllAccounts: async (): Promise<ApiResponse<Account[]>> => {
    return await masterAccountAPI.getAllAccounts();
  },

  createMaster: async (data: any): Promise<ApiResponse<MasterAccount>> => {
    return await masterAccountAPI.createMaster(data);
  },

  updateMaster: async (
    accountId: string,
    data: any,
  ): Promise<ApiResponse<MasterAccount>> => {
    return await masterAccountAPI.updateMaster(accountId, data);
  },

  deleteMaster: async (masterId: string): Promise<ApiResponse<null>> => {
    return await masterAccountAPI.deleteMaster(masterId);
  },
};
