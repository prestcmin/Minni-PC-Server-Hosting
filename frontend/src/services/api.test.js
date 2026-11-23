import { beforeEach, describe, expect, it, vi } from "vitest";
import { deployServer, getServerEvents, getServerMetrics, getServerPlayers, getServerWorld, listServers, removeServer, } from "./api";

describe("API service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns servers from a successful request", async () => {
    const servers = [
      {
        server_name: "minecraft-test",
        game: "minecraft",
        status: "running",
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => servers,
      })
    );

    const result = await listServers();

    expect(result).toEqual(servers);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/servers"),
      expect.any(Object)
    );
  });

  it("reports a backend HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          detail: "Backend failure",
        }),
      })
    );

    await expect(listServers()).rejects.toThrow(
      "Backend failure"
    );
  });

  it("reports a network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new Error("Network failure")
      )
    );

    await expect(listServers()).rejects.toThrow(
      "backend could not be reached"
    );
  });

  it("sends deployment data to the correct endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
        }),
      })
    );

    const server = {
      server_name: "terraria-test",
      game: "terraria",
      port_number: 7778,
      world_name: "expert-world",
      world_size: 2,
      difficulty: "expert",
    };

    await deployServer(server);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/servers/terraria-test/deploy"
      ),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          game: "terraria",
          action: "deploy",
          server_name: "terraria-test",
          port_number: 7778,
          world_name: "expert-world",
          world_size: 2,
          difficulty: "expert",
          valheim_modifier: undefined,
        }),
      })
    );
  });

  it("requests events for a server", async () => {
    const events = {
      server_id: 2,
      server_name: "terraria-world-test",
      events: [
        {
          id: 52,
          event_type: "start",
          status: "succeeded",
          message: "start action completed successfully.",
          return_code: 0,
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => events,
      })
    );

    const result = await getServerEvents({
      server_name: "terraria-world-test",
    });

    expect(result).toEqual(events);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/servers/terraria-world-test/events"
      ),
      expect.any(Object)
    );
  });

  it("requests metrics for a server", async () => {
    const metrics = {
      server_id: 2,
      server_name: "terraria-world-test",
      status: "running",
      uptime_seconds: 3600,
      cpu_percent: 8.14,
      memory_percent: 2.49,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => metrics,
      })
    );

    const result = await getServerMetrics({
      server_name: "terraria-world-test",
    });

    expect(result).toEqual(metrics);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/servers/terraria-world-test/metrics"
      ),
      expect.any(Object)
    );
  });

  it("requests players for a server", async () => {
    const players = {
      server_id: 2,
      server_name: "terraria-world-test",
      players: [
        {
          id: 1,
          player_uuid: "test-player-001",
          display_name: "TestPlayer",
          join_count: 2,
          total_playtime_seconds: 0,
          is_active: true,
        },
      ],
      player_count: 1,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => players,
      })
    );

    const result = await getServerPlayers({
      server_name: "terraria-world-test",
    });

    expect(result).toEqual(players);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/servers/terraria-world-test/players"
      ),
      expect.any(Object)
    );
  });

  it("requests world information for a server", async () => {
    const world = {
      server_id: 2,
      server_name: "terraria-world-test",
      world: {
        id: 2,
        world_name: "expert-world",
        world_size: 2,
        difficulty: "expert",
        valheim_modifier: null,
        is_active: true,
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => world,
      })
    );

    const result = await getServerWorld({
      server_name: "terraria-world-test",
    });

    expect(result).toEqual(world);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/servers/terraria-world-test/world"
      ),
      expect.any(Object)
    );
  });

  it("sends a delete request to the correct endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
        }),
      })
    );

    await removeServer({
      server_name: "minecraft-test",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/servers/minecraft-test"
      ),
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});
