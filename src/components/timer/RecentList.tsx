import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRecent, useRestartTimer } from "@/hooks/useApi";
import { formatDuration } from "@/lib/utils";

export function RecentList() {
  const { data: recent = [], isLoading } = useRecent(10);
  const restartTimer = useRestartTimer();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zuletzt verwendet</CardTitle>
        <CardDescription>Schnell neu starten</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Lädt…</p>}
        {!isLoading && recent.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Einträge</p>
        )}
        <ul className="space-y-2">
          {recent.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-md border p-3"
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
                variant="outline"
                disabled={restartTimer.isPending}
                onClick={() => restartTimer.mutate(entry.id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
