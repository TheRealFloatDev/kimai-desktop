import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecentList } from "./RecentList";

const mutate = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useRecent: vi.fn(() => ({
    data: [
      {
        id: 5,
        begin: "2026-01-01T10:00:00",
        duration: 3600,
        project: { id: 1, name: "Web", customer: { id: 1, name: "ACME" } },
        activity: { id: 2, name: "Design" },
        billable: true,
      },
    ],
    isLoading: false,
  })),
  useRestartTimer: vi.fn(() => ({ mutate, isPending: false })),
}));

describe("RecentList", () => {
  it("ruft Restart beim Klick auf", async () => {
    const user = userEvent.setup();
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <RecentList />
      </QueryClientProvider>,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(mutate).toHaveBeenCalledWith(5);
  });
});
