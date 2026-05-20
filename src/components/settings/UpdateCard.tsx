import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import type { Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { checkForAppUpdate, isTauriRuntime } from "@/lib/updater";

type Phase =
  | "hidden"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export function UpdateCard() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("hidden");
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    if (!isTauriRuntime()) return;
    try {
      const found = await checkForAppUpdate();
      if (found) {
        setUpdate(found);
        setPhase("available");
        setError(null);
      } else {
        setUpdate(null);
        setPhase("hidden");
      }
    } catch (e) {
      setError(String(e));
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  const handleDownload = async () => {
    if (!update) return;
    setPhase("downloading");
    setProgress(0);
    setError(null);
    try {
      let total = 0;
      let downloaded = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0;
          downloaded = 0;
          setProgress(total > 0 ? 0 : 50);
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          setProgress(
            total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 50,
          );
        } else if (event.event === "Finished") {
          setProgress(100);
        }
      });
      setPhase("ready");
    } catch (e) {
      setError(String(e));
      setPhase("error");
    }
  };

  const handleRestart = async () => {
    await relaunch();
  };

  if (phase === "hidden") return null;

  const percentLabel =
    progress > 0 ? t("updater.progress", { percent: progress }) : t("updater.downloading");

  return (
    <div className="mx-3 mb-3 space-y-2.5 rounded-md border border-border/50 bg-muted/30 p-3">
      <div>
        <p className="text-xs font-medium">{t("updater.title")}</p>
        {update && phase !== "error" && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("updater.version", { version: update.version })}
          </p>
        )}
      </div>

      {phase === "available" && (
        <Button size="sm" className="h-8 w-full" onClick={() => void handleDownload()}>
          <Download className="mr-2 h-3.5 w-3.5" />
          {t("updater.download")}
        </Button>
      )}

      {phase === "downloading" && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[10px] text-muted-foreground">{percentLabel}</p>
        </div>
      )}

      {phase === "ready" && (
        <Button size="sm" className="h-8 w-full" onClick={() => void handleRestart()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          {t("updater.restart")}
        </Button>
      )}

      {phase === "error" && (
        <div className="space-y-2">
          {error && (
            <p className="text-[10px] leading-snug text-destructive">{error}</p>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-full"
            onClick={() => void runCheck()}
          >
            {t("updater.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
