import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNotificationStore } from "@/Store/notification.store";
import { fetchWithSessionRefresh } from "@/utils/session";

export interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isEmailVerified?: boolean;
  phone?: string;
  country?: string;
  status?: string;
  createdAt?: Date;
  // Only meaningful when role === "subadmin"
  permissions?: string[];
  assignedClients?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: string | null;
  isInitialized: boolean;

  // Core Actions
  setAuth: (user: User | null) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
  setActiveRole: (role: string) => void;
  isImpersonating: () => boolean;
  initialize: () => Promise<void>;
}

let authInitializationPromise: Promise<void> | null = null;

const normalizeUser = (rawUser: any): User | null => {
  if (!rawUser) {
    return null;
  }

  const source = rawUser.user ?? rawUser;

  return {
    ...source,
    _id: source._id ?? source.id ?? "",
    email: source.email ?? "",
    role: source.role ?? "",
    firstName: source.firstName ?? source.firstname ?? "",
    lastName: source.lastName ?? source.lastname ?? "",
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      activeRole: null,
      isInitialized: false,

      initialize: async () => {
        const state = get();

        if (state.isInitialized) {
          if (state.isLoading) {
            set({ isLoading: false });
          }
          return;
        }

        if (authInitializationPromise) {
          await authInitializationPromise;
          return;
        }

        set({ isLoading: true });

        authInitializationPromise = (async () => {
          try {
            const sessionRole = sessionStorage.getItem("active_role");

            const headers: HeadersInit = {
              "Content-Type": "application/json",
            };

            if (sessionRole) {
              headers["X-Active-Role"] = sessionRole;
            }

            // credentials: "include" (set inside fetchWithSessionRefresh)
            // already carries the httpOnly auth_token_<role> cookie, which
            // the backend resolves using X-Active-Role - no bearer token
            // needed even during impersonation.
            const response = await fetchWithSessionRefresh(
              `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
              {
                headers,
              },
            );

            if (response.ok) {
              const userData = await response.json();
              const normalizedUser = normalizeUser(userData);

              set({
                user: normalizedUser,
                isAuthenticated: !!normalizedUser,
                activeRole: normalizedUser?.role ?? sessionRole ?? null,
                isLoading: false,
                isInitialized: true,
              });

              if (normalizedUser?.role) {
                sessionStorage.setItem("active_role", normalizedUser.role);
              }
              return;
            }

              set({
                user: null,
                isAuthenticated: false,
              activeRole: null,
              isLoading: false,
              isInitialized: true,
              });

              useNotificationStore.getState().resetStore();
              sessionStorage.removeItem("active_role");
              sessionStorage.removeItem("impersonation_active");
            } catch (error) {
            console.error("Auth initialization error:", error);
            set({
              user: null,
              isAuthenticated: false,
              activeRole: null,
                isLoading: false,
                isInitialized: true,
              });
              useNotificationStore.getState().resetStore();
            } finally {
              authInitializationPromise = null;
            }
        })();

        await authInitializationPromise;
      },

      setAuth: (user) => {
        const normalizedUser = normalizeUser(user);
        if (normalizedUser) {
          sessionStorage.setItem("active_role", normalizedUser.role);
          set({
            user: normalizedUser,
            isAuthenticated: true,
            activeRole: normalizedUser.role,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          useNotificationStore.getState().resetStore();
          set({
            user: null,
            isAuthenticated: false,
            activeRole: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      logout: async () => {
        // Clear only local auth state here.
        // Remote logout is handled by the shared useLogout hook so we do not
        // issue a second /auth/logout request and accidentally clear another
        // role's session cookie.
        sessionStorage.removeItem("active_role");
        sessionStorage.removeItem("impersonation_active");
        localStorage.removeItem("impersonation_data");
        useNotificationStore.getState().resetStore();
        
        set({
          user: null,
          isAuthenticated: false,
          activeRole: null,
          isLoading: false,
          isInitialized: true,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
          activeRole:
            userData.role ?? state.activeRole ?? state.user?.role ?? null,
        })),

      setActiveRole: (role: string) => {
        if (get().activeRole === role) {
          return;
        }
        sessionStorage.setItem("active_role", role);
        set({ activeRole: role });
      },

      isImpersonating: () => {
        return !!sessionStorage.getItem("impersonation_active");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
      }),
    }
  )
);
