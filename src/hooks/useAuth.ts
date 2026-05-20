import { create } from "zustand";
import type { UserEntity } from "@/lib/types.generated";

interface AuthState {
  isSetup: boolean;
  isAuthenticating: boolean;
  user: UserEntity | null;
  error: string | null;
  setSetup: (value: boolean) => void;
  setAuthenticating: (value: boolean) => void;
  setUser: (user: UserEntity | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isSetup: false,
  isAuthenticating: true,
  user: null,
  error: null,
  setSetup: (isSetup) => set({ isSetup }),
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
  setUser: (user) => set({ user, isSetup: !!user }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      isSetup: false,
      isAuthenticating: false,
      user: null,
      error: null,
    }),
}));
