import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
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
import { useTranslation } from "@/i18n";
import { kimaiApi } from "@/lib/api";
import { Route as rootRoute } from "./__root";

function SetupPage() {
  const { t } = useTranslation();
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
          <CardTitle>{t("setup.title")}</CardTitle>
          <CardDescription>{t("setup.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LanguageSelector />
          <div className="space-y-2">
            <Label htmlFor="url">{t("setup.url")}</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("setup.urlPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">{t("setup.token")}</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t("setup.tokenPlaceholder")}
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
            {loading ? t("setup.connecting") : t("setup.connect")}
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
