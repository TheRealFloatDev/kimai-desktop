import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecent, useRestartTimer } from "@/hooks/useApi";
import { formatDuration } from "@/lib/utils";

export function RecentList() {
  const { data: recent = [], isLoading } = useRecent(10);
  const restartTimer = useRestartTimer();

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">
          Zuletzt verwendet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Schnell neu starten</p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Lädt…</p>}
      {!isLoading && recent.length === 0 && (
        <p className="text-sm text-muted-foreground">Keine Einträge</p>
      )}
      <ul className="divide-y divide-border/60">
        {recent.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-4 py-4 first:pt-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {entry.project.customer?.name ?? entry.project.name} ·{" "}
                {entry.project.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {entry.activity.name}
                {entry.duration != null &&
                  ` · ${formatDuration(entry.duration)}`}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={restartTimer.isPending}
              onClick={() => restartTimer.mutate(entry.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
