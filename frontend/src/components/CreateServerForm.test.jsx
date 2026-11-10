import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateServerForm from "./CreateServerForm";
import { deployServer } from "../services/api";

vi.mock("../services/api", () => ({
  deployServer: vi.fn(),
}));

describe("CreateServerForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form", () => {
    render(<CreateServerForm onCreated={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: /create a server/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/server name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/game/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/port/i)).toBeInTheDocument();
  });

  it("shows Terraria-specific fields", () => {
    render(<CreateServerForm onCreated={vi.fn()} />);

    expect(screen.getByLabelText(/world size/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/terraria difficulty/i)
    ).toBeInTheDocument();
  });

  it("shows Minecraft difficulty when Minecraft is selected", async () => {
    const user = userEvent.setup();

    render(<CreateServerForm onCreated={vi.fn()} />);

    await user.selectOptions(
      screen.getByLabelText(/game/i),
      "minecraft"
    );

    expect(
      screen.getByLabelText(/minecraft difficulty/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText(/world size/i)
    ).not.toBeInTheDocument();
  });

  it("shows Valheim modifier when Valheim is selected", async () => {
    const user = userEvent.setup();

    render(<CreateServerForm onCreated={vi.fn()} />);

    await user.selectOptions(
      screen.getByLabelText(/game/i),
      "valheim"
    );

    expect(
      screen.getByLabelText(/valheim world modifier/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText(/world size/i)
    ).not.toBeInTheDocument();
  });

  it("requires a server name", async () => {
    const user = userEvent.setup();

    render(<CreateServerForm onCreated={vi.fn()} />);

    const serverNameInput = screen.getByLabelText(/server name/i);

    await user.click(
      screen.getByRole("button", {
        name: /continue to configuration|deploy/i,
      })
    );

    expect(
      screen.getByText("A server name is required.")
    ).toBeInTheDocument();

    expect(deployServer).not.toHaveBeenCalled();

    expect(serverNameInput).toBeInTheDocument();
  });

  it("shows a loading state while deploying", async () => {
    const user = userEvent.setup();
	
    let resolveDeployment;
	
    deployServer.mockReturnValue(
      new Promise((resolve) => {
        resolveDeployment = resolve;
      })
    );
  
    render(<CreateServerForm onCreated={vi.fn()} />);
	
    await user.type(
      screen.getByLabelText(/server name/i),
      "terraria-test"
    );
	
    await user.click(
      screen.getByRole("button", {
        name: /continue to configuration|deploy/i,
      })
    );

    expect(
      await screen.findByText("Deploying...")
    ).toBeInTheDocument();
  
    resolveDeployment({
      success: true,
      server: {
        server_name: "terraria-test",
        status: "running",
      },
    });
	
    await waitFor(() => {
      expect(
        screen.queryByText("Deploying...")
      ).not.toBeInTheDocument();
    });
  });

  it("calls onCreated after a successful deployment", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    deployServer.mockResolvedValue({
      success: true,
      server: {
        server_name: "terraria-test",
        status: "running",
      },
    });

    render(<CreateServerForm onCreated={onCreated} />);

    await user.type(
      screen.getByLabelText(/server name/i),
      "terraria-test"
    );

    await user.click(
      screen.getByRole("button", {
        name: /continue to configuration|deploy/i,
      })
    );

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it("displays a deployment error", async () => {
    const user = userEvent.setup();

    deployServer.mockRejectedValue(
      new Error("Ansible operation failed.")
    );

    render(<CreateServerForm onCreated={vi.fn()} />);

    await user.type(
      screen.getByLabelText(/server name/i),
      "terraria-test"
    );

    await user.click(
      screen.getByRole("button", {
        name: /continue to configuration|deploy/i,
      })
    );

    expect(
      await screen.findByText("Ansible operation failed.")
    ).toBeInTheDocument();
  });
});
