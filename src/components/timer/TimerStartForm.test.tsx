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
  useTags: vi.fn(() => ({ data: [] as { id: number; name: string }[], isLoading: false })),
  useCreateTag: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

describe("TimerStartForm", () => {
  it("deaktiviert Start-Button ohne Projekt und Aktivität", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <TimerStartForm />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("button", { name: /Start timer/i })).toBeDisabled();
  });

  it("rendert Kunden-Dropdown", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <TimerStartForm />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });
});
