import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import { useActiveTimer } from "@/hooks/useApi";
import { TimerStartForm } from "./TimerStartForm";

export function TimerStartButton() {
  const { t } = useTranslation();
  const { data: timer, isLoading } = useActiveTimer();
  const [open, setOpen] = useState(false);

  if (isLoading || timer) {
    return null;
  }

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <Play className="mr-2 h-4 w-4" />
        {t("timer.start")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("timer.startTitle")}</DialogTitle>
            <DialogDescription>{t("timer.startDescription")}</DialogDescription>
          </DialogHeader>
          <TimerStartForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
