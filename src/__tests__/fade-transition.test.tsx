import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FadeTransition } from "../index";

describe("FadeTransition", () => {
  it("mounts content when show is true", () => {
    render(<FadeTransition show={true}>Content</FadeTransition>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("does not mount content when show is false", () => {
    render(<FadeTransition show={false}>Content</FadeTransition>);
    expect(screen.queryByText("Content")).toBeNull();
  });

  it("applies entering class on mount", () => {
    const { container } = render(<FadeTransition show={true}>Content</FadeTransition>);
    expect(container.querySelector(".sk-fade-entering")).toBeTruthy();
  });

  it("applies sk-fade base class", () => {
    const { container } = render(<FadeTransition show={true}>Content</FadeTransition>);
    expect(container.querySelector(".sk-fade")).toBeTruthy();
  });

  it("supports custom element via as prop", () => {
    const { container } = render(<FadeTransition show={true} as="section">Content</FadeTransition>);
    expect(container.querySelector("section.sk-fade")).toBeTruthy();
  });
});
