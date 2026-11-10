import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getHealth, listServers, } from "./services/api";
import userEvent from "@testing-library/user-event";

vi.mock("./services/api", () => ({
  getHealth: vi.fn(),
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
