import { Link, useRouterState } from "@tanstack/react-router";
import { Clock, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/history", label: "History", icon: Clock },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border/50 bg-background">
      <div className="flex items-center gap-3 px-5 py-8">
        <img
          src="/logo-transparent.png"
          alt="Kimai"
          className="h-9 w-9 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight">Kimai</h1>
          <p className="text-xs text-muted-foreground">Desktop</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {mainNavItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/80",
              pathname === to && "bg-muted text-foreground",
            )}
          >
            <Icon className="h-4 w-4 opacity-70" />
            {label}
          </Link>
        ))}
      </nav>

      <nav className="px-3 pb-6">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/80",
            pathname === "/settings" && "bg-muted text-foreground",
          )}
        >
          <Settings className="h-4 w-4 opacity-70" />
          Einstellungen
        </Link>
      </nav>
    </aside>
  );
}
