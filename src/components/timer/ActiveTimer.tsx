import { useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveTimer, useLiveDuration, useStopTimer } from "@/hooks/useApi";
import { formatDuration } from "@/lib/utils";
import { TimerStartForm } from "./TimerStartForm";

export function ActiveTimer() {
  const { data: timer, isLoading } = useActiveTimer();
  const { data: duration = 0 } = useLiveDuration(timer);
  const stopTimer = useStopTimer();
  const [startOpen, setStartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <section className="border-b border-border/50 pb-8">
        <p className="text-sm text-muted-foreground">Timer lädt…</p>
      </section>
    );
  }

  if (!timer) {
    return (
      <>
        <section className="border-b border-border/50 pb-8">
          <Button size="lg" onClick={() => setStartOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Timer starten
          </Button>
        </section>

        <Dialog open={startOpen} onOpenChange={setStartOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Timer starten</DialogTitle>
              <DialogDescription>
                Kunde, Projekt und Aktivität wählen
              </DialogDescription>
            </DialogHeader>
            <TimerStartForm onSuccess={() => setStartOpen(false)} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const customerName =
    timer.project.customer?.name ??
    `Kunde #${timer.project.customer?.id ?? "?"}`;

  return (
    <>
      <section className="flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-border/50 pb-8">
        <div className="shrink-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Aktiver Timer
          </p>
          <p className="mt-1 font-mono text-4xl font-light tabular-nums tracking-tight sm:text-5xl">
            {formatDuration(duration)}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Kunde</p>
            <p className="font-medium">{customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Projekt</p>
            <p className="font-medium">{timer.project.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Aktivität</p>
            <p className="font-medium">{timer.activity.name}</p>
          </div>
          {timer.description && (
            <div className="min-w-[12rem] flex-1">
              <p className="text-xs text-muted-foreground">Beschreibung</p>
              <p className="text-muted-foreground">{timer.description}</p>
            </div>
          )}
        </div>

        <Button
          variant="destructive"
          className="shrink-0"
          onClick={() => setConfirmOpen(true)}
          disabled={stopTimer.isPending}
        >
          <Square className="mr-2 h-4 w-4" />
          Stoppen
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
          <div className="flex justify-end gap-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
