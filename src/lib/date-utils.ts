import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

/** Kimai filter: HTML5 local datetime without timezone, e.g. 2026-05-20T00:00:00 */
export function toKimaiDateTime(date: Date, endOfDay = false): string {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return format(d, "yyyy-MM-dd'T'HH:mm:ss");
}

export function defaultHistoryRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
}

export function rangeToKimaiFilters(range: DateRange | undefined): {
  begin?: string;
  end?: string;
} {
  if (!range?.from) return {};
  return {
    begin: toKimaiDateTime(range.from, false),
    end: range.to
      ? toKimaiDateTime(range.to, true)
      : toKimaiDateTime(range.from, true),
  };
}

export function kimaiRangeToDateRange(
  begin?: string,
  end?: string,
): DateRange | undefined {
  if (!begin) return undefined;
  const from = new Date(begin.slice(0, 10));
  const to = end ? new Date(end.slice(0, 10)) : from;
  if (Number.isNaN(from.getTime())) return undefined;
  return { from, to: Number.isNaN(to.getTime()) ? from : to };
}

export function formatDateRangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return "Zeitraum wählen";
  if (range.to) {
    return `${format(range.from, "dd.MM.yyyy", { locale: de })} – ${format(range.to, "dd.MM.yyyy", { locale: de })}`;
  }
  return format(range.from, "dd.MM.yyyy", { locale: de });
}
