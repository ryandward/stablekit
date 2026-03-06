import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SizeRatchet } from "../index";

describe("SizeRatchet", () => {
  it("renders with sk-size-ratchet class", () => {
    const { container } = render(<SizeRatchet>Content</SizeRatchet>);
    expect(container.querySelector(".sk-size-ratchet")).toBeTruthy();
  });

  it("supports custom className", () => {
    const { container } = render(<SizeRatchet className="my-class">Content</SizeRatchet>);
    const el = container.querySelector(".sk-size-ratchet");
    expect(el?.classList.contains("my-class")).toBe(true);
  });

  it("renders custom element via as prop", () => {
    const { container } = render(<SizeRatchet as="section">Content</SizeRatchet>);
    expect(container.querySelector("section.sk-size-ratchet")).toBeTruthy();
  });

  it("renders children", () => {
    const { container } = render(<SizeRatchet><p>Inner</p></SizeRatchet>);
    expect(container.querySelector("p")?.textContent).toBe("Inner");
  });

  it("accepts resetKey prop without error", () => {
    const { rerender } = render(<SizeRatchet resetKey="v1">Content A</SizeRatchet>);
    // Changing resetKey should not throw
    rerender(<SizeRatchet resetKey="v2">Content B</SizeRatchet>);
    expect(true).toBe(true);
  });
});
