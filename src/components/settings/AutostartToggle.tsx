import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { kimaiApi } from "@/lib/api";

export function AutostartToggle() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kimaiApi
      .getAppPreferences()
      .then((prefs) => setEnabled(prefs.autostart))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (checked: boolean) => {
    setEnabled(checked);
    try {
      await kimaiApi.setAutostartEnabled(checked);
    } catch {
      setEnabled(!checked);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="autostart"
        checked={enabled}
        disabled={loading}
        onCheckedChange={(v) => void handleChange(v === true)}
      />
      <Label htmlFor="autostart">{t("settings.autostartLabel")}</Label>
    </div>
  );
}
