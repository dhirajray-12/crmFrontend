import api from "@/API/axiosInstance";

export interface Subadmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: { name: string; state?: string } | string;
  dateofbirth: string;
  status: "activated" | "suspended";
  permissions: string[];
  assignedClients: string[];
  createdBy?: string;
  createdAt: string;
}

export interface SubadminListResponse {
  success: boolean;
  data: Subadmin[];
  stats: { total: number; active: number; suspended: number };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SubadminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  country: string;
  dateofbirth: string;
  permissions: string[];
  assignedClients?: string[];
  status?: "activated" | "suspended";
}

export const getSubadmins = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const res = await api.get<SubadminListResponse>("/admin/subadmins", {
    params,
  });
  return res.data;
};

export const getSubadmin = async (id: string) => {
  const res = await api.get<{ success: boolean; data: Subadmin }>(
    `/admin/subadmins/${id}`,
  );
  return res.data.data;
};

export const createSubadmin = async (payload: SubadminPayload) => {
  const res = await api.post<{ success: boolean; data: Subadmin }>(
    "/admin/subadmins",
    payload,
  );
  return res.data.data;
};

export const updateSubadmin = async (
  id: string,
  payload: Partial<SubadminPayload>,
) => {
  const res = await api.put<{ success: boolean; data: Subadmin }>(
    `/admin/subadmins/${id}`,
    payload,
  );
  return res.data.data;
};

export const resetSubadminPassword = async (id: string, password: string) => {
  const res = await api.put<{ success: boolean; message: string }>(
    `/admin/subadmins/${id}/reset-password`,
    { password },
  );
  return res.data;
};

export const deleteSubadmin = async (id: string) => {
  const res = await api.delete<{ success: boolean; message: string }>(
    `/admin/subadmins/${id}`,
  );
  return res.data;
};
