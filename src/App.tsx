import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { useAuthStore } from "@/hooks/useAuth";
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

  if (!ready || isAuthenticating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Lädt…</p>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
    </QueryClientProvider>
  );
}
