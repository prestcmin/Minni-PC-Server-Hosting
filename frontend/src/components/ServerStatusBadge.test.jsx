import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ServerStatusBadge from "./ServerStatusBadge";

describe("ServerStatusBadge", () => {
  it("displays running status", () => {
    render(<ServerStatusBadge status="running" />);

    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("displays stopped status", () => {
    render(<ServerStatusBadge status="stopped" />);

    expect(screen.getByText("Stopped")).toBeInTheDocument();
  });

  it("displays deploying status", () => {
    render(<ServerStatusBadge status="deploying" />);

    expect(screen.getByText("Deploying")).toBeInTheDocument();
  });

  it("displays failed status", () => {
    render(<ServerStatusBadge status="failed" />);

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("uses unknown for an empty status", () => {
    render(<ServerStatusBadge />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
