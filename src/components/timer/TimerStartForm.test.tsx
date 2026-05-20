import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimerStartForm } from "./TimerStartForm";

vi.mock("@/hooks/useApi", () => ({
  useCustomers: vi.fn(() => ({
    data: [{ id: 1, name: "Kunde A", visible: true }],
  })),
  useProjects: vi.fn(() => ({
    data: [{ id: 10, name: "Projekt B", customer: 1, visible: true }],
  })),
  useActivities: vi.fn(() => ({
    data: [{ id: 20, name: "Coding", visible: true }],
  })),
  useStartTimer: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  })),
}));

describe("TimerStartForm", () => {
  it("deaktiviert Start-Button ohne Projekt und Aktivität", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <TimerStartForm />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("button", { name: /Timer starten/i })).toBeDisabled();
  });

  it("rendert Kunden-Dropdown", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <TimerStartForm />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Kunde")).toBeInTheDocument();
    expect(screen.getByText("Projekt")).toBeInTheDocument();
    expect(screen.getByText("Aktivität")).toBeInTheDocument();
  });
});
