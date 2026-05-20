import { useState } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timer</CardTitle>
        </CardHeader>
        <CardContent>Lädt…</CardContent>
      </Card>
    );
  }

  if (!timer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kein aktiver Timer</CardTitle>
          <CardDescription>Starte einen neuen Zeiteintrag</CardDescription>
        </CardHeader>
        <CardContent>
          <TimerStartForm />
        </CardContent>
      </Card>
    );
  }

  const customerName =
    timer.project.customer?.name ?? `Kunde #${timer.project.customer?.id ?? "?"}`;

  return (
    <>
      <Card className="border-primary/30">
        <CardHeader>
          <CardDescription>Aktiver Timer</CardDescription>
          <CardTitle className="text-4xl font-mono tabular-nums">
            {formatDuration(duration)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{customerName}</p>
            <p className="text-muted-foreground">
              {timer.project.name} · {timer.activity.name}
            </p>
            {timer.description && (
              <p className="mt-2 text-sm">{timer.description}</p>
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
        </CardContent>
      </Card>

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
