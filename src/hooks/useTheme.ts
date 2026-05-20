import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
    }),
    {
      name: "kimai-desktop-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode);
      },
    },
  ),
);

export function initTheme() {
  const mode = useThemeStore.getState().mode;
  applyTheme(mode);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const current = useThemeStore.getState().mode;
      if (current === "system") applyTheme("system");
    });
}
