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
import { useAuthStore } from "@/hooks/useAuth";
import { kimaiApi } from "@/lib/api";
import { Route as rootRoute } from "./__root";

function SetupPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthenticating = useAuthStore((s) => s.setAuthenticating);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await kimaiApi.validateConnection(url, token);
      await kimaiApi.setCredentials(url, token);
      setUser(user);
      setAuthenticating(false);
      navigate({ to: "/" });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kimai Desktop einrichten</CardTitle>
          <CardDescription>
            Instanz-URL ohne <code className="text-xs">/api</code> (z. B.{" "}
            https://kimai.example.com) und dein API-Token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Kimai-URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://kimai.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">API-Token</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Dein API-Token"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            className="w-full"
            onClick={handleConnect}
            disabled={!url || !token || loading}
          >
            {loading ? "Verbinde…" : "Verbinden"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setup",
  component: SetupPage,
});
