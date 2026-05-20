import { createRoute } from "@tanstack/react-router";
import { Clock, Timer } from "lucide-react";
import { ActiveTimer } from "@/components/timer/ActiveTimer";
import { RecentList } from "@/components/timer/RecentList";
import { useWorkingStats } from "@/hooks/useApi";
import { formatWorkingHours } from "@/lib/utils";
import { Route as rootRoute } from "./__root";

function StatBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="text-3xl font-light tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const { data: stats, isLoading } = useWorkingStats();

  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Übersicht deiner erfassten Arbeitszeit
        </p>
      </header>

      <section className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
        <StatBlock
          label="Heute"
          value={isLoading ? "…" : formatWorkingHours(stats?.today_seconds ?? 0)}
          icon={Clock}
        />
        <StatBlock
          label="Diese Stunde"
          value={isLoading ? "…" : formatWorkingHours(stats?.hour_seconds ?? 0)}
          icon={Timer}
        />
        <StatBlock
          label="Dieser Monat"
          value={isLoading ? "…" : formatWorkingHours(stats?.month_seconds ?? 0)}
          icon={Clock}
        />
        <StatBlock
          label="Dieses Jahr"
          value={isLoading ? "…" : formatWorkingHours(stats?.year_seconds ?? 0)}
          icon={Clock}
        />
      </section>

      <ActiveTimer />
      <RecentList />
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
