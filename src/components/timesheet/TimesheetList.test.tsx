import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimesheetDataTable } from "./TimesheetDataTable";

describe("TimesheetDataTable", () => {
  it("rendert Timesheet-Zeilen mit Namen", () => {
    render(
      <TimesheetDataTable
        timesheets={[
          {
            id: 1,
            begin: "2026-05-20T09:00:00",
            end: "2026-05-20T10:00:00",
            duration: 3600,
            description: "Meeting",
            rate: 100,
            project: {
              id: 1,
              name: "Web",
              customer: { id: 1, name: "ACME" },
            },
            activity: { id: 2, name: "Dev" },
          },
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.getByText("ACME")).toBeInTheDocument();
    expect(screen.getByText("Web")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
  });
});
