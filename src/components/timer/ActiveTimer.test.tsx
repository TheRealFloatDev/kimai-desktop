import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActiveTimer } from "./ActiveTimer";

vi.mock("@/hooks/useApi", () => ({
  useActiveTimer: vi.fn(),
  useLiveDuration: vi.fn(),
  useStopTimer: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("./TimerStartForm", () => ({
  TimerStartForm: () => <div>Start Form</div>,
}));

import { useActiveTimer, useLiveDuration } from "@/hooks/useApi";

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("ActiveTimer", () => {
  it("zeigt Start-Formular wenn kein Timer aktiv", () => {
    vi.mocked(useActiveTimer).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useActiveTimer>);
    vi.mocked(useLiveDuration).mockReturnValue({
      data: 0,
    } as ReturnType<typeof useLiveDuration>);

    renderWithClient(<ActiveTimer />);
    expect(screen.getByText("Kein aktiver Timer")).toBeInTheDocument();
    expect(screen.getByText("Start Form")).toBeInTheDocument();
  });

  it("zeigt laufenden Timer mit Dauer", () => {
    vi.mocked(useActiveTimer).mockReturnValue({
      data: {
        id: 1,
        begin: new Date().toISOString(),
        project: { id: 1, name: "Projekt A", customer: { id: 1, name: "Kunde X" } },
        activity: { id: 2, name: "Dev" },
        description: "Test",
      },
      isLoading: false,
    } as ReturnType<typeof useActiveTimer>);
    vi.mocked(useLiveDuration).mockReturnValue({
      data: 3661,
    } as ReturnType<typeof useLiveDuration>);

    renderWithClient(<ActiveTimer />);
    expect(screen.getByText("01:01:01")).toBeInTheDocument();
    expect(screen.getByText(/Kunde X/)).toBeInTheDocument();
    expect(screen.getByText("Timer stoppen")).toBeInTheDocument();
  });
});
