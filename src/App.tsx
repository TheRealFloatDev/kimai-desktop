import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { useAuthStore } from "@/hooks/useAuth";
import { initLocale, translate, useLocaleStore } from "@/i18n";
import { initTheme } from "@/hooks/useTheme";
import { kimaiApi } from "@/lib/api";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppBootstrap() {
  const [ready, setReady] = useState(false);
  const { setUser, setAuthenticating, setError } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await initLocale();
      try {
        const creds = await kimaiApi.getCredentials();
        if (!creds?.url || !creds?.token) {
          await router.navigate({ to: "/setup" });
          setAuthenticating(false);
          setReady(true);
          return;
        }
        const user = await kimaiApi.validateStoredConnection();
        setUser(user);
        setAuthenticating(false);
      } catch (e) {
        setError(String(e));
        setAuthenticating(false);
        await router.navigate({ to: "/setup" });
      } finally {
        setReady(true);
      }
    };
    init();
  }, [setUser, setAuthenticating, setError]);

  useEffect(() => {
    const unlisten = listen<string>("navigate", (event) => {
      if (event.payload) {
        router.navigate({ to: event.payload as "/" });
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);

  const locale = useLocaleStore((s) => s.locale);

  if (!ready || isAuthenticating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {translate(locale, "app.loading")}
        </p>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
    </QueryClientProvider>
  );
}
