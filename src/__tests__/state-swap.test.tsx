import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StateSwap } from "../index";

describe("StateSwap", () => {
  it("shows true content when state is true", () => {
    render(<StateSwap state={true} true="Close" false="Open" />);
    const trueView = screen.getByText("Close").closest("[inert]") ?? screen.getByText("Close");
    expect(trueView).not.toHaveAttribute("inert");
  });

  it("shows false content when state is false", () => {
    render(<StateSwap state={false} true="Close" false="Open" />);
    const falseView = screen.getByText("Open").closest("[inert]") ?? screen.getByText("Open");
    expect(falseView).not.toHaveAttribute("inert");
  });

  it("hides inactive content with inert", () => {
    render(<StateSwap state={true} true="Close" false="Open" />);
    const openText = screen.getByText("Open");
    const inertParent = openText.closest("[inert]");
    expect(inertParent).toBeTruthy();
  });

  it("renders as span by default", () => {
    const { container } = render(<StateSwap state={true} true="A" false="B" />);
    expect(container.querySelector("span.sk-layout-group")).toBeTruthy();
  });

  it("accepts custom element via as prop", () => {
    const { container } = render(<StateSwap state={true} true="A" false="B" as="div" />);
    expect(container.querySelector("div.sk-layout-group")).toBeTruthy();
  });

  it("renders ReactNode content (not just strings)", () => {
    render(
      <StateSwap
        state={true}
        true={<span data-testid="icon-up">Up</span>}
        false={<span data-testid="icon-down">Down</span>}
      />
    );
    expect(screen.getByTestId("icon-up")).toBeInTheDocument();
    expect(screen.getByTestId("icon-down")).toBeInTheDocument();
  });
});
