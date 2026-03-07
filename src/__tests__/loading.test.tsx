import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  LoadingBoundary,
  LoadingContext,
  StableText,
  TextSkeleton,
  useLoadingState,
} from "../index";

describe("LoadingContext", () => {
  function StatusDisplay() {
    const loading = useLoadingState();
    return <p data-testid="status">{loading ? "loading" : "ready"}</p>;
  }

  it("provides loading=true to descendants", () => {
    render(
      <LoadingContext loading={true}>
        <StatusDisplay />
      </LoadingContext>
    );
    expect(screen.getByTestId("status")).toHaveTextContent("loading");
  });

  it("provides loading=false to descendants", () => {
    render(
      <LoadingContext loading={false}>
        <StatusDisplay />
      </LoadingContext>
    );
    expect(screen.getByTestId("status")).toHaveTextContent("ready");
  });

  it("defaults to false when no provider", () => {
    render(<StatusDisplay />);
    expect(screen.getByTestId("status")).toHaveTextContent("ready");
  });
});

describe("TextSkeleton", () => {
  it("both layers always present in DOM", () => {
    const { container } = render(<TextSkeleton loading={false}>Hello</TextSkeleton>);
    expect(container.querySelector(".sk-shimmer-line")).toBeTruthy();
    expect(container.querySelector(".sk-loading-layer:not(.sk-shimmer-line)")).toBeTruthy();
  });

  it("uses inline-grid for layer stacking", () => {
    const { container } = render(<TextSkeleton loading={false}>X</TextSkeleton>);
    expect((container.firstElementChild as HTMLElement).style.display).toBe("inline-grid");
  });

  it("shimmer visible and content hidden when loading", () => {
    const { container } = render(<TextSkeleton loading={true}>Hello</TextSkeleton>);
    const shimmer = container.querySelector(".sk-shimmer-line") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
    const content = shimmer.nextElementSibling as HTMLElement;
    expect(content.style.opacity).toBe("0");
    expect(content).toHaveAttribute("inert");
  });

  it("shimmer hidden and content visible when not loading", () => {
    const { container } = render(<TextSkeleton loading={false}>Hello</TextSkeleton>);
    const shimmer = container.querySelector(".sk-shimmer-line") as HTMLElement;
    expect(shimmer.style.opacity).toBe("0");
    const content = shimmer.nextElementSibling as HTMLElement;
    expect(content.style.opacity).toBe("1");
    expect(content).not.toHaveAttribute("inert");
    expect(content.textContent).toBe("Hello");
  });

  it("shimmer is aria-hidden", () => {
    const { container } = render(<TextSkeleton loading={false}>X</TextSkeleton>);
    const shimmer = container.querySelector(".sk-shimmer-line");
    expect(shimmer).toHaveAttribute("aria-hidden", "true");
  });

  it("falls back to LoadingContext", () => {
    const { container } = render(
      <LoadingContext loading={true}>
        <TextSkeleton>Name</TextSkeleton>
      </LoadingContext>
    );
    const shimmer = container.querySelector(".sk-shimmer-line") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
  });

  it("renders as span by default", () => {
    const { container } = render(<TextSkeleton loading={false}>X</TextSkeleton>);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("renders custom element via as prop", () => {
    const { container } = render(<TextSkeleton loading={false} as="div">X</TextSkeleton>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});

describe("StableText", () => {
  it("renders as p by default", () => {
    const { container } = render(<StableText>Hello</StableText>);
    expect(container.querySelector("p")).toBeTruthy();
  });

  it("renders custom element via as prop", () => {
    const { container } = render(<StableText as="h1">Title</StableText>);
    expect(container.querySelector("h1")).toBeTruthy();
  });

  it("shows shimmer inside LoadingContext", () => {
    const { container } = render(
      <LoadingContext loading={true}>
        <StableText as="h2">User Name</StableText>
      </LoadingContext>
    );
    const shimmer = container.querySelector("h2 .sk-shimmer-line") as HTMLElement;
    expect(shimmer).toBeTruthy();
    expect(shimmer.style.opacity).toBe("1");
  });

  it("shows content when not loading", () => {
    const { container } = render(<StableText>Content</StableText>);
    // Both layers have the text; content layer is visible
    const contentLayer = container.querySelector(".sk-loading-layer:not(.sk-shimmer-line)") as HTMLElement;
    expect(contentLayer.textContent).toBe("Content");
    expect(contentLayer.style.opacity).toBe("1");
    const shimmer = container.querySelector(".sk-shimmer-line") as HTMLElement;
    expect(shimmer.style.opacity).toBe("0");
  });
});

describe("LoadingBoundary", () => {
  it("renders children with loading context", () => {
    const { container } = render(
      <LoadingBoundary loading={true} exitDuration={150}>
        <StableText as="p">User Name</StableText>
      </LoadingBoundary>
    );
    const shimmer = container.querySelector(".sk-shimmer-line") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
  });

  it("shows content when loading becomes false", () => {
    const { rerender } = render(
      <LoadingBoundary loading={true} exitDuration={0}>
        <StableText as="p">User Name</StableText>
      </LoadingBoundary>
    );

    rerender(
      <LoadingBoundary loading={false} exitDuration={0}>
        <StableText as="p">User Name</StableText>
      </LoadingBoundary>
    );

    // No timeout — opacity changes synchronously
    const shimmer = document.querySelector(".sk-shimmer-line") as HTMLElement;
    expect(shimmer.style.opacity).toBe("0");
    const contentLayer = document.querySelector(".sk-loading-layer:not(.sk-shimmer-line)") as HTMLElement;
    expect(contentLayer.textContent).toBe("User Name");
    expect(contentLayer.style.opacity).toBe("1");
  });

  it("applies sk-size-ratchet class", () => {
    const { container } = render(
      <LoadingBoundary loading={false} exitDuration={150}>
        <p>Content</p>
      </LoadingBoundary>
    );
    expect(container.querySelector(".sk-size-ratchet")).toBeTruthy();
  });

  it("sets --sk-exit-duration CSS variable", () => {
    const { container } = render(
      <LoadingBoundary loading={false} exitDuration={200}>
        <p>Content</p>
      </LoadingBoundary>
    );
    const ratchet = container.querySelector(".sk-size-ratchet") as HTMLElement;
    expect(ratchet.style.getPropertyValue("--sk-exit-duration")).toBe("200ms");
  });
});
