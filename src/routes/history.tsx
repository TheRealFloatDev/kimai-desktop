import { createRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TimesheetEditDialog } from "@/components/timesheet/TimesheetEditDialog";
import { TimesheetFilters } from "@/components/timesheet/TimesheetFilters";
import { TimesheetList } from "@/components/timesheet/TimesheetList";
import { useDeleteTimesheet, useTimesheets } from "@/hooks/useApi";
import type {
  TimesheetCollection,
  TimesheetFilterParams,
} from "@/lib/types.generated";
import { Route as rootRoute } from "./__root";

function HistoryPage() {
  const [filters, setFilters] = useState<TimesheetFilterParams>({
    page: 1,
    size: 50,
    order: "DESC",
    orderBy: "begin",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [editTarget, setEditTarget] = useState<TimesheetCollection | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { data: timesheets = [], isLoading } = useTimesheets(appliedFilters);
  const deleteTimesheet = useDeleteTimesheet();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">History</h2>
      <TimesheetFilters
        filters={filters}
        onChange={setFilters}
        onSearch={() => setAppliedFilters({ ...filters, page: 1 })}
      />
      {isLoading && <p className="text-muted-foreground">Lädt…</p>}
      {!isLoading && (
        <TimesheetList
          timesheets={timesheets}
          onEdit={(ts) => {
            setEditTarget(ts);
            setEditOpen(true);
          }}
          onDelete={(id) => deleteTimesheet.mutate(id)}
        />
      )}
      <div className="flex justify-between">
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
