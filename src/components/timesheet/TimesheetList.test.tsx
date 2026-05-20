import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimesheetList } from "./TimesheetList";

describe("TimesheetList", () => {
  it("rendert Timesheet-Zeilen", () => {
    render(
      <TimesheetList
        timesheets={[
          {
            id: 1,
            begin: "2026-05-20T09:00:00",
            end: "2026-05-20T10:00:00",
            duration: 3600,
            project: 1,
            activity: 2,
            description: "Meeting",
            rate: 100,
          },
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });
});
