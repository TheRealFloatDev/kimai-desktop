import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TimesheetCollectionExpanded } from "@/lib/types.generated";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Dashboard: full HH:MM:SS */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Tray: MM:SS under 1h, HH:MM from 1h upward */
export function formatTrayDuration(seconds: number): string {
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  return new Date(dateStr).toLocaleString("de-DE");
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Kimai liefert `rate` (extern) oder `internalRate` (intern). */
export function formatTimesheetCost(
  ts: TimesheetCollectionExpanded,
): number | null {
  if (ts.rate != null) return ts.rate;
  if (ts.internalRate != null) return ts.internalRate;
  return null;
}

/** e.g. 2h 15m from seconds */
export function kimaiEntityColor(
  entity?: { color?: string; color_safe?: string } | null,
): string | undefined {
  if (!entity) return undefined;
  const c = entity.color ?? entity.color_safe;
  if (!c || !/^#[0-9A-Fa-f]{3,8}$/.test(c)) return undefined;
  return c;
}

export function formatWorkingHours(seconds: number): string {
  if (seconds <= 0) return "0h";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function splitDateTimeLocal(isoOrLocal: string): {
  date: Date | undefined;
  time: string;
} {
  if (!isoOrLocal) return { date: undefined, time: "00:00" };
  const d = new Date(isoOrLocal);
  if (Number.isNaN(d.getTime())) return { date: undefined, time: "00:00" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: d,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function mergeDateAndTime(date: Date, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}
