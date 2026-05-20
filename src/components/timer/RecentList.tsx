import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimesheetDurationAside } from "@/components/timesheet/TimesheetMetaAside";
import { TimesheetEntryLabels } from "@/components/timesheet/TimesheetEntryLabels";
import { useTranslation } from "@/i18n";
import { useRecent, useRestartTimer } from "@/hooks/useApi";

export function RecentList() {
  const { t } = useTranslation();
  const { data: recent = [], isLoading } = useRecent(5);
  const restartTimer = useRestartTimer();

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">
          {t("timer.recentTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("timer.recentSubtitle")}
        </p>
      </div>
      {isLoading && (
        <p className="text-sm text-muted-foreground">{t("timer.recentLoading")}</p>
      )}
      {!isLoading && recent.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("timer.recentEmpty")}</p>
      )}
      <ul className="space-y-1">
        {recent.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center gap-4 rounded-lg py-1"
          >
            <TimesheetDurationAside duration={entry.duration} />
            <div className="min-w-0 flex-1">
              <TimesheetEntryLabels entry={entry} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={restartTimer.isPending}
              onClick={() => restartTimer.mutate(entry.id)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("timer.restart")}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
