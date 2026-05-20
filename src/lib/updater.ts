import { check, type Update } from "@tauri-apps/plugin-updater";

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function checkForAppUpdate(): Promise<Update | null> {
  if (!isTauriRuntime()) return null;
  return (await check()) ?? null;
}
