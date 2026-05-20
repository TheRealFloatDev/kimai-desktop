import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/hooks/useApi";
import { useAuthStore } from "@/hooks/useAuth";
import { kimaiApi } from "@/lib/api";
import { Route as rootRoute } from "./__root";

function SettingsPage() {
  const { data: user } = useMe();
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
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
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold">Einstellungen</h2>

      <Card>
        <CardHeader>
          <CardTitle>Verbindung</CardTitle>
          <CardDescription>
            {user
              ? `Angemeldet als ${user.alias ?? user.username}`
              : "Nicht verbunden"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <Button onClick={handleUpdate} disabled={!url || !token || saving}>
            Zugangsdaten aktualisieren
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Abmelden
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Version 0.1.0</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
