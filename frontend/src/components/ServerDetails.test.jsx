import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import ServerDetails from "./ServerDetails";
import {
  getServerEvents,
  getServerMetrics,
  getServerPlayers,
  getServerWorld,
} from "../services/api";

vi.mock("../services/api", () => ({
  getServerEvents: vi.fn(),
  getServerMetrics: vi.fn(),
  getServerPlayers: vi.fn(),
  getServerWorld: vi.fn(),
}));

describe("ServerDetails", () => {
  const server = {
    id: 2,
    server_name: "terraria-world-test",
    game: "terraria",
    port_number: 7780,
    status: "running",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the restart action callback", async () => {
    getServerMetrics.mockResolvedValue({
      status: "running",
      uptime_seconds: 3600,
      cpu_percent: 8.14,
      memory_percent: 12.5,
    });

    getServerPlayers.mockResolvedValue({
      players: [],
    });

    getServerEvents.mockResolvedValue({
      events: [],
    });

    getServerWorld.mockResolvedValue({
      world: null,
    });

    const onAction = vi.fn();
    const user = userEvent.setup();

    render(
      <ServerDetails
        server={server}
        onBack={vi.fn()}
        onAction={onAction}
      />
    );

    await screen.findByText("terraria-world-test");

    await user.click(
      screen.getByRole("button", {
        name: "Restart",
      })
    );

    expect(onAction).toHaveBeenCalledWith(
      "restart",
      server
    );
  });

  it("shows empty states when optional data is unavailable", async () => {
    getServerMetrics.mockResolvedValue({
      status: "stopped",
      uptime_seconds: null,
      cpu_percent: null,
      memory_percent: null,
    });

    getServerPlayers.mockResolvedValue({
      players: [],
    });

    getServerEvents.mockResolvedValue({
      events: [],
    });

    getServerWorld.mockResolvedValue({
      world: null,
    });

    render(
      <ServerDetails
        server={{
          ...server,
          status: "stopped",
        }}
        onBack={vi.fn()}
      />
    );

    expect(
      await screen.findByText("No world information")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No players recorded")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No recent activity")
    ).toBeInTheDocument();
  });

  it("shows an error when details cannot be loaded", async () => {
    getServerMetrics.mockRejectedValue(
      new Error("Metrics unavailable")
    );

    getServerPlayers.mockResolvedValue({
      players: [],
    });

    getServerEvents.mockResolvedValue({
      events: [],
    });

    getServerWorld.mockResolvedValue({
      world: null,
    });

    render(
      <ServerDetails
        server={server}
        onBack={vi.fn()}
      />
    );

    expect(
      await screen.findByText("Metrics unavailable")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Back to servers",
      })
    ).toBeInTheDocument();
  });

  it("shows loading state while details are requested", () => {
    getServerMetrics.mockReturnValue(
      new Promise(() => {})
    );

    getServerPlayers.mockReturnValue(
      new Promise(() => {})
    );

    getServerEvents.mockReturnValue(
      new Promise(() => {})
    );

    getServerWorld.mockResolvedValue({
      world: null,
    });

    render(
      <ServerDetails
        server={server}
        onBack={vi.fn()}
      />
    );

    expect(
      screen.getByText("Loading server details...")
    ).toBeInTheDocument();
  });

  it("displays server metrics, players, and events", async () => {
    getServerMetrics.mockResolvedValue({
      status: "running",
      uptime_seconds: 3600,
      cpu_percent: 8.14,
      memory_percent: 12.5,
    });

    getServerPlayers.mockResolvedValue({
      server_id: 2,
      server_name: "terraria-world-test",
      player_count: 1,
      players: [
        {
          id: 1,
          player_uuid: "test-player-001",
          display_name: "TestPlayer",
          is_active: true,
        },
      ],
    });

    getServerEvents.mockResolvedValue({
      server_id: 2,
      server_name: "terraria-world-test",
      events: [
        {
          id: 52,
          event_type: "restart",
          status: "succeeded",
          message: "restart action completed successfully.",
          return_code: 0,
        },
      ],
    });

    getServerWorld.mockResolvedValue({
      world: {
        id: 2,
        world_name: "expert-world",
        world_size: 2,
        difficulty: "expert",
        valheim_modifier: null,
        is_active: true,
      },
    });

    render(
      <ServerDetails
        server={server}
        onBack={vi.fn()}
      />
    );

    expect(
      await screen.findByText("terraria-world-test")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/8\.1/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/12\.5/)
    ).toBeInTheDocument();

    expect(
      screen.getByText("1h 0m")
    ).toBeInTheDocument();

    expect(
      screen.getByText("TestPlayer")
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "restart action completed successfully."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("expert-world")
    ).toBeInTheDocument();

    expect(
      screen.getByText("expert")
    ).toBeInTheDocument();  

  });
});
