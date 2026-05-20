import { createRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HistoryList } from "@/components/timesheet/HistoryList";
import { TimesheetEditDialog } from "@/components/timesheet/TimesheetEditDialog";
import { TimesheetFilters } from "@/components/timesheet/TimesheetFilters";
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();
  const initial = useMemo(() => buildInitialFilters(), []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultHistoryRange(),
  );
  const [filters, setFilters] = useState<TimesheetFilterParams>(initial);
  const [appliedFilters, setAppliedFilters] = useState(initial);
  const [editTarget, setEditTarget] =
    useState<TimesheetCollectionExpanded | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: timesheets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTimesheets(appliedFilters);
  const deleteTimesheet = useDeleteTimesheet();

  const handleConfirmDelete = () => {
    if (deleteId == null) return;
    deleteTimesheet.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-4">
      <header className="shrink-0">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("history.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("history.subtitle")}
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
              {t("history.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <p className="text-muted-foreground">{t("history.loading")}</p>
        )}
        {!isLoading && !isError && (
          <HistoryList
            timesheets={timesheets}
            onEdit={(ts) => {
              setEditTarget(ts);
              setEditOpen(true);
            }}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </div>
      <div className="flex shrink-0 justify-between pt-1">
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
          {t("history.prev")}
        </Button>
        <Button
          variant="outline"
          disabled={timesheets.length < (appliedFilters.size ?? 50)}
          onClick={() =>
            setAppliedFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
          }
        >
          {t("history.next")}
        </Button>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("history.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("history.deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("history.editCancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteTimesheet.isPending}
            >
              {t("history.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
