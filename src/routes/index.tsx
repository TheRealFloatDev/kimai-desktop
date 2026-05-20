import { createRoute } from "@tanstack/react-router";
import { Clock, Timer } from "lucide-react";
import { ActiveTimer } from "@/components/timer/ActiveTimer";
import { RecentList } from "@/components/timer/RecentList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkingStats } from "@/hooks/useApi";
import { formatWorkingHours } from "@/lib/utils";
import { Route as rootRoute } from "./__root";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock;
}) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { data: stats, isLoading } = useWorkingStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Übersicht deiner erfassten Arbeitszeit
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Heute"
          value={isLoading ? "…" : formatWorkingHours(stats?.today_seconds ?? 0)}
          icon={Clock}
        />
        <StatCard
          label="Diese Stunde"
          value={isLoading ? "…" : formatWorkingHours(stats?.hour_seconds ?? 0)}
          icon={Timer}
        />
        <StatCard
          label="Dieser Monat"
          value={isLoading ? "…" : formatWorkingHours(stats?.month_seconds ?? 0)}
          icon={Clock}
        />
        <StatCard
          label="Dieses Jahr"
          value={isLoading ? "…" : formatWorkingHours(stats?.year_seconds ?? 0)}
          icon={Clock}
        />
      </div>

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
