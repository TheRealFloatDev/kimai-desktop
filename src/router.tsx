import { createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as historyRoute } from "./routes/history";
import { Route as settingsRoute } from "./routes/settings";
import { Route as setupRoute } from "./routes/setup";

const routeTree = rootRoute.addChildren([
  indexRoute,
  historyRoute,
  settingsRoute,
  setupRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
