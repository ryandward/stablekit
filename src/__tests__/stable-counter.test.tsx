import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StableCounter } from "../index";

describe("StableCounter", () => {
  it("renders the value visibly", () => {
    render(<StableCounter value="42" reserve="999" />);
    expect(screen.getByText("42")).toBeVisible();
  });

  it("renders the reserve node in the DOM", () => {
    render(<StableCounter value="42" reserve="999" />);
    expect(screen.getByText("999")).toBeInTheDocument();
  });

  it("reserve node is hidden from users", () => {
    render(<StableCounter value="42" reserve="999" />);
    const reserveNode = screen.getByText("999");
    expect(reserveNode).toHaveAttribute("aria-hidden", "true");
    expect(reserveNode).toHaveStyle({ visibility: "hidden" });
  });

  it("reserve and value overlap in the same grid cell", () => {
    render(<StableCounter value="5" reserve="999" />);
    const reserveNode = screen.getByText("999");
    const valueNode = screen.getByText("5");
    expect(reserveNode).toHaveStyle({ gridArea: "1 / 1" });
    expect(valueNode).toHaveStyle({ gridArea: "1 / 1" });
  });

  it("container uses inline-grid display", () => {
    const { container } = render(<StableCounter value="5" reserve="999" />);
    expect(container.firstElementChild).toHaveStyle({ display: "inline-grid" });
  });

  it("renders as span by default", () => {
    const { container } = render(<StableCounter value="5" reserve="999" />);
    expect(container.firstElementChild!.tagName).toBe("SPAN");
  });

  it("accepts custom element via as prop", () => {
    const { container } = render(<StableCounter value="5" reserve="999" as="div" />);
    expect(container.firstElementChild!.tagName).toBe("DIV");
  });

  it("accepts ReactNode for value and reserve", () => {
    render(
      <StableCounter
        value={<strong data-testid="val">$42</strong>}
        reserve={<strong data-testid="res">$99,999</strong>}
      />
    );
    expect(screen.getByTestId("val")).toBeVisible();
    expect(screen.getByTestId("res")).toBeInTheDocument();
  });

  it("passes through className and style", () => {
    const { container } = render(
      <StableCounter
        value="1"
        reserve="9"
        className="my-counter"
        style={{ color: "red" }}
      />
    );
    const el = container.firstElementChild!;
    expect(el).toHaveClass("my-counter");
    expect(el).toHaveStyle({ color: "rgb(255, 0, 0)", display: "inline-grid" });
  });

  it("reserve node has pointerEvents none", () => {
    render(<StableCounter value="42" reserve="999" />);
    expect(screen.getByText("999")).toHaveStyle({ pointerEvents: "none" });
  });
});
