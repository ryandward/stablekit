import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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
  it("renders children when not loading", () => {
    render(<TextSkeleton loading={false}>Hello</TextSkeleton>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(document.querySelector(".sk-shimmer-line")).toBeNull();
  });

  it("renders shimmer with inert ghost when loading", () => {
    render(<TextSkeleton loading={true}>Hello</TextSkeleton>);
    expect(document.querySelector(".sk-shimmer-line")).toBeTruthy();
    const inert = document.querySelector("[inert]");
    expect(inert).toBeTruthy();
    expect(inert?.textContent).toBe("Hello");
  });

  it("falls back to LoadingContext", () => {
    render(
      <LoadingContext loading={true}>
        <TextSkeleton>Name</TextSkeleton>
      </LoadingContext>
    );
    expect(document.querySelector(".sk-shimmer-line")).toBeTruthy();
  });

  it("renders as span by default", () => {
    const { container } = render(<TextSkeleton loading={false}>X</TextSkeleton>);
    expect(container.querySelector("span")).toBeTruthy();
  });

  it("renders custom element via as prop", () => {
    const { container } = render(<TextSkeleton loading={false} as="div">X</TextSkeleton>);
    expect(container.querySelector("div")).toBeTruthy();
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

  it("shows shimmer inside LoadingBoundary", () => {
    render(
      <LoadingContext loading={true}>
        <StableText as="h2">User Name</StableText>
      </LoadingContext>
    );
    expect(document.querySelector("h2 .sk-shimmer-line")).toBeTruthy();
  });

  it("shows content when not loading", () => {
    render(<StableText>Content</StableText>);
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(document.querySelector(".sk-shimmer-line")).toBeNull();
  });
});

describe("LoadingBoundary", () => {
  it("renders children with loading context", () => {
    render(
      <LoadingBoundary loading={true} exitDuration={150}>
        <StableText as="p">User Name</StableText>
      </LoadingBoundary>
    );
    expect(document.querySelector(".sk-shimmer-line")).toBeTruthy();
  });

  it("removes shimmer when loading becomes false", async () => {
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

    // useLoadingExit uses setTimeout(0) — wait for it to resolve.
    await vi.waitFor(() => {
      expect(document.querySelector(".sk-shimmer-line")).toBeNull();
    });
    expect(screen.getByText("User Name")).toBeInTheDocument();
  });

  it("applies sk-size-ratchet class", () => {
    const { container } = render(
      <LoadingBoundary loading={false} exitDuration={150}>
        <p>Content</p>
      </LoadingBoundary>
    );
    expect(container.querySelector(".sk-size-ratchet")).toBeTruthy();
  });
});
