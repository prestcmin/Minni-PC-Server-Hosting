import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ServerList from "./ServerList";

const server = {
  server_name: "minecraft-test",
  game: "minecraft",
  port_number: 25566,
  status: "running",
};

const defaultProps = {
  servers: [server],
  loading: false,
  error: "",
  onRefresh: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
  onRestart: vi.fn(),
  onRemove: vi.fn(),
  activeActions: {},
};

describe("ServerList", () => {
  it("shows a loading message", () => {
    render(
      <ServerList
        {...defaultProps}
        loading={true}
      />
    );

    expect(screen.getByText("Loading servers...")).toBeInTheDocument();
  });

  it("shows an error message and retry button", () => {
    const onRefresh = vi.fn();

    render(
      <ServerList
        {...defaultProps}
        servers={[]}
        error="Backend unavailable"
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", {
      name: /try again/i,
    });

    expect(retryButton).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(
      <ServerList
        {...defaultProps}
        servers={[]}
      />
    );

    expect(screen.getByText("No servers deployed")).toBeInTheDocument();
  });

  it("shows server information", () => {
    render(<ServerList {...defaultProps} />);

    expect(screen.getByText("minecraft-test")).toBeInTheDocument();
    expect(screen.getByText(/minecraft\s+·\s+Port\s+25566/i)).toBeInTheDocument();
    expect(screen.getByText(/25566/)).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("calls the start callback", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();

    render(
      <ServerList
        {...defaultProps}
        onStart={onStart}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /^start$/i })
    );

    expect(onStart).toHaveBeenCalledWith(server);
  });

  it("calls the stop callback", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();

    render(
      <ServerList
        {...defaultProps}
        onStop={onStop}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /^stop$/i })
    );

    expect(onStop).toHaveBeenCalledWith(server);
  });

  it("calls the restart callback", async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();

    render(
      <ServerList
        {...defaultProps}
        onRestart={onRestart}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /^restart$/i })
    );

    expect(onRestart).toHaveBeenCalledWith(server);
  });

  it("calls the remove callback", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <ServerList
        {...defaultProps}
        onRemove={onRemove}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /^remove$/i })
    );

    expect(onRemove).toHaveBeenCalledWith(server);
  });

  it("disables a button while an action is active", () => {
    render(
      <ServerList
        {...defaultProps}
        activeActions={{
          "minecraft-test-start": true,
        }}
      />
    );

    const startButton = screen.getByRole("button", {
      name: /starting/i,
    });

    expect(startButton).toBeDisabled();
  });
});
