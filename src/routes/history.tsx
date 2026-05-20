import { createRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TimesheetDataTable } from "@/components/timesheet/TimesheetDataTable";
import { TimesheetEditDialog } from "@/components/timesheet/TimesheetEditDialog";
import { TimesheetFilters } from "@/components/timesheet/TimesheetFilters";
import { useDeleteTimesheet, useTimesheets } from "@/hooks/useApi";
import {
  defaultHistoryRange,
  rangeToKimaiFilters,
} from "@/lib/date-utils";
import type {
  TimesheetCollectionExpanded,
  TimesheetFilterParams,
} from "@/lib/types.generated";
import type { DateRange } from "react-day-picker";
import { Route as rootRoute } from "./__root";

function buildInitialFilters(): TimesheetFilterParams {
  const range = defaultHistoryRange();
  const { begin, end } = rangeToKimaiFilters(range);
  return {
    page: 1,
    size: 50,
    order: "DESC",
    orderBy: "begin",
    begin,
    end,
  };
}

function HistoryPage() {
  const initial = useMemo(() => buildInitialFilters(), []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultHistoryRange(),
  );
  const [filters, setFilters] = useState<TimesheetFilterParams>(initial);
  const [appliedFilters, setAppliedFilters] = useState(initial);
  const [editTarget, setEditTarget] =
    useState<TimesheetCollectionExpanded | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: timesheets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTimesheets(appliedFilters);
  const deleteTimesheet = useDeleteTimesheet();

  return (
    <div className="flex h-full min-h-0 flex-col gap-8">
      <header className="shrink-0">
        <h2 className="text-2xl font-semibold tracking-tight">History</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Zeiteinträge filtern und sortieren
        </p>
      </header>
      <div className="shrink-0">
        <TimesheetFilters
          filters={filters}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onChange={setFilters}
          onSearch={() => setAppliedFilters({ ...filters, page: 1 })}
        />
      </div>
      {isError && (
        <Alert variant="destructive" className="shrink-0">
          <AlertDescription>
            {String(error)}
            <Button
              variant="outline"
              size="sm"
              className="ml-3"
              onClick={() => refetch()}
            >
              Erneut laden
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border/50">
        {isLoading && (
          <p className="p-6 text-muted-foreground">Lädt…</p>
        )}
        {!isLoading && !isError && (
          <TimesheetDataTable
            timesheets={timesheets}
            onEdit={(ts) => {
              setEditTarget(ts);
              setEditOpen(true);
            }}
            onDelete={(id) => deleteTimesheet.mutate(id)}
          />
        )}
      </div>
      <div className="flex shrink-0 justify-between">
        <Button
          variant="outline"
          disabled={(appliedFilters.page ?? 1) <= 1}
          onClick={() =>
            setAppliedFilters((f) => ({
              ...f,
              page: Math.max(1, (f.page ?? 1) - 1),
            }))
          }
        >
          Zurück
        </Button>
        <Button
          variant="outline"
          disabled={timesheets.length < (appliedFilters.size ?? 50)}
          onClick={() =>
            setAppliedFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
          }
        >
          Weiter
        </Button>
      </div>
      <TimesheetEditDialog
        timesheet={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});
