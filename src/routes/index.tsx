import { createRoute } from "@tanstack/react-router";
import { ActiveTimer } from "@/components/timer/ActiveTimer";
import { RecentList } from "@/components/timer/RecentList";
import { TimesheetList } from "@/components/timesheet/TimesheetList";
import { useTodayTimesheets } from "@/hooks/useApi";
import { Route as rootRoute } from "./__root";

function DashboardPage() {
  const { data: today = [], isLoading } = useTodayTimesheets();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <ActiveTimer />
      <RecentList />
      <section>
        <h3 className="mb-3 text-lg font-medium">Heute</h3>
        {isLoading && <p className="text-muted-foreground">Lädt…</p>}
        {!isLoading && today.length === 0 && (
          <p className="text-muted-foreground">Keine Einträge für heute</p>
        )}
        {today.length > 0 && (
          <TimesheetList
            timesheets={today}
            onEdit={() => {}}
            onDelete={() => {}}
            showActions={false}
          />
        )}
      </section>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
