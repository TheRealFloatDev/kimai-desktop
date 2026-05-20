import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function parseKimaiDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function activeDurationSeconds(begin: string): number {
  const start = parseKimaiDate(begin).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 1000));
}

export function todayBeginParam(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T00:00:00`;
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}
