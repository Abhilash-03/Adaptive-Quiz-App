import { create } from "zustand";
import { persist } from "zustand/middleware";

// Apply theme to document
const applyTheme = (theme) => {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Theme: "light" | "dark" | "system"
      theme: "system",

      // Notification preferences
      emailNotifications: true,
      pushNotifications: true,

      // Sound settings
      soundEffects: true,

      // Actions
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      setEmailNotifications: (value) => set({ emailNotifications: value }),
      setPushNotifications: (value) => set({ pushNotifications: value }),
      setSoundEffects: (value) => set({ soundEffects: value }),

      // Initialize theme on app load
      initializeTheme: () => {
        const { theme } = get();
        applyTheme(theme);
      },
    }),
    {
      name: "quiz-settings",
      // Only persist these fields
      partialize: (state) => ({
        theme: state.theme,
        emailNotifications: state.emailNotifications,
        pushNotifications: state.pushNotifications,
        soundEffects: state.soundEffects,
      }),
    }
  )
);

// Listen for system theme changes
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const store = useSettingsStore.getState();
    if (store.theme === "system") {
      applyTheme("system");
    }
  });
}

export default useSettingsStore;
