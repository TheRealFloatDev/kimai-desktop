import { useState } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import { useActiveTimer, useLiveDuration, useStopTimer } from "@/hooks/useApi";
import { formatDuration } from "@/lib/utils";

export function ActiveTimer() {
  const { t } = useTranslation();
  const { data: timer, isLoading } = useActiveTimer();
  const { data: duration = 0 } = useLiveDuration(timer);
  const stopTimer = useStopTimer();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !timer) {
    return null;
  }

  const customerName =
    timer.project.customer?.name ??
    t("timer.customerFallback", { id: timer.project.customer?.id ?? "?" });

  return (
    <>
      <section className="flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-border/50 pb-8">
        <div className="shrink-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("timer.active")}
          </p>
          <p className="mt-1 font-mono text-4xl font-light tabular-nums tracking-tight sm:text-5xl">
            {formatDuration(duration)}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">{t("timer.customer")}</p>
            <p className="font-medium">{customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("timer.project")}</p>
            <p className="font-medium">{timer.project.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("timer.activity")}</p>
            <p className="font-medium">{timer.activity.name}</p>
          </div>
          {timer.description && (
            <div className="min-w-[12rem] flex-1">
              <p className="text-xs text-muted-foreground">
                {t("timer.description")}
              </p>
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
          {t("timer.stop")}
        </Button>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("timer.stopConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("timer.stopConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
