import { create } from "zustand";

type UIState = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  darkMode: false,
  setDarkMode: (v: boolean) => set({ darkMode: v }),
}));

export default useUIStore;
