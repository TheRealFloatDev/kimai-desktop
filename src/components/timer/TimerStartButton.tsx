import { useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import {
  useActiveTimer,
  useLiveDuration,
  useStopTimer,
} from "@/hooks/useApi";
import { formatDuration } from "@/lib/utils";
import { TimerStartForm } from "./TimerStartForm";

export function TimerStartButton() {
  const { t } = useTranslation();
  const { data: timer, isLoading } = useActiveTimer();
  const { data: duration = 0 } = useLiveDuration(timer);
  const stopTimer = useStopTimer();
  const [startOpen, setStartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <Button className="w-full" disabled variant="outline">
        …
      </Button>
    );
  }

  if (timer) {
    return (
      <>
        <Button
          variant="destructive"
          className="h-9 w-full justify-between gap-2 px-3"
          onClick={() => setConfirmOpen(true)}
          disabled={stopTimer.isPending}
        >
          <Square className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-center font-mono text-sm font-light tabular-nums">
            {formatDuration(duration)}
          </span>
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("timer.stopConfirmTitle")}</DialogTitle>
              <DialogDescription>
                {t("timer.stopConfirmDescription")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                {t("timer.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  stopTimer.mutate(timer.id, {
                    onSuccess: () => setConfirmOpen(false),
                  });
                }}
              >
                {t("timer.stop")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button className="w-full" onClick={() => setStartOpen(true)}>
        <Play className="mr-2 h-4 w-4" />
        {t("timer.start")}
      </Button>

      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("timer.startTitle")}</DialogTitle>
            <DialogDescription>{t("timer.startDescription")}</DialogDescription>
          </DialogHeader>
          <TimerStartForm onSuccess={() => setStartOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
