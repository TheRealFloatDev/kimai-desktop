import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimesheetEditDialog } from "./TimesheetEditDialog";

vi.mock("@/hooks/useApi", () => ({
  useProjects: vi.fn(() => ({
    data: [{ id: 1, name: "P1", customer: 1, visible: true }],
  })),
  useActivities: vi.fn(() => ({
    data: [{ id: 2, name: "A1", visible: true }],
  })),
  useUpdateTimesheet: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

describe("TimesheetEditDialog", () => {
  it("zeigt Formular wenn geöffnet", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <TimesheetEditDialog
          open
          onOpenChange={vi.fn()}
          timesheet={{
            id: 99,
            begin: "2026-05-20T08:00:00",
            end: "2026-05-20T09:00:00",
            project: { id: 1, name: "P1", customer: { id: 1, name: "C" } },
            activity: { id: 2, name: "A1" },
            description: "Arbeit",
            billable: true,
          }}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Edit time entry")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Arbeit")).toBeInTheDocument();
  });
});
