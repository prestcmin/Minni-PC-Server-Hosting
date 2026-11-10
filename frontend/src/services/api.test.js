import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deployServer,
  listServers,
  removeServer,
} from "./api";

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
