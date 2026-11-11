// utils/apiClient.ts
import { useAuthStore } from "@/Store/auth.store";
import { fetchWithSessionRefresh } from "@/utils/session";

interface ApiOptions extends RequestInit {
  skipRoleHeader?: boolean;
}

export const apiClient = async (url: string, options: ApiOptions = {}) => {
  const { activeRole, user } = useAuthStore.getState();
  
  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Add active role header if not skipped and role exists
  if (!options.skipRoleHeader && activeRole) {
    headers['X-Active-Role'] = activeRole;
  }
  
  // Also add user role from current user if activeRole not set
  if (!headers['X-Active-Role'] && user?.role) {
    headers['X-Active-Role'] = user.role;
  }
  
  const response = await fetchWithSessionRefresh(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    useAuthStore.getState().logout();
  }
  
  return response;
};

// Convenience methods
export const api = {
  get: (url: string, options?: ApiOptions) => apiClient(url, { ...options, method: 'GET' }),
  post: (url: string, data?: any, options?: ApiOptions) => apiClient(url, { 
    ...options, 
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url: string, data?: any, options?: ApiOptions) => apiClient(url, { 
    ...options, 
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (url: string, options?: ApiOptions) => apiClient(url, { ...options, method: 'DELETE' }),
};
