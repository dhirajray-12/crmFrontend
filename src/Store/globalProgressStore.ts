import { create } from "zustand";
interface GlobalProgressState {
  lastUpdated: Date | null;
  setLastUpdated: (date: Date | null) => void;
}

export const useGlobalProgressStore = create<GlobalProgressState>()((set) => ({
  lastUpdated: null,
  setLastUpdated: (date) => set({ lastUpdated: date }),
}));
