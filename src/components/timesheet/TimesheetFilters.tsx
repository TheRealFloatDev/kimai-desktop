import { Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n";
import { useCustomers, useProjects } from "@/hooks/useApi";
import {
  kimaiRangeToDateRange,
  rangeToKimaiFilters,
} from "@/lib/date-utils";
import type { TimesheetFilterParams } from "@/lib/types.generated";

interface TimesheetFiltersProps {
  filters: TimesheetFilterParams;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onChange: (filters: TimesheetFilterParams) => void;
  onSearch: () => void;
}

export function TimesheetFilters({
  filters,
  dateRange,
  onDateRangeChange,
  onChange,
  onSearch,
}: TimesheetFiltersProps) {
  const { t } = useTranslation();
  const { data: customers = [] } = useCustomers();
  const { data: projects = [] } = useProjects(filters.customer);

  const handleDateRange = (range: DateRange | undefined) => {
    onDateRangeChange(range);
    const { begin, end } = rangeToKimaiFilters(range);
    onChange({ ...filters, begin, end });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full shrink-0 space-y-2 sm:w-auto sm:max-w-[220px]">
          <Label>{t("history.period")}</Label>
          <DateRangePicker
            value={dateRange ?? kimaiRangeToDateRange(filters.begin, filters.end)}
            onChange={handleDateRange}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Label>{t("history.customer")}</Label>
          <Select
            value={filters.customer ? String(filters.customer) : "all"}
            onValueChange={(v) =>
              onChange({
                ...filters,
                customer: v === "all" ? undefined : Number(v),
                project: undefined,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("history.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("history.all")}</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Label>{t("history.project")}</Label>
          <Select
            value={filters.project ? String(filters.project) : "all"}
            onValueChange={(v) =>
              onChange({
                ...filters,
                project: v === "all" ? undefined : Number(v),
              })
            }
            disabled={!filters.customer}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("history.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("history.all")}</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          className="h-9"
          value={filters.term ?? ""}
          onChange={(e) => onChange({ ...filters, term: e.target.value })}
          placeholder={t("history.searchPlaceholder")}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={onSearch}>
          <Search className="h-4 w-4" />
          <span className="sr-only">{t("history.searchButton")}</span>
        </Button>
      </div>
    </div>
  );
}
