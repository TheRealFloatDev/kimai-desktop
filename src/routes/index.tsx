import { createRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Timer } from "lucide-react";
import { ActiveTimer } from "@/components/timer/ActiveTimer";
import { RecentList } from "@/components/timer/RecentList";
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();
  const { data: stats, isLoading } = useWorkingStats();

  return (
    <div className="mx-auto min-h-0 max-w-5xl space-y-16 pb-4">
      <ActiveTimer />

      <section className="grid gap-10 border-b border-border/50 pb-16 sm:grid-cols-2 xl:grid-cols-4">
        <StatBlock
          label={t("dashboard.statsToday")}
          value={isLoading ? "…" : formatWorkingHours(stats?.today_seconds ?? 0)}
          icon={Clock}
        />
        <StatBlock
          label={t("dashboard.statsWeek")}
          value={isLoading ? "…" : formatWorkingHours(stats?.week_seconds ?? 0)}
          icon={CalendarDays}
        />
        <StatBlock
          label={t("dashboard.statsMonth")}
          value={isLoading ? "…" : formatWorkingHours(stats?.month_seconds ?? 0)}
          icon={Timer}
        />
        <StatBlock
          label={t("dashboard.statsYear")}
          value={isLoading ? "…" : formatWorkingHours(stats?.year_seconds ?? 0)}
          icon={Clock}
        />
      </section>

      <RecentList />
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
