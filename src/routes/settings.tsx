import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useThemeStore, type ThemeMode } from "@/hooks/useTheme";
import { kimaiApi } from "@/lib/api";
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
  const { data: user } = useMe();
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        <h2 className="text-2xl font-semibold tracking-tight">Einstellungen</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Verbindung, Darstellung und App-Infos
        </p>
      </div>

      <SettingsSection
        title="Darstellung"
        description="Hell, dunkel oder an das System anpassen"
      >
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as ThemeMode)}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Hell</SelectItem>
              <SelectItem value="dark">Dunkel</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Verbindung"
        description={
          user
            ? `Angemeldet als ${user.alias ?? user.username}`
            : "Nicht verbunden"
        }
      >
        <div className="space-y-2">
          <Label>API-URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://kimai.example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>API-Token</Label>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Neues Token"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleUpdate} disabled={!url || !token || saving}>
            Zugangsdaten aktualisieren
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Abmelden
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="App">
        <p className="text-sm text-muted-foreground">Version 0.1.0</p>
      </SettingsSection>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
