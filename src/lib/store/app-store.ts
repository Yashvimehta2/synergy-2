import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ===== Types =====
export type ThemeMode = "light" | "dark" | "high-contrast";
export type TextSize = "normal" | "large" | "extra-large";
export type Language = "en" | "hi" | "ta" | "bn";

interface UserState {
  did: string | null;
  name: string;
  phone: string;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  trustScore: number;
}

interface UIState {
  theme: ThemeMode;
  textSize: TextSize;
  language: Language;
  isOnline: boolean;
  isVoiceActive: boolean;
  showOnboarding: boolean;
  currentOnboardingStep: number;
}

interface PlatformState {
  connectedPlatforms: string[];
  connectingPlatform: string | null;
}

interface AppState extends UserState, UIState, PlatformState {
  // User actions
  setUser: (user: Partial<UserState>) => void;
  setAuthenticated: (val: boolean) => void;
  setOnboardingCompleted: () => void;
  setTrustScore: (score: number) => void;
  logout: () => void;

  // UI actions
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setLanguage: (lang: Language) => void;
  setOnline: (online: boolean) => void;
  setVoiceActive: (active: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setOnboardingStep: (step: number) => void;

  // Platform actions
  addConnectedPlatform: (id: string) => void;
  removeConnectedPlatform: (id: string) => void;
  setConnectingPlatform: (id: string | null) => void;
}

const indexedDBStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial user state
      did: null,
      name: "",
      phone: "",
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      trustScore: 0,

      // Initial UI state
      theme: "dark",
      textSize: "normal",
      language: "en",
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      isVoiceActive: false,
      showOnboarding: true,
      currentOnboardingStep: 0,

      // Initial platform state
      connectedPlatforms: [],
      connectingPlatform: null,

      // User actions
      setUser: (user) => set((state) => ({ ...state, ...user })),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setOnboardingCompleted: () =>
        set({ hasCompletedOnboarding: true, showOnboarding: false }),
      setTrustScore: (trustScore) => set({ trustScore }),
      logout: () =>
        set({
          did: null,
          name: "",
          phone: "",
          isAuthenticated: false,
          trustScore: 0,
          connectedPlatforms: [],
        }),

      // UI actions
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
        set({ theme });
      },
      setTextSize: (textSize) => {
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-text-size", textSize);
        }
        set({ textSize });
      },
      setLanguage: (language) => set({ language }),
      setOnline: (isOnline) => set({ isOnline }),
      setVoiceActive: (isVoiceActive) => set({ isVoiceActive }),
      setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
      setOnboardingStep: (currentOnboardingStep) =>
        set({ currentOnboardingStep }),

      // Platform actions
      addConnectedPlatform: (id) =>
        set((state) => ({
          connectedPlatforms: [...new Set([...state.connectedPlatforms, id])],
        })),
      removeConnectedPlatform: (id) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.filter((p) => p !== id),
        })),
      setConnectingPlatform: (connectingPlatform) =>
        set({ connectingPlatform }),
    }),
    {
      name: "gigid-app-store",
      storage: indexedDBStorage,
      partialize: (state) => ({
        did: state.did,
        name: state.name,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        trustScore: state.trustScore,
        theme: state.theme,
        textSize: state.textSize,
        language: state.language,
        connectedPlatforms: state.connectedPlatforms,
      }),
    }
  )
);
