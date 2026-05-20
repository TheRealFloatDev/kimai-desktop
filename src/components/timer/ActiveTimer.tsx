import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveTimer, useLiveDuration, useStopTimer } from "@/hooks/useApi";
import { useTimerAnchor } from "@/hooks/useTimerAnchor";
import { formatDuration } from "@/lib/utils";
import { TimerStartForm } from "./TimerStartForm";

export function ActiveTimer() {
  const { data: timer, isLoading } = useActiveTimer();
  const { data: duration = 0 } = useLiveDuration(timer);
  const stopTimer = useStopTimer();
  const setStartedAtMs = useTimerAnchor((s) => s.setStartedAtMs);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!timer) setStartedAtMs(null);
  }, [timer, setStartedAtMs]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h3 className="text-lg font-medium tracking-tight">Timer</h3>
        <p className="text-sm text-muted-foreground">Lädt…</p>
      </section>
    );
  }

  if (!timer) {
    return (
      <section className="space-y-8">
        <div>
          <h3 className="text-lg font-medium tracking-tight">
            Kein aktiver Timer
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Starte einen neuen Zeiteintrag
          </p>
        </div>
        <TimerStartForm />
      </section>
    );
  }

  const customerName =
    timer.project.customer?.name ??
    `Kunde #${timer.project.customer?.id ?? "?"}`;

  return (
    <>
      <section className="space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Aktiver Timer
          </p>
          <p className="mt-3 font-mono text-5xl font-light tabular-nums tracking-tight">
            {formatDuration(duration)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-medium">{customerName}</p>
          <p className="text-muted-foreground">
            {timer.project.name} · {timer.activity.name}
          </p>
          {timer.description && (
            <p className="pt-2 text-sm text-muted-foreground">
              {timer.description}
            </p>
          )}
        </div>
        <Button
          variant="destructive"
          onClick={() => setConfirmOpen(true)}
          disabled={stopTimer.isPending}
        >
          <Square className="mr-2 h-4 w-4" />
          Timer stoppen
        </Button>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer stoppen?</DialogTitle>
            <DialogDescription>
              Der laufende Zeiteintrag wird beendet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                stopTimer.mutate(timer.id, {
                  onSuccess: () => setConfirmOpen(false),
                });
              }}
            >
              Stoppen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
