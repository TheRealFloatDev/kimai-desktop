import { createRoute, useNavigate } from "@tanstack/react-router";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutostartToggle } from "@/components/settings/AutostartToggle";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/hooks/useApi";
import { useAuthStore } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { useThemeStore, type ThemeMode } from "@/hooks/useTheme";
import { kimaiApi } from "@/lib/api";
import { isTauriRuntime } from "@/lib/updater";
import { Route as rootRoute } from "./__root";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const { t } = useTranslation();
  const { data: user } = useMe();
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [appVersion, setAppVersion] = useState("0.1.0");

  useEffect(() => {
    if (!isTauriRuntime()) return;
    void getVersion().then(setAppVersion);
  }, []);

  const handleUpdate = async () => {
    setError(null);
    setSaving(true);
    try {
      await kimaiApi.validateConnection(url, token);
      await kimaiApi.setCredentials(url, token);
      setUrl("");
      setToken("");
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await kimaiApi.clearStoredCredentials();
    reset();
    navigate({ to: "/setup" });
  };

  return (
    <div className="mx-auto max-w-xl space-y-16">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      <SettingsSection title={t("language.label")}>
        <LanguageSelector />
      </SettingsSection>

      <SettingsSection
        title={t("settings.appearanceTitle")}
        description={t("settings.appearanceDescription")}
      >
        <div className="space-y-2">
          <Label>{t("theme.label")}</Label>
          <Select
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as ThemeMode)}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t("theme.light")}</SelectItem>
              <SelectItem value="dark">{t("theme.dark")}</SelectItem>
              <SelectItem value="system">{t("theme.system")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("settings.autostartTitle")}
        description={t("settings.autostartDescription")}
      >
        <AutostartToggle />
      </SettingsSection>

      <SettingsSection
        title={t("settings.connectionTitle")}
        description={
          user
            ? t("settings.signedInAs", {
                name: user.alias ?? user.username,
              })
            : t("settings.notConnected")
        }
      >
        <div className="space-y-2">
          <Label>{t("settings.apiUrl")}</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("settings.apiUrlPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("settings.apiToken")}</Label>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("settings.apiTokenPlaceholder")}
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleUpdate} disabled={!url || !token || saving}>
            {t("settings.updateCredentials")}
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            {t("settings.logout")}
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title={t("settings.appTitle")}>
        <p className="text-sm text-muted-foreground">
          {t("app.version", { version: appVersion })}
        </p>
      </SettingsSection>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
