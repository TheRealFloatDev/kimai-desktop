import { create } from "zustand";

/** Client-side anchor so the timer UI starts at 0 immediately after start. */
interface TimerAnchorState {
  startedAtMs: number | null;
  setStartedAtMs: (ms: number | null) => void;
}

export const useTimerAnchor = create<TimerAnchorState>((set) => ({
  startedAtMs: null,
  setStartedAtMs: (startedAtMs) => set({ startedAtMs }),
}));
