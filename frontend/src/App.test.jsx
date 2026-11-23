import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getHealth, getServerMetrics, listServers, } from "./services/api";
import userEvent from "@testing-library/user-event";

vi.mock("./services/api", () => ({
  getHealth: vi.fn(),
  getServerMetrics: vi.fn(),
  listServers: vi.fn(),
  deployServer: vi.fn(),
  startServer: vi.fn(),
  stopServer: vi.fn(),
  restartServer: vi.fn(),
  removeServer: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays servers", async () => {
  const user = userEvent.setup();

  getHealth.mockResolvedValue({
    status: "healthy",
  });

  getServerMetrics.mockResolvedValue({
    status: "running",
    uptime_seconds: 3600,
    cpu_percent: 8.14,
    memory_usage_bytes: 256 * 1024 * 1024,
    memory_limit_bytes: 2 * 1024 * 1024 * 1024,
    memory_percent: 12.5,
    network_rx_bytes: 1000,
    network_tx_bytes: 2000,
  });

  listServers.mockResolvedValue([
    {
      server_name: "minecraft-test",
      game: "minecraft",
      port_number: 25566,
      status: "running",
    },
  ]);

  render(<App />);

  await user.click(
    screen.getByRole("button", {
      name: "Servers",
    })
  );

  expect(
    await screen.findByText("minecraft-test")
  ).toBeInTheDocument();
});

  it("shows live dashboard metrics", async () => {
    getHealth.mockResolvedValue({
      status: "healthy",
    });

    listServers.mockResolvedValue([
      {
        server_name: "terraria-world-test",
        game: "terraria",
        port_number: 7780,
        status: "running",
      },
    ]);

    render(<App />);

    expect(
      await screen.findByText(/CPU usage/)
    ).toBeInTheDocument();

    expect(screen.getByText(/8\.1/)).toBeInTheDocument();
    expect(screen.getByText(/12\.5/)).toBeInTheDocument();
    expect(screen.getByText(/3600/)).toBeInTheDocument();
  });

  it("shows an error when servers cannot be loaded", async () => {
    getHealth.mockResolvedValue({
      status: "healthy",
    });

    listServers.mockRejectedValue(
      new Error("Backend unavailable")
    );

    render(<App />);

    expect(
      await screen.findByText("Backend unavailable")
    ).toBeInTheDocument();
  });
});
