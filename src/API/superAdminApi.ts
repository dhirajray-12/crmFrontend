import api from "./axiosInstance";

/* ======================================================
   SUPER ADMIN — LEVERAGES
   ====================================================== */

// Get all leverages
export const getLeverages = async () => {
  const res = await api.get("/leverages");
  return res.data;
};

// Create leverage
export const createLeverage = async (data: any) => {
  const res = await api.post("/leverages", data);
  return res.data;
};

// Update leverage
export const updateLeverage = async (id: string, data: any) => {
  const res = await api.put(`/leverages/${id}`, data);
  return res.data;
};

// Delete leverage
export const deleteLeverage = async (id: string) => {
  const res = await api.delete(`/leverages/${id}`);
  return res.data;
};


/* ======================================================
   SUPER ADMIN — GROUPS (CRM GROUPS)
   ====================================================== */

// Get groups
export const getGroups = async () => {
  const res = await api.get("/groups");
  return res.data;
};

// Create group
export const createGroup = async (data: any) => {
  const res = await api.post("/groups", data);
  return res.data;
};

// Update group
export const updateGroup = async (id: string, data: any) => {
  const res = await api.put(`/groups/${id}`, data);
  return res.data;
};

// Delete group
export const deleteGroup = async (id: string) => {
  const res = await api.delete(`/groups/${id}`);
  return res.data;
};


/* ======================================================
   SUPER ADMIN — MT5 GROUPS (External API via backend)
   ====================================================== */

// Fetch MT5 groups from external API
export const getMT5Groups = async () => {
  const res = await api.get("/groups/mt5-groups");
  return res.data;
};
