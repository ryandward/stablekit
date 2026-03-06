import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StableField } from "../index";

describe("StableField", () => {
  it("renders children (field content)", () => {
    render(
      <StableField reserve="Error text">
        <input data-testid="input" />
      </StableField>
    );
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("renders the reserve node in the DOM", () => {
    render(
      <StableField reserve="Please enter a valid email">
        <input />
      </StableField>
    );
    expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
  });

  it("reserve node is hidden from users", () => {
    render(
      <StableField reserve="Error message">
        <input />
      </StableField>
    );
    const reserveNode = screen.getByText("Error message");
    expect(reserveNode).toHaveAttribute("aria-hidden", "true");
    expect(reserveNode).toHaveStyle({ visibility: "hidden" });
  });

  it("reserve and error slot overlap in the same grid cell", () => {
    render(
      <StableField error="Bad input" reserve="Error message placeholder">
        <input />
      </StableField>
    );
    const reserveNode = screen.getByText("Error message placeholder");
    const errorNode = screen.getByText("Bad input");
    expect(reserveNode).toHaveStyle({ gridArea: "1 / 1" });
    expect(errorNode).toHaveStyle({ gridArea: "1 / 1" });
  });

  it("shows error message when error is provided", () => {
    render(
      <StableField error="This field is required" reserve="This field is required">
        <input />
      </StableField>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("This field is required");
  });

  it("error slot is hidden when error is undefined", () => {
    const { container } = render(
      <StableField reserve="Error text">
        <input />
      </StableField>
    );
    // The error span (second span in the grid) should be hidden
    const grid = container.querySelector("[style*='display: grid']")!;
    const errorSpan = grid.querySelectorAll("span")[1];
    expect(errorSpan).toHaveStyle({ visibility: "hidden" });
  });

  it("error slot is hidden when error is empty string", () => {
    const { container } = render(
      <StableField error="" reserve="Error text">
        <input />
      </StableField>
    );
    const grid = container.querySelector("[style*='display: grid']")!;
    const errorSpan = grid.querySelectorAll("span")[1];
    expect(errorSpan).toHaveStyle({ visibility: "hidden" });
  });

  it("error slot is hidden when error is null", () => {
    const { container } = render(
      <StableField error={null} reserve="Error text">
        <input />
      </StableField>
    );
    const grid = container.querySelector("[style*='display: grid']")!;
    const errorSpan = grid.querySelectorAll("span")[1];
    expect(errorSpan).toHaveStyle({ visibility: "hidden" });
  });

  it("has role=alert only when error is present", () => {
    const { rerender } = render(
      <StableField reserve="Error">
        <input />
      </StableField>
    );
    expect(screen.queryByRole("alert")).toBeNull();

    rerender(
      <StableField error="Required" reserve="Error">
        <input />
      </StableField>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("passes through className and style", () => {
    const { container } = render(
      <StableField reserve="E" className="my-field" style={{ marginTop: "8px" }}>
        <input />
      </StableField>
    );
    const el = container.firstElementChild!;
    expect(el).toHaveClass("my-field");
    expect(el).toHaveStyle({ marginTop: "8px" });
  });

  it("reserve node has pointerEvents none", () => {
    render(
      <StableField reserve="Error text">
        <input />
      </StableField>
    );
    const reserveNode = screen.getByText("Error text");
    expect(reserveNode).toHaveStyle({ pointerEvents: "none" });
  });

  it("accepts ReactNode for error and reserve", () => {
    render(
      <StableField
        error={<span data-testid="err">Bad!</span>}
        reserve={<span data-testid="res">Maximum error text</span>}
      >
        <input />
      </StableField>
    );
    expect(screen.getByTestId("err")).toBeVisible();
    expect(screen.getByTestId("res")).toBeInTheDocument();
  });
});
