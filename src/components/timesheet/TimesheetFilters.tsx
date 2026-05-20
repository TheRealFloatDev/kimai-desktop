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
  const { data: customers = [] } = useCustomers();
  const { data: projects = [] } = useProjects(filters.customer);

  const handleDateRange = (range: DateRange | undefined) => {
    onDateRangeChange(range);
    const { begin, end } = rangeToKimaiFilters(range);
    onChange({ ...filters, begin, end });
  };

  return (
    <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2 lg:col-span-2">
        <Label>Zeitraum</Label>
        <DateRangePicker
          value={dateRange ?? kimaiRangeToDateRange(filters.begin, filters.end)}
          onChange={handleDateRange}
        />
      </div>
      <div className="space-y-2">
        <Label>Kunde</Label>
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
          <SelectTrigger>
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Projekt</Label>
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
          <SelectTrigger>
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 lg:col-span-4">
        <Label>Suche</Label>
        <div className="flex gap-2">
          <Input
            value={filters.term ?? ""}
            onChange={(e) => onChange({ ...filters, term: e.target.value })}
            placeholder="Freitextsuche…"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <Button onClick={onSearch}>
            <Search className="mr-2 h-4 w-4" />
            Suchen
          </Button>
        </div>
      </div>
    </div>
  );
}
